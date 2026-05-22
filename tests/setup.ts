import { vi, beforeEach } from 'vitest';

// Prevent actual network dispatch attempts by setting credentials to empty strings
process.env.NODE_ENV = 'test';
process.env.STRICT_AUTH = 'false';
process.env.META_WA_PHONE_NUMBER_ID = '';
process.env.META_WA_ACCESS_TOKEN = '';
process.env.RESEND_API_KEY = '';
process.env.RAZORPAY_KEY_ID = '';
process.env.RAZORPAY_KEY_SECRET = '';
process.env.DATABASE_URL = '';
process.env.REDIS_URL = '';

beforeEach(() => {
  vi.clearAllMocks();
});
