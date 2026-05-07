// netlify/functions/send-order-emails.cjs
// CommonJS (.cjs) — required because package.json has "type": "module".
// Sends two branded HTML emails via Resend after a successful payment:
//   1. Order confirmation to the customer
//   2. Order details to the store owner

'use strict';

const { Resend } = require('resend');

const STORE_OWNER_EMAIL = 'adijain1106@gmail.com';
const STORE_NAME = 'CookieGod Official Store';

// ─── HTML Email Templates ────────────────────────────────────────────────────

function buildCustomerEmailHtml({ customerName, orderId, paymentId, items, total, address }) {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #1e2a4a; color: #c8c4ba;">
          ${item.name}
          ${item.selectedSize ? `<span style="color:#8892a4; font-size:12px;"> · Size: ${item.selectedSize}</span>` : ''}
          ${item.selectedColor ? `<span style="color:#8892a4; font-size:12px;"> · ${item.selectedColor}</span>` : ''}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #1e2a4a; color: #c8c4ba; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #1e2a4a; color: #f97316; text-align: right; font-weight: 600;">&#8377;${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0; padding:0; background-color:#040f2a; font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="text-align:center; margin-bottom:40px;">
      <h1 style="color:#ece8dd; font-size:28px; margin:0; letter-spacing:1px;">${STORE_NAME}</h1>
      <p style="color:#8892a4; margin:8px 0 0;">Your order has been confirmed!</p>
    </div>
    <div style="background:rgba(20,40,87,0.6); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:32px;">
      <h2 style="color:#ece8dd; font-size:20px; margin:0 0 4px;">Hi ${customerName}!</h2>
      <p style="color:#8892a4; margin:0 0 24px;">Thank you for your order. We're processing it and will keep you updated.</p>
      <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:16px; margin-bottom:24px;">
        <p style="color:#8892a4; font-size:12px; margin:0 0 4px; text-transform:uppercase; letter-spacing:1px;">Order ID</p>
        <p style="color:#f97316; font-family:monospace; font-size:14px; margin:0;">${orderId}</p>
        <p style="color:#8892a4; font-size:12px; margin:8px 0 4px; text-transform:uppercase; letter-spacing:1px;">Payment ID</p>
        <p style="color:#f97316; font-family:monospace; font-size:14px; margin:0;">${paymentId}</p>
      </div>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left; color:#8892a4; font-size:12px; padding:8px; text-transform:uppercase; letter-spacing:1px;">Product</th>
            <th style="text-align:center; color:#8892a4; font-size:12px; padding:8px; text-transform:uppercase; letter-spacing:1px;">Qty</th>
            <th style="text-align:right; color:#8892a4; font-size:12px; padding:8px; text-transform:uppercase; letter-spacing:1px;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="border-top:2px solid rgba(249,115,22,0.3); padding-top:16px; text-align:right;">
        <span style="color:#8892a4; font-size:14px;">Total Paid: </span>
        <span style="color:#f97316; font-size:22px; font-weight:700;">&#8377;${total.toFixed(2)}</span>
      </div>
      <div style="margin-top:24px; padding:16px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
        <p style="color:#8892a4; font-size:12px; margin:0 0 8px; text-transform:uppercase; letter-spacing:1px;">Shipping To</p>
        <p style="color:#c8c4ba; margin:0; line-height:1.6;">
          ${address.fullName}<br/>
          ${address.address}<br/>
          ${address.pincode}<br/>
          ${address.mobile}
        </p>
      </div>
    </div>
    <div style="text-align:center; margin-top:32px;">
      <p style="color:#8892a4; font-size:12px;">Questions? Reply to this email or contact us.</p>
      <p style="color:#4a5568; font-size:11px; margin-top:16px;">&#169; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildOwnerEmailHtml({ orderId, paymentId, customerDetails, items, total }) {
  const itemList = items
    .map(
      (item) =>
        `&#8226; ${item.name} (x${item.quantity})${item.selectedSize ? ` | Size: ${item.selectedSize}` : ''}${item.selectedColor ? ` | Color: ${item.selectedColor}` : ''} &#8212; &#8377;${(item.price * item.quantity).toFixed(2)}`
    )
    .join('<br/>');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0; padding:0; background-color:#040f2a; font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="background:rgba(20,40,87,0.7); border:1px solid rgba(249,115,22,0.3); border-radius:16px; padding:32px;">
      <h2 style="color:#f97316; margin:0 0 8px;">New Order Received!</h2>
      <p style="color:#8892a4; margin:0 0 24px; font-size:14px;">A new order has been placed on ${STORE_NAME}.</p>
      <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
        <tr><td style="color:#8892a4; padding:8px 0; font-size:12px; text-transform:uppercase;">Order ID</td><td style="color:#ece8dd; font-family:monospace;">${orderId}</td></tr>
        <tr><td style="color:#8892a4; padding:8px 0; font-size:12px; text-transform:uppercase;">Payment ID</td><td style="color:#ece8dd; font-family:monospace;">${paymentId}</td></tr>
        <tr><td style="color:#8892a4; padding:8px 0; font-size:12px; text-transform:uppercase;">Total</td><td style="color:#f97316; font-weight:700; font-size:18px;">&#8377;${total.toFixed(2)}</td></tr>
      </table>
      <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; margin-bottom:20px;">
        <h3 style="color:#ece8dd; font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Customer</h3>
        <p style="color:#c8c4ba; margin:4px 0; font-size:14px;">${customerDetails.fullName}</p>
        <p style="color:#c8c4ba; margin:4px 0; font-size:14px;">${customerDetails.email}</p>
        <p style="color:#c8c4ba; margin:4px 0; font-size:14px;">${customerDetails.mobile}</p>
        <p style="color:#c8c4ba; margin:4px 0; font-size:14px;">${customerDetails.address}, ${customerDetails.pincode}</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
        <h3 style="color:#ece8dd; font-size:14px; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Items</h3>
        <p style="color:#c8c4ba; font-size:14px; line-height:2;">${itemList}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('[send-order-emails] ERROR: Missing RESEND_API_KEY env var.');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Email service is not configured.' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (parseErr) {
    console.error('[send-order-emails] ERROR: Could not parse request body:', parseErr.message);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { orderId, paymentId, customerDetails, items, total } = body;

  if (!orderId || !paymentId || !customerDetails || !items || total == null) {
    console.error('[send-order-emails] ERROR: Missing required fields in body.');
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required order data.' }) };
  }

  const resend = new Resend(resendApiKey);
  const errors = [];

  // 1. Send confirmation to customer
  try {
    const result = await resend.emails.send({
      from: `${STORE_NAME} <onboarding@resend.dev>`,
      to: [customerDetails.email],
      subject: `Order Confirmed! #${orderId.slice(-8).toUpperCase()}`,
      html: buildCustomerEmailHtml({
        customerName: customerDetails.fullName,
        orderId,
        paymentId,
        items,
        total,
        address: customerDetails,
      }),
    });
    console.log('[send-order-emails] Customer email sent. ID:', result.id || result.data?.id);
  } catch (err) {
    console.error('[send-order-emails] Failed to send customer email:', err.message);
    errors.push(`customer: ${err.message}`);
  }

  // 2. Send order details to store owner
  try {
    const result = await resend.emails.send({
      from: `${STORE_NAME} <onboarding@resend.dev>`,
      to: [STORE_OWNER_EMAIL],
      subject: `New Order - Rs.${Number(total).toFixed(2)} from ${customerDetails.fullName}`,
      html: buildOwnerEmailHtml({ orderId, paymentId, customerDetails, items, total }),
    });
    console.log('[send-order-emails] Owner email sent. ID:', result.id || result.data?.id);
  } catch (err) {
    console.error('[send-order-emails] Failed to send owner email:', err.message);
    errors.push(`owner: ${err.message}`);
  }

  if (errors.length === 2) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Both emails failed to send.', details: errors }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, partialErrors: errors.length > 0 ? errors : undefined }),
  };
};
