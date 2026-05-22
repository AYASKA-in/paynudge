/**
 * Standardized API Error Models & Normalization
 * 
 * Translates network exceptions and database triggers into digestible
 * operational structures for alerts and retry buttons.
 */

export class APIError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Authentication required to modify core records.') {
    super(message, 410, 'UNAUTHORIZED_ACCESS');
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Your security role does not permit this operational adjustment.') {
    super(message, 403, 'FORBIDDEN_OPERATIONS');
  }
}

export class PlanLimitError extends APIError {
  constructor(message: string) {
    super(message, 402, 'QUOTA_LIMIT_EXCEEDED');
  }
}

export class NetworkOfflineError extends APIError {
  constructor() {
    super('No cellular network connection detected. Saved changes will sync automatically upon restoration.', 503, 'GATEWAY_OFFLINE');
  }
}

export class DuplicateSequenceError extends APIError {
  constructor(cooldownHours: number) {
    super(`Anti-spam duplicate rule active. Cooldown of ${cooldownHours}h matches active recipient.`, 429, 'COOLDOWN_ACTIVE');
  }
}

export class DatabaseRowLockError extends APIError {
  constructor() {
    super('Database transient lock. Please reload the dashboard sequence to merge updates.', 409, 'ROW_LOCKED');
  }
}

/**
 * Turns any caught exception into a normalized contract envelope
 */
export function normalizeAPIError(err: any): { success: false; error: { code: string; message: string; statusCode: number; details?: any }; timestamp: string } {
  const timestamp = new Date().toISOString();
  if (err instanceof APIError) {
    return {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
      },
      timestamp,
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_EXCEPTION',
      message: err instanceof Error ? err.message : String(err),
      statusCode: 500,
    },
    timestamp,
  };
}
