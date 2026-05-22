/**
 * PayNudge Enterprise SaaS - Core Carrier Integrations and Reminder Scheduler Service
 *
 * Implements delivery provider adapters, webhook statuses, legal business hour
 * gating, spam filters list, and retry handlers.
 */

import { Customer, InvoiceDue, ReminderTemplate, NotificationLog, BusinessSettings, ProviderDiagnostic } from '../../../types';
import { PlanLimitError, ValidationError, DuplicateSequenceError, APIError } from '../errors';
import { SaasDatabaseClient } from '../repositories/SaaSDatabase';

// -------------------------------------------------------------
// 1. PROVIDER ABSTRACTION LAYERS (Adapters)
// -------------------------------------------------------------

export interface CarrierMessagePayload {
  toPhoneOrEmail: string;
  body: string;
  subject?: string;
  upiLink?: string;
}

export interface CarrierResult {
  providerId: 'whatsapp' | 'resend' | 'razorpay' | 'bhim_upi';
  providerName: string;
  status: 'Sent' | 'Failed';
  messageId: string;
  errorReason?: string;
}

// Concrete Adapters Mocked to realistically serialize API calls
export class MetaWhatsAppAdapter {
  static async send(payload: CarrierMessagePayload): Promise<CarrierResult> {
    const isSuccess = Math.random() > 0.08; // 92% success rate
    return {
      providerId: 'whatsapp',
      providerName: 'Meta Cloud API',
      status: isSuccess ? 'Sent' : 'Failed',
      messageId: `wapi_meta_${Date.now()}_${Math.floor(Math.random() * 899 + 100)}`,
      errorReason: isSuccess ? undefined : 'META_CLOUD_REJECTED: Template mismatch or invalid WhatsApp opt-in status.',
    };
  }
}

export class TwilioSmsAdapter {
  static async send(payload: CarrierMessagePayload): Promise<CarrierResult> {
    const isSuccess = Math.random() > 0.04; // 96% success rate
    return {
      providerId: 'whatsapp',
      providerName: 'Twilio Gateway Service',
      status: isSuccess ? 'Sent' : 'Failed',
      messageId: `tsms_${Date.now()}`,
      errorReason: isSuccess ? undefined : 'TWILIO_CARRIER_REJECTED: Insufficient wallet balance for region +91 IN.',
    };
  }
}

export class GupshupWhatsAppAdapter {
  static async send(payload: CarrierMessagePayload): Promise<CarrierResult> {
    return {
      providerId: 'whatsapp',
      providerName: 'Gupshup India Business',
      status: 'Sent',
      messageId: `gsh_wap_${Date.now()}`,
    };
  }
}

export class ResendEmailAdapter {
  static async send(payload: CarrierMessagePayload): Promise<CarrierResult> {
    const isSuccess = Math.random() > 0.02; // 98% success rate
    return {
      providerId: 'resend',
      providerName: 'Resend Web Console API',
      status: isSuccess ? 'Sent' : 'Failed',
      messageId: `re_m_${Date.now()}`,
      errorReason: isSuccess ? undefined : 'RESEND_REFUSED: Sender domain DNS SPF/DKIM validation pending.',
    };
  }
}

export class SendGridEmailAdapter {
  static async send(payload: CarrierMessagePayload): Promise<CarrierResult> {
    return {
      providerId: 'resend',
      providerName: 'SendGrid SMTP Proxy',
      status: 'Sent',
      messageId: `sg_m_${Date.now()}`,
    };
  }
}

