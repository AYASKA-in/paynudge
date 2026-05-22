import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app';
import { BaseRepository } from '../../server/repositories/baseRepository';
import { getPrismaClient } from '../../server/db/client';

const app = createApp();
const prisma = getPrismaClient();

describe('API Route Integration Tests', () => {
  it('should retrieve list of invoices successfully', async () => {
    const res = await request(app)
      .get('/api/ledger/invoices')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('amount');
  });

  it('should trigger nudge successfully for a specific invoice', async () => {
    const logSpy = vi.spyOn(BaseRepository, 'logActivity').mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/ledger/invoices/INV-8951/trigger-nudge')
      .send({ channel: 'WhatsApp' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Job registered on background queue');

    logSpy.mockRestore();
  });

  it('should process partial payment successfully', async () => {
    const logSpy = vi.spyOn(BaseRepository, 'logActivity').mockResolvedValue(undefined);
    const findUniqueSpy = vi.spyOn(prisma.invoiceDue, 'findUnique').mockResolvedValue({
      id: 'INV-8923',
      amount: 10000,
      partialAmountPaid: 2000,
      paymentStatus: 'Partially_Paid',
      businessId: 'biz-1',
      customerId: 'cust-1',
      dueDate: '2026-06-01',
      createdAt: new Date(),
    } as any);

    const res = await request(app)
      .post('/api/ledger/invoices/INV-8923/partial-payment')
      .send({ paidAmount: 3000 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain(' installment payment of ₹3000 processed successfully');

    logSpy.mockRestore();
    findUniqueSpy.mockRestore();
  });

  it('should fail partial payment when paidAmount is missing or non-positive', async () => {
    const res1 = await request(app)
      .post('/api/ledger/invoices/INV-8923/partial-payment')
      .send({ paidAmount: -100 })
      .expect(400);

    expect(res1.body.success).toBe(false);
    expect(res1.body.error).toContain('Positive numerical amount required');
  });

  it('should update invoice operational settings successfully', async () => {
    const logSpy = vi.spyOn(BaseRepository, 'logActivity').mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/ledger/invoices/INV-8951/update-ops')
      .send({
        isDisputed: true,
        disputeReason: 'Price disagreement'
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Successfully saved operational states');

    logSpy.mockRestore();
  });

  it('should return health check properties', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('operational');
    expect(res.body).toHaveProperty('tenancy');
  });

  it('should return diagnostic telemetry snapshots', async () => {
    const res = await request(app)
      .get('/api/system/diagnostics')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('redis');
    expect(res.body).toHaveProperty('worker');
    expect(res.body).toHaveProperty('queue');
  });
});
