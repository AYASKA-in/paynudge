import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Helper to get Razorpay instance lazily
function getRazorpayInstance(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured.");
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export class RazorpayController {
  /**
   * STEP 1: BACKEND - Create Order
   * Endpoint: POST /api/create-order
   */
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { amount, currency = 'INR', receipt } = req.body;

      // 1. Validate amount >= 100 paise
      const amountInPaise = Number(amount);
      if (isNaN(amountInPaise) || amountInPaise < 100) {
        res.status(400).json({
          success: false,
          error: "Validation failed: Minimum required transaction amount is 100 paise (₹1)."
        });
        return;
      }

      const client = getRazorpayInstance();
      const receiptId = receipt || `rcpt_paynudge_${Date.now()}`;

      // If Razorpay instance is not ready, we can return a friendly simulation configuration
      if (!client) {
        console.log(`[Razorpay-Simulation] Generating fake Order ID for value: ${amountInPaise} paise`);
        res.status(200).json({
          order_id: `ord_sim_${Math.random().toString(36).substring(2, 11)}`,
          amount: amountInPaise,
          currency: currency
        });
        return;
      }

      // Call Razorpay API to generate realistic order ID
      const order = await client.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receiptId,
      });

      res.status(200).json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (err: any) {
      console.error("❌ Razorpay Create Order Endpoint Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Failed to establish payment intent with Razorpay services."
      });
    }
  }

  /**
   * STEP 3: BACKEND - Verify Signature
   * Endpoint: POST /api/verify-payment
   */
  static async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({
          success: false,
          error: "Authentication failed: Missing required signature verification parameters."
        });
        return;
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keySecret) {
        // Fallback for simulation testing when credentials are empty
        console.warn("⚠️ RAZORPAY_KEY_SECRET is not configured. Mock-verifying the signature.");
        res.status(200).json({
          success: true,
          message: "Payment signature verified successfully (Sandbox Simulation)."
        });
        return;
      }

      // Compute algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const dataToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(dataToSign)
        .digest('hex');

      if (generatedSignature === razorpay_signature) {
        res.status(200).json({
          success: true,
          message: "Payment verified successfully."
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Signature mismatch. Blocked due to possible ledger tampering."
        });
      }
    } catch (err: any) {
      console.error("❌ Razorpay Signature Verification Error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Friction encountered in the payment signature validation pipelines."
      });
    }
  }
}
