import { describe, it, expect, vi } from 'vitest';
import { PaymentsService } from '../../server/services/payments';
import { WhatsAppCarrier, EmailCarrier, isWithinComplianceHours } from '../../server/services/messageCarriers';
import { CircuitBreaker } from '../../server/services/resilience';

describe('PaymentsService Unit Tests', () => {
  it('should generate valid UPI deep link following BHIM specifications', () => {
    const link = PaymentsService.generateUPILink(
      'upi@merchant',
      'Test Merchant',
      'INV-101',
      5000
    );
    expect(link).toBe('upi://pay?pa=upi%40merchant&pn=Test%20Merchant&tr=INV-101&am=5000&cu=INR&tn=PayNudge_Ledger_INV-101');
  });
});

describe('Compliance Hours Unit Tests', () => {
  it('should evaluate TRAI Indian telecom compliance boundary constraints', () => {
    // Save timezone or evaluate boundaries
    const originalDate = Date;
    
    // Mock hour at 10 AM (Compliant)
    const mockDateCompliant = new Date('2026-05-21T10:00:00+05:30');
    global.Date = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length > 0) {
          return new originalDate(...(args as [any]));
        }
        super();
        return mockDateCompliant;
      }
    } as any;
    expect(isWithinComplianceHours()).toBe(true);

    // Mock hour at 11 PM (Non-compliant, debt recovery nudge blocked)
    const mockDateNonCompliant = new Date('2026-05-21T23:00:00+05:30');
    global.Date = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length > 0) {
          return new originalDate(...(args as [any]));
        }
        super();
        return mockDateNonCompliant;
      }
    } as any;
    expect(isWithinComplianceHours()).toBe(false);

    // Restore Date
    global.Date = originalDate;
  });
});

describe('CircuitBreaker Unit Tests', () => {
  it('should transition from CLOSED -> OPEN when failure threshold exceeded', async () => {
    const breaker = new CircuitBreaker('TestService', 2, 1000); // 2 failure limit, 1s cooldown
    let executions = 0;

    const failingCall = async () => {
      executions++;
      throw new Error('API Timeout');
    };

    // First attempt fails, breaker stays CLOSED
    await expect(breaker.execute(failingCall)).rejects.toThrow('API Timeout');
    expect(breaker.getTelemetry().state).toBe('CLOSED');
    expect(breaker.getTelemetry().failures).toBe(1);

    // Second attempt fails, trips the breaker to OPEN
    await expect(breaker.execute(failingCall)).rejects.toThrow('API Timeout');
    expect(breaker.getTelemetry().state).toBe('OPEN');
    expect(breaker.getTelemetry().failures).toBe(2);

    // Third attempt is short-circuited immediately without running the call
    await expect(breaker.execute(failingCall)).rejects.toThrow(/OFFLINE/);
    expect(executions).toBe(2); // Call was not executed again
  });

  it('should transition from OPEN -> HALF_OPEN -> CLOSED on successful execution after cooldown', async () => {
    const breaker = new CircuitBreaker('TestRecovery', 1, 50); // 1 failure threshold, 50ms cooldown
    
    // Trip the breaker
    await expect(breaker.execute(async () => { throw new Error('Fail'); })).rejects.toThrow('Fail');
    expect(breaker.getTelemetry().state).toBe('OPEN');

    // Wait for cooldown to expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    // Next call should probe and transition to HALF_OPEN, then CLOSED on success
    const result = await breaker.execute(async () => 'OK');
    expect(result).toBe('OK');
    expect(breaker.getTelemetry().state).toBe('CLOSED');
    expect(breaker.getTelemetry().failures).toBe(0);
  });
});

describe('WhatsApp and Email Sandbox Simulators', () => {
  it('should fallback gracefully to terminal simulators if credentials are unset', async () => {
    // Set Date mock compliant for compliance check
    const originalDate = Date;
    const mockDateCompliant = new Date('2026-05-21T10:00:00+05:30');
    global.Date = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length > 0) {
          return new originalDate(...(args as [any]));
        }
        super();
        return mockDateCompliant;
      }
    } as any;

    const waResult = await WhatsAppCarrier.sendReminder({
      recipientPhoneOrEmail: '9876543210',
      clientName: 'Rahul Kumar',
      invoiceId: 'INV-001',
      amountDue: 2500,
      dueDate: '2026-06-01',
      paymentLink: 'http://test/pay',
      topic: 'polite'
    });

    expect(waResult.success).toBe(true);
    expect(waResult.providerId).toContain('meta_sim_');

    const emailResult = await EmailCarrier.sendReminder({
      recipientPhoneOrEmail: 'rahul@test.com',
      clientName: 'Rahul Kumar',
      invoiceId: 'INV-001',
      amountDue: 2500,
      dueDate: '2026-06-01',
      paymentLink: 'http://test/pay',
      topic: 'polite'
    }, 'Test Corp');

    expect(emailResult.success).toBe(true);
    expect(emailResult.messageId).toContain('resend_sim_');

    // Restore Date
    global.Date = originalDate;
  });
});
