import { Request, Response, NextFunction } from 'express';

/**
 * Enforces production-grade secure HTTP response headers (CSP, HSTS, frame protection).
 */
export function secureHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // 2. Disable MIME Sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 3. Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 4. Force HTTPS (Strict-Transport-Security) for 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // 5. Basic Content-Security-Policy (CSP)
  // Ensures default assets load from self or specific CDN scopes used by Razorpay/Meta
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*.razorpay.com; connect-src 'self' https://api.razorpay.com https://graph.facebook.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://api.razorpay.com;"
  );

  // 6. Cross-Origin Embedder/Opener/Resource Policies
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
}
