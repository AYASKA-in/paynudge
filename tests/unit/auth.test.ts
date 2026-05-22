import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSessionFromHeaders, requireAuth } from '../../server/auth/authHandler';
import { Request, Response } from 'express';

describe('Authentication Unit Tests', () => {
  beforeEach(() => {
    delete process.env.STRICT_AUTH;
  });

  const mockRequest = (authHeader?: string): Request => {
    return {
      headers: {
        authorization: authHeader
      }
    } as unknown as Request;
  };

  it('should parse valid JWT bearer token format and map parameters correctly', () => {
    const sessionClaims = {
      sub: 'user_101',
      email: 'user@test.in',
      businessId: 'biz_abc_123',
      role: 'OWNER'
    };
    
    // Create base64 encoded token representation
    const headerStr = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payloadStr = JSON.stringify(sessionClaims);
    const mockToken = `Bearer ${Buffer.from(headerStr).toString('base64')}.${Buffer.from(payloadStr).toString('base64')}.signature`;

    const req = mockRequest(mockToken);
    const session = getSessionFromHeaders(req);

    expect(session).not.toBeNull();
    expect(session?.userId).toBe('user_101');
    expect(session?.businessId).toBe('biz_abc_123');
    expect(session?.role).toBe('OWNER');
  });

  it('should fall back to development preview profile when STRICT_AUTH is false', () => {
    process.env.STRICT_AUTH = 'false';
    const req = mockRequest(); // no authorization header
    const session = getSessionFromHeaders(req);

    expect(session).not.toBeNull();
    expect(session?.userId).toBe('usr-9428');
    expect(session?.businessId).toBe('biz-bhomia-tuitions');
    expect(session?.role).toBe('OWNER');
  });

  it('should return null when STRICT_AUTH is true and headers are missing', () => {
    process.env.STRICT_AUTH = 'true';
    const req = mockRequest();
    const session = getSessionFromHeaders(req);

    expect(session).toBeNull();
  });

  it('should authorize request and call next when role matches required credentials', () => {
    const sessionClaims = { sub: 'usr-1', role: 'ADMIN', businessId: 'biz-1' };
    const mockToken = `Bearer {}.${Buffer.from(JSON.stringify(sessionClaims)).toString('base64')}.sig`;

    const req = mockRequest(mockToken) as any;
    const res = {} as Response;
    const next = vi.fn();

    const middleware = requireAuth(['ADMIN', 'OWNER']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.session).toBeDefined();
    expect(req.session.role).toBe('ADMIN');
  });

  it('should reject access with 403 status when user possesses insufficient roles', () => {
    const sessionClaims = { sub: 'usr-1', role: 'STAFF', businessId: 'biz-1' };
    const mockToken = `Bearer {}.${Buffer.from(JSON.stringify(sessionClaims)).toString('base64')}.sig`;

    const req = mockRequest(mockToken) as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;
    const next = vi.fn();

    const middleware = requireAuth(['OWNER']);
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
