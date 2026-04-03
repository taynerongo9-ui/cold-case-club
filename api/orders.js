/**
 * COLD CASE CLUB — Order Management API
 *
 * GET /api/orders?key=ADMIN_KEY — View all orders (admin only)
 * POST /api/orders — Stripe webhook (signature verified)
 */

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature' });
    return res.end();
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // GET — Admin view orders (requires ADMIN_KEY)
  if (req.method === 'GET') {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || req.query.key !== adminKey) {
      res.writeHead(401, headers);
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    // CORS only for admin GET
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!kvUrl || !kvToken) {
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ orders: [], note: 'KV not configured' }));
    }

    try {
      const data = await kvFetch(kvUrl, kvToken, '/zrange/orders/0/-1');
      const orders = (data?.result || []).map(item => {
        try { return JSON.parse(item); } catch { return { raw: item }; }
      }).reverse();

      res.writeHead(200, headers);
      return res.end(JSON.stringify({ count: orders.length, orders }));
    } catch (err) {
      res.writeHead(500, headers);
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // POST — Stripe webhook ONLY (signature verified)
  if (req.method === 'POST') {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers['stripe-signature'];

    // Get raw body for signature verification
    let rawBody = '';
    if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf8');
    } else if (req.body) {
      rawBody = JSON.stringify(req.body);
    }

    // Verify Stripe signature if webhook secret is configured
    if (webhookSecret) {
      if (!signature) {
        console.error('[ORDERS] Missing Stripe-Signature header');
        res.writeHead(401, headers);
        return res.end(JSON.stringify({ error: 'Missing signature' }));
      }

      try {
        verifyStripeSignature(rawBody, signature, webhookSecret);
      } catch (err) {
        console.error('[ORDERS] Invalid signature:', err.message);
        res.writeHead(401, headers);
        return res.end(JSON.stringify({ error: 'Invalid signature' }));
      }
    } else {
      console.warn('[ORDERS] STRIPE_WEBHOOK_SECRET not set — accepting unverified webhooks');
    }

    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      res.writeHead(400, headers);
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }

    // Only accept checkout.session.completed events
    if (body.type !== 'checkout.session.completed') {
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ received: true, ignored: true }));
    }

    const session = body.data?.object;
    if (!session) {
      res.writeHead(400, headers);
      return res.end(JSON.stringify({ error: 'Invalid payload' }));
    }

    const order = {
      id: session.id,
      email: session.customer_details?.email || session.customer_email || 'unknown',
      name: session.customer_details?.name || 'unknown',
      plan: session.metadata?.plan || 'prepaid',
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      shipping: session.shipping_details || session.collected_information?.shipping_details || null,
      status: 'unfulfilled',
      founding_investigator: session.metadata?.founding_investigator === 'true',
      created: new Date().toISOString(),
      stripe_payment_intent: session.payment_intent,
    };

    // Store order
    if (kvUrl && kvToken) {
      const score = Date.now();
      await kvFetch(kvUrl, kvToken, `/zadd/orders/${score}/${encodeURIComponent(JSON.stringify(order))}`);
    }

    // Notify webhook
    const notifyUrl = process.env.WEBHOOK_URL;
    if (notifyUrl) {
      fetch(notifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          notifyUrl.includes('discord.com')
            ? { content: `NEW ORDER: ${escapeHtml(order.name)} (${escapeHtml(order.email)}) — ${order.plan} $${order.amount} ${order.founding_investigator ? 'Founding Investigator' : ''}` }
            : { text: `New order: ${escapeHtml(order.email)} — ${order.plan} $${order.amount}` }
        ),
      }).catch(() => {});
    }

    console.log(`[ORDER] ${order.email} — ${order.plan} $${order.amount}`);

    res.writeHead(200, headers);
    return res.end(JSON.stringify({ received: true }));
  }

  res.writeHead(405, headers);
  return res.end(JSON.stringify({ error: 'Method not allowed' }));
};

// Stripe signature verification (without SDK)
function verifyStripeSignature(payload, header, secret) {
  const parts = header.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = parts.t;
  const expectedSig = parts.v1;

  if (!timestamp || !expectedSig) {
    throw new Error('Invalid signature header format');
  }

  // Check timestamp tolerance (5 minutes)
  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (now - parseInt(timestamp) > tolerance) {
    throw new Error('Timestamp outside tolerance');
  }

  const signedPayload = `${timestamp}.${payload}`;
  const computedSig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  if (computedSig !== expectedSig) {
    throw new Error('Signature mismatch');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

async function kvFetch(kvUrl, kvToken, path) {
  const response = await fetch(`${kvUrl}${path}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  return response.json();
}
