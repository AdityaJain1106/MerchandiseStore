// src/services/checkoutService.js
// Orchestrates the full Razorpay checkout flow:
//   1. Load the Razorpay SDK script
//   2. Create a Razorpay order via Netlify function
//   3. Open the Razorpay popup
//   4. On success: verify payment, save to Firestore, send emails, clear cart

import { saveOrderToFirestore } from '../firebase/orderService';

// ─── Script Loader ────────────────────────────────────────────────────────────

let razorpayScriptPromise = null;

export const loadRazorpayScript = () => {
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null; // Allow retry
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

// ─── API Helpers ──────────────────────────────────────────────────────────────

const FUNCTIONS_BASE = '/.netlify/functions';

const callFunction = async (name, payload) => {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `${name} failed with status ${res.status}`);
  return data;
};

// ─── Main Checkout Function ───────────────────────────────────────────────────

/**
 * Initiates the full Razorpay checkout flow.
 *
 * @param {object} params
 * @param {Array}  params.cart           - Current cart items
 * @param {number} params.total          - Total amount in INR
 * @param {object} params.customerDetails - Form data from checkout modal
 * @param {string} params.userId         - Firebase Auth UID (null if guest)
 * @param {string} params.userEmail      - Firebase Auth email (for guest fallback)
 * @param {Function} params.onSuccess    - Called with order details on success
 * @param {Function} params.onFailure    - Called with error message on failure
 * @param {Function} params.clearCart    - Zustand action to wipe cart state
 */
export const initiateRazorpayCheckout = async ({
  cart,
  total,
  customerDetails,
  userId,
  onSuccess,
  onFailure,
  clearCart,
}) => {
  // 1. Ensure SDK is loaded
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure('Failed to load the payment gateway. Please check your internet connection.');
    return;
  }

  // 2. Create Razorpay order on server
  // NOTE: receipt is generated server-side to ensure it's always under 40 chars.
  let razorpayOrderData;
  try {
    razorpayOrderData = await callFunction('create-razorpay-order', {
      amount: total,
      currency: 'INR',
    });
    console.log('[checkoutService] Order created successfully:', razorpayOrderData.orderId);
  } catch (err) {
    console.error('[checkoutService] create-razorpay-order failed:', err.message);
    onFailure(`Could not initiate payment: ${err.message}`);
    return;
  }

  const { orderId, amount, currency } = razorpayOrderData;

  // 3. Open Razorpay popup
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const options = {
    key: razorpayKeyId,
    amount,
    currency,
    name: 'CookieGod Official Store',
    description: `Order of ${cart.length} item(s)`,
    order_id: orderId,
    prefill: {
      name: customerDetails.fullName,
      email: customerDetails.email,
      contact: customerDetails.mobile,
    },
    theme: { color: '#f97316' },

    handler: async (response) => {
      // 4. Payment succeeded — persist to Firestore
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

      const firestoreUserId = userId || customerDetails.email;

      let firestoreSaved = false;
      try {
        await saveOrderToFirestore(firestoreUserId, {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          customerDetails,
          items: cart,
          totalAmount: total,
        });
        firestoreSaved = true;
      } catch (err) {
        console.error('[checkoutService] Firestore save failed:', err);
        // Don't fail the whole flow — payment succeeded
      }

      // 5. Send emails (non-blocking — fire and forget)
      callFunction('send-order-emails', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        customerDetails,
        items: cart,
        total,
      }).catch((err) => console.warn('[checkoutService] Email send failed (non-fatal):', err));

      // 6. Clear cart ONLY after successful payment
      clearCart();

      // 7. Notify parent component of success
      onSuccess({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: total,
        customerDetails,
        firestoreSaved,
      });
    },

    modal: {
      ondismiss: () => {
        onFailure('payment_cancelled');
      },
    },
  };

  const razorpayInstance = new window.Razorpay(options);

  razorpayInstance.on('payment.failed', (response) => {
    const errorMsg =
      response.error?.description || response.error?.reason || 'Payment failed. Please try again.';
    console.error('[checkoutService] payment.failed event:', response.error);
    onFailure(errorMsg);
  });

  console.log('[checkoutService] Opening Razorpay popup for order:', orderId);
  razorpayInstance.open();
};
