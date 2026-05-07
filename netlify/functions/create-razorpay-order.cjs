// netlify/functions/create-razorpay-order.cjs
// CommonJS (.cjs) — required because package.json has "type": "module".
// Uses RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (NOT VITE_ prefixed).
// These are only ever accessed on the server — never exposed to the browser.

'use strict';

const Razorpay = require('razorpay');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[create-razorpay-order] ERROR: Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Payment gateway is not configured on the server.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (parseErr) {
    console.error('[create-razorpay-order] ERROR: Could not parse request body:', parseErr.message);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { amount, currency = 'INR' } = body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    console.error('[create-razorpay-order] ERROR: Invalid amount received:', amount);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid amount.' }) };
  }

  // Razorpay receipt must be <= 40 characters.
  // Use base-36 timestamp (shorter than decimal) to stay well within the limit.
  // e.g. "r_" + Date.now().toString(36) = "r_" + ~8 chars = ~10 chars total.
  const receipt = `r_${Date.now().toString(36)}`;

  const amountInPaise = Math.round(amount * 100);

  console.log(`[create-razorpay-order] Creating order: amount=${amountInPaise} paise, currency=${currency}, receipt=${receipt}`);

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
    });

    console.log('[create-razorpay-order] SUCCESS: Order created:', order.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      }),
    };
  } catch (err) {
    // Log the full Razorpay error object for debugging
    const rzpError = err.error || err;
    console.error('[create-razorpay-order] Razorpay API error:', JSON.stringify(rzpError, null, 2));
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: rzpError.description || rzpError.message || 'Failed to create payment order.',
        code: rzpError.code || undefined,
      }),
    };
  }
};