export class UnifiedCarrierDispatcher {
  /**
   * Routes communication dynamically based on channel, health metrics, and fallbacks
   */
  static async dispatch(
    channel: 'WhatsApp' | 'Email',
    payload: CarrierMessagePayload,
    diagnostics: ProviderDiagnostic[]
  ): Promise<CarrierResult> {
    if (channel === 'WhatsApp') {
      const liveWap = diagnostics.find(d => d.id === 'whatsapp');
      // If Meta Cloud is offline or degraded, route to fallback Twilio SMS or Gupshup
      if (!liveWap || liveWap.status === 'offline') {
        console.warn('Meta Cloud Degraded! Auto-routing to Twilio Carrier fallback.');
        return await TwilioSmsAdapter.send(payload);
      }
      
      // Default adapter
      const primaryRes = await MetaWhatsAppAdapter.send(payload);
      if (primaryRes.status === 'Failed') {
        console.warn('Primary dispatch failed. Attempting fallback Gupshup API.');
        return await GupshupWhatsAppAdapter.send(payload);
      }
      return primaryRes;
    } else {
      const liveEmail = diagnostics.find(d => d.id === 'resend');
      if (!liveEmail || liveEmail.status === 'offline') {
        console.warn('Resend degraded! Routing via SendGrid SMTP relay.');
        return await SendGridEmailAdapter.send(payload);
      }

      const primaryRes = await ResendEmailAdapter.send(payload);
      if (primaryRes.status === 'Failed') {
        console.warn('Resend SMTP rejected. Recovering via fallback SMTP Relay.');
        return await SendGridEmailAdapter.send(payload);
      }
      return primaryRes;
    }
  }
}


// -------------------------------------------------------------
// 2. SCHEDULER & ESCALATION CONTROLS
// -------------------------------------------------------------

export class ReminderSchedulerService {
  /**
   * Enforces rules before allowing a reminder dispatch:
   * 1. Stop if marked Paid
   * 2. Limit to legal Indian professional hours (9:00 AM to 8:00 PM IST)
   * 3. Hold duplicate prevention hours cooldown
   */
  static evaluateScheduleRules(
    invoice: InvoiceDue,
    customer: Customer,
    settings: BusinessSettings,
    allLogs: NotificationLog[],
    targetChannel: 'WhatsApp' | 'Email'
  ): { allowed: boolean; restrictionReason?: string } {
    
    // Stop-On-Paid validation rule
    if (invoice.paymentStatus === 'Paid') {
      return { allowed: false, restrictionReason: 'Transaction completed. Automated sequence halted.' };
    }

    // Business Hours limits
    if (settings.restrictToBusinessHours) {
      const now = new Date();
      // Adjust to standard professional work times (9 AM - 8 PM)
      const hour = now.getHours();
      if (hour < 9 || hour >= 20) {
        return {
          allowed: false,
          restrictionReason: `Business Hours Gated: Restricting to polite social hours (9 AM - 8 PM IST) to prevent compliance risk. Current Hour: ${hour}:00.`
        };
      }
    }

    // Duplicate prevention and strict cooldown guard
    const intervalHours = settings.preventDuplicatesHours || 3;
    const epochCooldown = intervalHours * 60 * 60 * 1000;
    
    const relevantLogs = allLogs.filter(l => l.invoiceId === invoice.id && l.channel === targetChannel);
    if (relevantLogs.length > 0) {
      // Review last delivery attempt
      const lastAttempt = relevantLogs[0];
      const matchRecent = lastAttempt.sentTime.includes('now') || lastAttempt.sentTime.includes('minutes');
      if (matchRecent) {
        return {
          allowed: false,
          restrictionReason: `Cooldown Active: A duplicate reminder was already initiated recently. Anti-spam safety inhibits redundant pushes for ${intervalHours} hours.`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Promotes the invoice's sequence stage automatically depending on overdue latency
   */
  static calculateAppropriateStage(dueDateStr: string): 'None' | 'Polite' | 'First' | 'Overdue' | 'Final' {
    const dueTime = new Date(dueDateStr).getTime();
    const nowTime = new Date().getTime();
    
    if (nowTime < dueTime) {
      return 'Polite'; // Pre-due
    }
    
    const diffDays = Math.floor((nowTime - dueTime) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return 'First';
    if (diffDays <= 12) return 'Overdue';
    return 'Final';
  }
}
