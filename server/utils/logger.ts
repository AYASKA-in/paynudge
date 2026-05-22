import { getCorrelationId } from '../middleware/correlationId';

export interface LogPayload {
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
  correlationId?: string;
  [key: string]: any;
}

/**
 * Handles log writes by mapping them to JSON in production and readable console structures in dev.
 * Automatically appends request context correlation trace IDs.
 */
function writeLog(level: 'info' | 'warn' | 'error' | 'debug', message: string, meta?: Record<string, any>) {
  const correlationId = getCorrelationId();
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    ...meta,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, emit raw structured JSON on standard output
    console.log(JSON.stringify(payload));
  } else {
    // In development, pretty-print outputs with ANSI color codes
    const trace = correlationId ? ` [trace:${correlationId.slice(0, 8)}]` : '';
    const metaStr = meta && Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    const colorMap = {
      info: '\x1b[36mINFO\x1b[0m',
      warn: '\x1b[33mWARN\x1b[0m',
      error: '\x1b[31mERROR\x1b[0m',
      debug: '\x1b[90mDEBUG\x1b[0m',
    };
    console.log(`[${payload.timestamp}] ${colorMap[level]}${trace}: ${message}${metaStr}`);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, any>) => writeLog('info', message, meta),
  warn: (message: string, meta?: Record<string, any>) => writeLog('warn', message, meta),
  error: (message: string, err?: any, meta?: Record<string, any>) => {
    const errorMeta = err instanceof Error 
      ? { errorName: err.name, errorMessage: err.message, errorStack: err.stack, ...meta }
      : { errorDetails: err, ...meta };
    writeLog('error', message, errorMeta);
  },
  debug: (message: string, meta?: Record<string, any>) => writeLog('debug', message, meta),
};
