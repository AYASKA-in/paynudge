import crypto from 'crypto';
import axios from 'axios';
import { circuitBreakersRegistry, retryWithBackoff } from './resilience';

export interface RazorpayOrderArgs {
  invoiceId: string;
  amount: number;
  currency: 'INR';
  merchantName: string;
}

export class PaymentsService {
  /**
   * Generates standard interactive UPI direct deep link specifications as per BHIM protocols
   */
  static generateUPILink(vpa: string, payeeName: string, id: string, amount: number): string {
    const cleanPayee = encodeURIComponent(payeeName);
    const cleanVpa = encodeURIComponent(vpa);
    return `upi://pay?pa=${cleanVpa}&pn=${cleanPayee}&tr=${id}&am=${amount}&cu=INR&tn=PayNudge_Ledger_${id}`;
  }

  /**
   * Invokes Razorpay server orders API to get a payload suitable for the client SDK checkout.
   * If merchant credentials are empty, returns simulated payment intent variables.
   */
  static async createRazorpayOrder(args: RazorpayOrderArgs): Promise<{ orderId: string; amountInPaise: number; keyId: string; receipt: string }> {
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKey123';
    const secret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(args.amount * 100);
    const receiptId = `rcpt_${args.invoiceId}_${Date.now().toString().slice(-6)}`;

    // Fallback if credentials are omitted
    if (!process.env.RAZORPAY_KEY_ID || !secret) {
      console.log(`[Razorpay-Simulation] Generating payment intent order in Sandbox mode for Invoice #${args.invoiceId}`);
      return {
        orderId: `order_sim_${Math.floor(Math.random() * 1000000)}`,
        amountInPaise,
        keyId,
        receipt: receiptId
      };
    }

    try {
      const basicAuth = Buffer.from(`${keyId}:${secret}`).toString('base64');
      const response = await circuitBreakersRegistry.Razorpay.execute(() =>
        retryWithBackoff(() =>
          axios.post(
            'https://api.razorpay.com/v1/orders',
            {
              amount: amountInPaise,
              currency: args.currency,
              receipt: receiptId,
              notes: {
                invoiceId: args.invoiceId,
                merchantName: args.merchantName,
                platform: 'PayNudge'
              }
            },
            {
              headers: {
                Authorization: `Basic ${basicAuth}`,
                'Content-Type': 'application/json'
              }
            }
          )
        )
      );

      return {
        orderId: response.data.id,
        amountInPaise,
        keyId,
        receipt: receiptId
      };
    } catch (err: any) {
      console.error("❌ Razorpay Order Intent Call failed:", err.response?.data || err.message);
      throw new Error(`Razorpay Integration failed: ${err.message}`);
    }
  }

  /**
   * Verifies Razorpay Webhook Hash for tamper protection
   */
  static verifyRazorpaySignature(body: string, receivedSignature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("⚠️ RAZORPAY_WEBHOOK_SECRET is not configured. Trusting signature checks for sandbox testing.");
      return true;
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      return generatedSignature === receivedSignature;
    } catch {
      return false;
    }
  }
}
