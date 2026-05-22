import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app';
import { getPrismaClient } from '../../server/db/client';
import { PaymentsService } from '../../server/services/payments';
import { WhatsAppCarrier } from '../../server/services/messageCarriers';
import { BaseRepository } from '../../server/repositories/baseRepository';

const app = createApp();
const prisma = getPrismaClient();

describe('E2E Collection Workflow Integration Tests', () => {
  it('should run through the complete invoice collections lifecycle successfully', async () => {
    // 1. Setup metadata values
    const mockInvoiceId = 'INV-8923';

    // 2. Trigger nudge alert (schedules task in BullMQ queue)
    const waSpy = vi.spyOn(WhatsAppCarrier, 'sendReminder').mockResolvedValue({ success: true, providerId: 'meta_test_123' });
    const logSpy = vi.spyOn(BaseRepository, 'logActivity').mockResolvedValue(undefined);

    const nudgeRes = await request(app)
      .post(`/api/ledger/invoices/${mockInvoiceId}/trigger-nudge`)
      .send({ channel: 'WhatsApp' })
      .expect(200);

    expect(nudgeRes.body.success).toBe(true);
    expect(nudgeRes.body.message).toContain('Job registered on background queue');

    // 3. Initiate payment order creation via Razorpay Controller
    const orderRes = await request(app)
      .post('/api/create-order')
      .send({ amount: 1250000, currency: 'INR', receipt: 'rcpt_e2e_1' })
      .expect(200);

    expect(orderRes.body).toHaveProperty('order_id');
    const orderId = orderRes.body.order_id;
    expect(orderId).toContain('ord_');

    // 4. Simulate payment captured callback received via Razorpay Webhook Ingress
    const signatureSpy = vi.spyOn(PaymentsService, 'verifyRazorpaySignature').mockReturnValue(true);
    const invoiceUpdateSpy = vi.spyOn(prisma.invoiceDue, 'update');
    const paymentCreateSpy = vi.spyOn(prisma.paymentRecord, 'create');
    const activitySpy = vi.spyOn(BaseRepository, 'logActivity');

    const paymentPayload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_captured_e2e',
            amount: 1250000, // INR 12500 in paise
            currency: 'INR',
            status: 'captured',
            notes: {
              invoiceId: mockInvoiceId
            },
            acquirer_data: {
              upi_transaction_id: 'UPI_E2E_TRANSACTION'
            }
          }
        }
      }
    };

    const webhookRes = await request(app)
      .post('/api/webhooks/razorpay')
      .set('x-razorpay-signature', 'mock_hash')
      .send(paymentPayload)
      .expect(200);

    expect(webhookRes.body.success).toBe(true);

    // 5. Verify the invoice status updates to Paid in DB update operations
    expect(invoiceUpdateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockInvoiceId },
        data: expect.objectContaining({
          paymentStatus: 'Paid',
          partialAmountPaid: 12500
        })
      })
    );

    // 6. Verify repayment log was saved
    expect(paymentCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          invoiceId: mockInvoiceId,
          amount: 12500,
          status: 'Settled',
          method: 'RAZORPAY',
          utrCode: 'UPI_E2E_TRANSACTION'
        })
      })
    );

    // 7. Verify E2E audit trail history logged
    expect(activitySpy).toHaveBeenCalledWith(
      'system',
      'WEBHOOK_RECONCILIATION',
      'Razorpay Daemon',
      expect.stringContaining(`Invoice #${mockInvoiceId} reconciled event payment.captured successfully`)
    );

    // Teardown mocks
    waSpy.mockRestore();
    logSpy.mockRestore();
    signatureSpy.mockRestore();
    invoiceUpdateSpy.mockRestore();
    paymentCreateSpy.mockRestore();
    activitySpy.mockRestore();
  });
});
