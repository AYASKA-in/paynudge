import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AsyncLocalStorage } from 'async_hooks';

export const correlationStore = new AsyncLocalStorage<string>();

/**
 * Assigns a unique request trace identifier if not already provided.
 * Runs downstream handlers within AsyncLocalStorage context.
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  res.setHeader('x-correlation-id', correlationId);
  
  // Attach correlation ID directly to request object for easy reference
  (req as any).correlationId = correlationId;

  correlationStore.run(correlationId, () => {
    next();
  });
}

/**
 * Retrieves the current execution thread correlation trace ID.
 */
export function getCorrelationId(): string | undefined {
  return correlationStore.getStore();
}
