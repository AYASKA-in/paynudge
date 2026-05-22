import crypto from 'crypto';
import { PaymentsService } from '../services/payments';
import { BaseRepository } from '../repositories/baseRepository';
import { getPrismaClient } from '../db/client';
import { logger } from '../utils/logger';

export interface RazorpayEventPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number; // in paise
        currency: string;
        status: string;
        notes: {
          invoiceId?: string;
        };
        acquirer_data?: {
          rrn?: string;
          upi_transaction_id?: string;
        };
      };
    };
  };
}

export class WebhookReconciliationHandler {
  /**
   * Safe processing endpoint for Meta WhatsApp messaging and delivery status updates.
   * Leverages verification tokens and processes delivery, read, and sent timestamps.
   */
  static processWhatsAppWebhook(query: any, body: any): { processed: boolean; challenge?: string } {
    const hubMode = query['hub.mode'];
    const hubChallenge = query['hub.challenge'];
    const hubVerifyToken = query['hub.verify_token'];

    // Handle Meta Verification Challenge Handshake
    const localVerifyToken = process.env.META_WA_VERIFY_TOKEN || 'paynudge_callback_token_2026';
    if (hubMode === 'subscribe' && hubVerifyToken === localVerifyToken) {
      logger.info("✅ Meta WhatsApp Webhook Callback Verified Successfully.");
      return { processed: true, challenge: hubChallenge };
    }

    if (!body || !body.entry) {
      return { processed: false };
    }

    // Capture delivery statuses and update notifications logs
    try {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;
          if (value.statuses) {
            for (const status of value.statuses) {
              const statusType = status.status; // 'sent', 'delivered', 'read', 'failed'
              const recipientId = status.recipient_id;
              logger.info(`[Meta-Webhook-Pulse] Status "${statusType}" received for message to ${recipientId}`, {
                statusType,
                recipientId,
                messageId: status.id
              });
            }
          }
        }
      }
    } catch (err: any) {
      logger.error("❌ Failed to process incoming WhatsApp webhook update payload", err);
    }

    return { processed: true };
  }

  /**
   * Seamless multi-reception processing for Razorpay Payment hooks.
   * Matches the invoice ID, authorizes signatures, and recalculates receivables safely.
   */
  static async processRazorpayWebhook(rawBody: string, signature: string, parsedEvent: RazorpayEventPayload): Promise<{ success: boolean; error?: string }> {
    // 1. Verify cryptographic HMAC signature
    const isValid = PaymentsService.verifyRazorpaySignature(rawBody, signature);
    if (!isValid) {
      logger.warn("🚫 Webhook signature validation failed or signature is invalid.");
      return { success: false, error: "Cryptographic check failed: Webhook signature is TAMPERED or invalid." };
    }

    const { event, payload } = parsedEvent;
    
    // 2. Filter for payment.captured or payment.failed
    if (event !== 'payment.captured' && event !== 'payment.failed') {
      return { success: true };
    }

    const paymentEntity = payload.payment.entity;
    const invoiceId = paymentEntity.notes.invoiceId;
    const paidAmount = paymentEntity.amount / 100; // convert paise to INR
    const utrCode = paymentEntity.acquirer_data?.upi_transaction_id || paymentEntity.acquirer_data?.rrn || paymentEntity.id;

    if (!invoiceId) {
      logger.warn("⚠️ Missing invoice ID in Razorpay webhook metadata notes.", { eventId: paymentEntity.id });
      return { success: false, error: "Missing invoice target metadata inside Razorpay note elements." };
    }

    const eventId = paymentEntity.id;
    const prisma = getPrismaClient();

    logger.info(`📡 [Webhook-Process] Received payment event ${event} for Invoice #${invoiceId}. Transaction: ${utrCode}`, {
      eventId,
      invoiceId,
      paidAmount,
      utrCode
    });

    try {
      // 3. Webhook Idempotency & Persistence Checking
      let existingEvent = null;
      try {
        existingEvent = await prisma.webhookEvent.findUnique({
          where: { externalId: eventId }
        });
      } catch (dbReadErr: any) {
        logger.warn("⚠️ Webhook event logging database handshake read skipped/delayed", dbReadErr);
      }

      if (existingEvent && existingEvent.processed) {
        logger.info(`ℹ️ Webhook Event #${eventId} has already been processed and reconciled. Skipping.`, { eventId });
        return { success: true };
      }

      if (!existingEvent) {
        try {
          existingEvent = await prisma.webhookEvent.create({
            data: {
              id: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              provider: 'Razorpay',
              externalId: eventId,
              payload: rawBody,
              processed: false
            }
          });
        } catch (createErr: any) {
          // Prisma P2002 is Unique constraint failed
          if (createErr.code === 'P2002') {
            logger.info(`ℹ️ Webhook Event #${eventId} created concurrently by another worker thread.`);
            existingEvent = await prisma.webhookEvent.findUnique({
              where: { externalId: eventId }
            });
            if (existingEvent && existingEvent.processed) {
              logger.info(`ℹ️ Webhook Event #${eventId} concurrently finished processing. Skipping.`);
              return { success: true };
            }
          } else {
            logger.warn("⚠️ Webhook event logging database write failed", createErr);
          }
        }
      }

      // 4. Transaction-safe database update block
      await prisma.$transaction(async (tx: any) => {
        if (event === 'payment.captured') {
          // Perform invoice schema state update
          await tx.invoiceDue.update({
            where: { id: invoiceId },
            data: {
              paymentStatus: 'Paid',
              partialAmountPaid: paidAmount,
              lastContactChannel: 'Razorpay Webhook Callback',
              lastContactDate: new Date().toISOString().split('T')[0],
            }
          });

          // Log unique payment record settle entry
          await tx.paymentRecord.create({
            data: {
              id: `pay_rzp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              invoiceId: invoiceId,
              amount: paidAmount,
              utrCode: utrCode,
              method: 'RAZORPAY',
              status: 'Settled',
            }
          });
        } else if (event === 'payment.failed') {
          // Perform invoice state update to Critical
          await tx.invoiceDue.update({
            where: { id: invoiceId },
            data: {
              paymentStatus: 'Critical',
              lastContactChannel: 'Razorpay Webhook (Failed Payment)',
              lastContactDate: new Date().toISOString().split('T')[0],
            }
          });

          // Log failed payment record
          await tx.paymentRecord.create({
            data: {
              id: `pay_rzp_fail_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              invoiceId: invoiceId,
              amount: paidAmount,
              utrCode: utrCode,
              method: 'RAZORPAY',
              status: 'Failed',
            }
          });
        }

        // Update Webhook Event Log status to complete (reconciled)
        await tx.webhookEvent.update({
          where: { externalId: eventId },
          data: { processed: true }
        });
      });

      // Record logs in workspace history records
      await BaseRepository.logActivity(
        'system',
        'WEBHOOK_RECONCILIATION',
        'Razorpay Daemon',
        `Invoice #${invoiceId} reconciled event ${event} successfully via transaction verification.`
      );
      
      logger.info(`✅ Webhook Event #${eventId} reconciled successfully.`, { eventId, invoiceId });
      return { success: true };
    } catch (err: any) {
      logger.error("❌ Webhook transactional processing error", err);
      return { success: false, error: `Recalculation error: ${err.message}` };
    }
  }
}
