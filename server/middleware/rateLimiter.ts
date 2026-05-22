import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

const memoryStore = new Map<string, number[]>();

/**
 * Creates a sliding-window rate limiter middleware instance.
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Resolve client IP address safely
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    let requestTimes = memoryStore.get(key) || [];
    
    // Filter out requests that occurred outside the active time window
    requestTimes = requestTimes.filter((time) => now - time < config.windowMs);

    if (requestTimes.length >= config.maxRequests) {
      logger.warn(`🚫 [Rate-Limit] Throttled request from IP ${ip} on path ${req.path}`, {
        ip,
        path: req.path,
        limit: config.maxRequests,
        windowMs: config.windowMs,
      });

      res.status(429).json({
        success: false,
        error: config.message,
      });
      return;
    }

    requestTimes.push(now);
    memoryStore.set(key, requestTimes);

    // Expose standard rate limiting headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', config.maxRequests - requestTimes.length);
    res.setHeader('X-RateLimit-Reset', new Date(now + config.windowMs).toISOString());

    next();
  };
}

// Rate limit settings for standard write paths (e.g. create orders, verify payments)
export const rateLimiterMiddleware = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 30,     // max 30 requests per minute
  message: 'Too many requests. Please slow down and try again after a minute.',
});

// Stricter rate limiting configuration dedicated to public webhook callbacks
export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 15,     // max 15 requests per minute on webhooks
  message: 'Too many webhook events received. Please regulate dispatcher payload rate.',
});
export const systemDiagnosticsRateLimiter = createRateLimiter({
  windowMs: 10 * 1000, // 10 second window
  maxRequests: 5,     // max 5 requests per 10 seconds (for dashboard polling)
  message: 'Diagnostics polling rate limit exceeded.',
});
