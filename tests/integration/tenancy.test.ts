import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app';
import { getPrismaClient } from '../../server/db/client';

const app = createApp();
const prisma = getPrismaClient();

describe('Multi-Tenant Isolation Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.STRICT_AUTH;
  });

  const generateMockToken = (claims: any): string => {
    const headerStr = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payloadStr = JSON.stringify(claims);
    return `Bearer ${Buffer.from(headerStr).toString('base64')}.${Buffer.from(payloadStr).toString('base64')}.sig`;
  };

  it('should restrict invoice lookup queries to Tenant A when token A is passed', async () => {
    const tokenA = generateMockToken({
      sub: 'user_a',
      email: 'a@tenant.com',
      businessId: 'biz_tenant_a',
      role: 'OWNER'
    });

    const findManySpy = vi.spyOn(prisma.invoiceDue, 'findMany').mockResolvedValue([]);

    await request(app)
      .get('/api/ledger/invoices')
      .set('Authorization', tokenA)
      .expect(200);

    // Verify Prisma query was filtered strictly by Tenant A businessId
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessId: 'biz_tenant_a' }
      })
    );
  });

  it('should restrict invoice lookup queries to Tenant B when token B is passed', async () => {
    const tokenB = generateMockToken({
      sub: 'user_b',
      email: 'b@tenant.com',
      businessId: 'biz_tenant_b',
      role: 'OWNER'
    });

    const findManySpy = vi.spyOn(prisma.invoiceDue, 'findMany').mockResolvedValue([]);

    await request(app)
      .get('/api/ledger/invoices')
      .set('Authorization', tokenB)
      .expect(200);

    // Verify Prisma query was filtered strictly by Tenant B businessId
    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessId: 'biz_tenant_b' }
      })
    );
  });

  it('should block ledger access in STRICT_AUTH mode when no auth header is present', async () => {
    process.env.STRICT_AUTH = 'true';

    await request(app)
      .get('/api/ledger/invoices')
      .expect(401);
  });

  it('should allow access in default development mode using fallback businessId', async () => {
    process.env.STRICT_AUTH = 'false';
    const findManySpy = vi.spyOn(prisma.invoiceDue, 'findMany').mockResolvedValue([]);

    await request(app)
      .get('/api/ledger/invoices')
      .expect(200);

    expect(findManySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { businessId: 'biz-bhomia-tuitions' }
      })
    );
  });
});
