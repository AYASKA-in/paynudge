import axios from 'axios';
import { circuitBreakersRegistry, retryWithBackoff } from './resilience';

export interface MessagePayload {
  recipientPhoneOrEmail: string;
  clientName: string;
  invoiceId: string;
  amountDue: number;
  dueDate: string;
  paymentLink: string;
  topic: 'polite' | 'first' | 'overdue' | 'final' | 'receipt';
}

/**
 * Compliance check to comply with TRAI Indian telecom guidance (no retail debt alerts 9 PM to 8 AM)
 */
export function isWithinComplianceHours(): boolean {
  const indianDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hour = indianDate.getHours();
  // Standard follow-up active hours
  return hour >= 8 && hour < 21;
}

/**
 * Pluggable Meta WhatsApp Cloud Integration Carrier
 */
export class WhatsAppCarrier {
  private static readonly META_API_VERSION = 'v18.0';

  /**
   * Invokes the Meta WhatsApp Cloud API to dispatch unified template messages.
   * If credentials are unset, falls back gracefully to standard terminal simulators.
   */
  static async sendReminder(payload: MessagePayload): Promise<{ success: boolean; providerId?: string; error?: string }> {
    const phoneId = process.env.META_WA_PHONE_NUMBER_ID;
    const token = process.env.META_WA_ACCESS_TOKEN;

    if (!isWithinComplianceHours()) {
      return {
        success: false,
        error: "TRAI Compliance: Nudge blocked outside active business call/SMS hours (9 PM to 8 AM IST)."
      };
    }

    if (!phoneId || !token) {
      console.log(`[WhatsApp-Sandbox-Simulation] Direct warning message to phone ${payload.recipientPhoneOrEmail}:`);
      console.log(`> Topic: [${payload.topic}] Client: ${payload.clientName} | Amount: ₹${payload.amountDue} | Due: ${payload.dueDate}`);
      return {
        success: true,
        providerId: `meta_sim_${Math.floor(Math.random() * 9999999)}`
      };
    }

    const cleanedPhone = payload.recipientPhoneOrEmail.replace(/\D/g, '');
    const metaUrl = `https://graph.facebook.com/${this.META_API_VERSION}/${phoneId}/messages`;

    const templateNameMap = {
      polite: 'paynudge_polite_reminder',
      first: 'paynudge_first_reminder',
      overdue: 'paynudge_overdue_warning',
      final: 'paynudge_final_legal',
      receipt: 'paynudge_payment_received_receipt'
    };

    const templateName = templateNameMap[payload.topic] || templateNameMap.polite;

    try {
      const response = await circuitBreakersRegistry.WhatsApp.execute(() =>
        retryWithBackoff(() =>
          axios.post(
            metaUrl,
            {
              messaging_product: 'whatsapp',
              to: cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`,
              type: 'template',
              template: {
                name: templateName,
                language: {
                  code: 'en_US'
                },
                components: [
                  {
                    type: 'body',
                    parameters: [
                      { type: 'text', text: payload.clientName },
                      { type: 'text', text: `₹${payload.amountDue.toLocaleString('en-IN')}` },
                      { type: 'text', text: payload.dueDate },
                      { type: 'text', text: payload.paymentLink }
                    ]
                  }
                ]
              }
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        )
      );

      return {
        success: true,
        providerId: response.data.messages?.[0]?.id
      };
    } catch (err: any) {
      console.error("❌ Meta WhatsApp API Dispatch Failed:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.error?.message || err.message
      };
    }
  }
}

/**
 * Resend Professional Email Carrier
 */
export class EmailCarrier {
  static async sendReminder(payload: MessagePayload, businessName: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const resendKey = process.env.RESEND_API_KEY;

    if (!resendKey) {
      console.log(`[Resend-Sandbox-Simulation] Dispatched outstanding ledger digest to address ${payload.recipientPhoneOrEmail}:`);
      console.log(`> Subject: Outstanding Payments Notification | Balance Due: INR ${payload.amountDue}`);
      return {
        success: true,
        messageId: `resend_sim_${Math.floor(Math.random() * 9999999)}`
      };
    }

    try {
      const response = await circuitBreakersRegistry.Resend.execute(() =>
        retryWithBackoff(() =>
          axios.post(
            'https://api.resend.com/emails',
            {
              from: 'billing@paynudge.in',
              to: payload.recipientPhoneOrEmail,
              subject: `⚠️ Urgent reminder: Follow-up Account balance verification with ${businessName}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e4e0ec; border-radius: 12px;">
                  <h2 style="color: #3b2fe2; margin-top: 0;">Payment Reminder Notification</h2>
                  <p>Hi <b>${payload.clientName}</b>,</p>
                  <p>This is an automated operational notice regarding outstanding items in your invoice ledger with <b>${businessName}</b>.</p>
                  <p>Please note that <b>INR ${payload.amountDue.toLocaleString('en-IN')}</b> is pending. The scheduled reconciliation due date was <b>${payload.dueDate}</b>.</p>
                  <div style="background-color: #f6f5fa; padding: 16px; border-radius: 8px; margin: 20px 0; font-family: monospace;">
                    Invoice ID: #${payload.invoiceId}<br/>
                    Total Due: INR ${payload.amountDue.toLocaleString('en-IN')}<br/>
                    Status: Pending Overdue Settlement
                  </div>
                  <p>You can settle this instantly through direct secure UPI links by scanning or clicking the button below:</p>
                  <a href="${payload.paymentLink}" style="display: inline-block; background-color: #3b2fe2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Verify & Pay via UPI</a>
                  <p style="margin-top: 24px; font-size: 11px; color: #7a7a93;">Powered by PayNudge Compliance Engine • Automated Professional Accounts.</p>
                </div>
              `
            },
            {
              headers: {
                Authorization: `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
              }
            }
          )
        )
      );

      return {
        success: true,
        messageId: response.data.id
      };
    } catch (err: any) {
      console.error("❌ Resend Email Carrier Transmission Error:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message
      };
    }
  }
}
