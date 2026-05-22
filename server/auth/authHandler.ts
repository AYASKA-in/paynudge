import { Request, Response, NextFunction } from 'express';

export interface AuthSession {
  userId: string;
  email: string;
  businessId: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  expires: string;
}

/**
 * Custom NextAuth compatible authorization header check and Express Session parser.
 * Provides fallback mock sessions when running preview environments.
 */
export function getSessionFromHeaders(req: Request): AuthSession | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      // Decode JWT safely
      const parsed = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return {
        userId: parsed.sub || parsed.userId,
        email: parsed.email || '',
        businessId: parsed.businessId || 'default-biz',
        role: parsed.role || 'STAFF',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
    } catch {
      if (process.env.STRICT_AUTH === 'true') {
        return null;
      }
    }
  }

  if (process.env.STRICT_AUTH === 'true') {
    return null;
  }

  // Developer preview fallbacks
  return {
    userId: 'usr-9428',
    email: 'rohitmoningi125@gmail.com',
    businessId: 'biz-bhomia-tuitions',
    role: 'OWNER',
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * Express Middleware to restrict access to authenticated merchants with specific roles
 */
export function requireAuth(allowedRoles: ('OWNER' | 'ADMIN' | 'STAFF')[] = ['OWNER', 'ADMIN', 'STAFF']) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = getSessionFromHeaders(req);
    
    if (!session) {
      res.status(401).json({ error: 'Unauthenticated path access' });
      return;
    }

    if (!allowedRoles.includes(session.role)) {
      res.status(403).json({ error: 'Permission Denied: Insufficient roles to access ledger resources.' });
      return;
    }

    // Attach parsed sessions to request context for downstream controllers
    (req as any).session = session;
    next();
  };
}
