/**
 * Utility class for retry backoffs with jitter and circuit-breaker state machines.
 */

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  factor = 2
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      // Exponential backoff with random jitter to prevent thundering herd
      const waitTime = delay * Math.pow(factor, attempt - 1) + Math.random() * 150;
      console.warn(`⚠️ [Retry-Broker] Attempt ${attempt} failed: ${err.message}. Retrying in ${Math.round(waitTime)}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerTelemetry {
  serviceName: string;
  state: CircuitBreakerState;
  failures: number;
  nextAttemptTime: string | null;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private failureThreshold: number;
  private cooldownPeriod: number;
  private nextAttemptTime = 0;
  private serviceName: string;

  constructor(serviceName: string, failureThreshold = 3, cooldownPeriodMs = 30000) {
    this.serviceName = serviceName;
    this.failureThreshold = failureThreshold;
    this.cooldownPeriod = cooldownPeriodMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now > this.nextAttemptTime) {
        this.state = 'HALF_OPEN';
        console.log(`🔌 [CircuitBreaker] ${this.serviceName} entered HALF_OPEN state. Probing connection...`);
      } else {
        const timeRemaining = Math.ceil((this.nextAttemptTime - now) / 1000);
        throw new Error(`[CircuitBreaker] ${this.serviceName} is OFFLINE (OPEN state). Cooling down for ${timeRemaining}s.`);
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.log(`🔌 [CircuitBreaker] ${this.serviceName} recovered successfully. State set to CLOSED.`);
      }
      return result;
    } catch (err: any) {
      this.failureCount++;
      console.warn(`🔌 [CircuitBreaker] ${this.serviceName} failure recorded (${this.failureCount}/${this.failureThreshold}): ${err.message}`);
      
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttemptTime = Date.now() + this.cooldownPeriod;
        console.error(`🔌 [CircuitBreaker] ${this.serviceName} state shifted to OPEN. Requests blocked until ${new Date(this.nextAttemptTime).toLocaleTimeString()}.`);
      }
      throw err;
    }
  }

  getTelemetry(): CircuitBreakerTelemetry {
    return {
      serviceName: this.serviceName,
      state: this.state,
      failures: this.failureCount,
      nextAttemptTime: this.state === 'OPEN' ? new Date(this.nextAttemptTime).toISOString() : null,
    };
  }
}

// Global registry of breakers to expose to telemetry routes
export const circuitBreakersRegistry: Record<string, CircuitBreaker> = {
  WhatsApp: new CircuitBreaker('WhatsApp', 3, 30000),
  Resend: new CircuitBreaker('Resend', 3, 30000),
  Razorpay: new CircuitBreaker('Razorpay', 3, 30000),
};
