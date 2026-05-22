import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app';
import { getPrismaClient } from '../../server/db/client';
import { PaymentsService } from '../../server/services/payments';

const app = createApp();
const prisma = getPrismaClient();

describe('Webhook Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Meta WhatsApp Webhook Handshake', () => {
    it('should return challenge token when verification token matches', async () => {
      const challenge = 'challenge_code_123';
      const verifyToken = process.env.META_WA_VERIFY_TOKEN || 'paynudge_callback_token_2026';

      const res = await request(app)
        .get('/api/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.challenge': challenge,
          'hub.verify_token': verifyToken
        })
        .expect(200);

      expect(res.text).toBe(challenge);
    });

    it('should reject verification request when verify_token is invalid', async () => {
      await request(app)
        .get('/api/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.challenge': 'code',
          'hub.verify_token': 'wrong_token'
        })
        .expect(403);
    });

    it('should accept message delivery reports status post payload', async () => {
      const payload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'wa_biz_1',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  statuses: [
                    {
                      id: 'msg_1',
                      status: 'delivered',
                      recipient_id: '919876543210',
                      timestamp: '1640000000'
                    }
                  ]
                },
                field: 'messages'
              }
            ]
          }
        ]
      };

      const res = await request(app)
        .post('/api/webhooks/whatsapp')
        .send(payload)
        .expect(200);

      expect(res.body).toEqual({ success: true });
    });
  });

  describe('Razorpay Webhook Payments Reconciliation', () => {
    it('should reject requests with missing signature header', async () => {
      await request(app)
        .post('/api/webhooks/razorpay')
        .send({ event: 'payment.captured' })
        .expect(400);
    });

    it('should reconcile successful payment and update invoice state to Paid', async () => {
      // Mock signature verification to bypass cryptographic check for simulation
      const signatureSpy = vi.spyOn(PaymentsService, 'verifyRazorpaySignature').mockReturnValue(true);
      
      const invoiceUpdateSpy = vi.spyOn(prisma.invoiceDue, 'update');
      const paymentCreateSpy = vi.spyOn(prisma.paymentRecord, 'create');
      const eventCreateSpy = vi.spyOn(prisma.webhookEvent, 'create');

      const paymentEventPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_captured_1',
              amount: 500000, // 5000 INR in paise
              currency: 'INR',
              status: 'captured',
              notes: {
                invoiceId: 'INV-8951'
              },
              acquirer_data: {
                upi_transaction_id: 'UPI9988776655'
              }
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/webhooks/razorpay')
        .set('x-razorpay-signature', 'valid_signature_hash')
        .send(paymentEventPayload)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify DB updates were triggered
      expect(eventCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            externalId: 'pay_captured_1',
            provider: 'Razorpay'
          })
        })
      );
      expect(invoiceUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'INV-8951' },
          data: expect.objectContaining({
            paymentStatus: 'Paid',
            partialAmountPaid: 5000
          })
        })
      );
      expect(paymentCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceId: 'INV-8951',
            amount: 5000,
            status: 'Settled',
            method: 'RAZORPAY',
            utrCode: 'UPI9988776655'
          })
        })
      );

      signatureSpy.mockRestore();
    });

    it('should reconcile failed payment and mark invoice status as Critical', async () => {
      const signatureSpy = vi.spyOn(PaymentsService, 'verifyRazorpaySignature').mockReturnValue(true);
      
      const invoiceUpdateSpy = vi.spyOn(prisma.invoiceDue, 'update');
      const paymentCreateSpy = vi.spyOn(prisma.paymentRecord, 'create');

      const paymentEventPayload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_1',
              amount: 500000,
              currency: 'INR',
              status: 'failed',
              notes: {
                invoiceId: 'INV-8951'
              }
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/webhooks/razorpay')
        .set('x-razorpay-signature', 'valid_sig')
        .send(paymentEventPayload)
        .expect(200);

      expect(res.body.success).toBe(true);

      expect(invoiceUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'INV-8951' },
          data: expect.objectContaining({
            paymentStatus: 'Critical'
          })
        })
      );
      expect(paymentCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            invoiceId: 'INV-8951',
            status: 'Failed',
            method: 'RAZORPAY'
          })
        })
      );

      signatureSpy.mockRestore();
    });

    it('should skip processing if webhook event was already reconciled (idempotency)', async () => {
      const signatureSpy = vi.spyOn(PaymentsService, 'verifyRazorpaySignature').mockReturnValue(true);
      
      // Mock event finding: event already exists and processed is true
      const eventFindSpy = vi.spyOn(prisma.webhookEvent, 'findUnique').mockResolvedValue({
        id: 'ev_123',
        provider: 'Razorpay',
        externalId: 'pay_dup_1',
        payload: '{}',
        processed: true,
        error: null,
        createdAt: new Date()
      });

      const invoiceUpdateSpy = vi.spyOn(prisma.invoiceDue, 'update');

      const paymentEventPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_dup_1',
              amount: 500000,
              currency: 'INR',
              status: 'captured',
              notes: {
                invoiceId: 'INV-8951'
              }
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/webhooks/razorpay')
        .set('x-razorpay-signature', 'valid_sig')
        .send(paymentEventPayload)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(eventFindSpy).toHaveBeenCalled();
      
      // Updates should be skipped because event was already marked processed
      expect(invoiceUpdateSpy).not.toHaveBeenCalled();

      signatureSpy.mockRestore();
    });
  });
});
