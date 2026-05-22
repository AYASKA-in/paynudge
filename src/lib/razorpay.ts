/**
 * Razorpay Standard Web Checkout Integration Utility
 */

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  amountInPaise: number;
  currency: string;
  invoiceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  businessName: string;
  onSuccess: (paymentDetails: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (errorMessage: string) => void;
}

/**
 * Invokes standard Razorpay modal trigger sequence by dynamically loading script
 * and passing standard parameters.
 */
export async function triggerRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    options.onFailure("Could not load the Razorpay payment gateway script. Please check your internet connectivity.");
    return;
  }

  try {
    // 1. Backend Endpoint: POST /api/create-order
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: options.amountInPaise,
        currency: options.currency,
        receipt: `rcpt_paynudge_${options.invoiceId}_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Could not generate transaction order with PayNudge billing backend.");
    }

    const orderData = await response.json();
    const orderId = orderData.order_id;

    // Use environment variable VITE_RAZORPAY_KEY_ID or fallback
    const razorpayKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_SrhhWwclpQz2dM';

    // 2. Open standard web modal
    const razorpayConfig = {
      key: razorpayKeyId,
      amount: options.amountInPaise,
      currency: options.currency,
      name: options.businessName || "PayNudge Small Business",
      description: `Collection Ref Invoice #${options.invoiceId}`,
      image: "https://miro.medium.com/max/1200/1*98t0RzO0o4j8p_C6SAtlyA.png", // Stand-in logo, safe
      order_id: orderId,
      handler: async function (paymentResponse: any) {
        // Successful checkout! Send payload elements to backend verification endpoint
        try {
          const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }),
          });

          const verificationResult = await verifyResponse.json();

          if (verifyResponse.ok && verificationResult.success) {
            options.onSuccess({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
          } else {
            options.onFailure(verificationResult.error || "Payment verification failed. Potential signature mismatch.");
          }
        } catch (err: any) {
          options.onFailure(err.message || "Failed to reach backend verification endpoint.");
        }
      },
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: {
        color: "#3525cd", // Brand color
      },
      modal: {
        ondismiss: function () {
          options.onFailure("Payment process cancelled by the customer.");
        },
      },
    };

    const rzpClient = new (window as any).Razorpay(razorpayConfig);
    
    // Listen to failed receipts
    rzpClient.on('payment.failed', function (resp: any) {
      options.onFailure(resp.error.description || "The payment transaction failed.");
    });

    rzpClient.open();
  } catch (error: any) {
    options.onFailure(error.message || "Error setting up payment execution session.");
  }
}
