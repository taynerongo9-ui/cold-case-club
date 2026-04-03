/**
 * COLD CASE CLUB — Order Management API
 *
 * GET /api/orders?key=ADMIN_KEY — View all orders (admin only)
 * POST /api/orders — Stripe webhook creates order record
 *
 * Simple fulfillment dashboard — no Shopify needed.
 * Orders stored in Vercel KV. View in browser at /admin.
 */

module.exports = async function handler(req, res) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    return res.end();
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // GET — Admin view orders
  if (req.method === 'GET') {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || req.query.key !== adminKey) {
      res.writeHead(401, headers);
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    if (!kvUrl || !kvToken) {
      // No KV — return empty
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ orders: [], note: 'KV not configured. Orders logged to function logs.' }));
    }

    try {
      const data = await kvFetch(kvUrl, kvToken, '/zrange/orders/0/-1');
      const orders = (data?.result || []).map(item => {
        try { return JSON.parse(item); } catch { return { raw: item }; }
      }).reverse(); // newest first

      res.writeHead(200, headers);
      return res.end(JSON.stringify({ count: orders.length, orders }));
    } catch (err) {
      res.writeHead(500, headers);
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // POST — Receive order (from Stripe webhook or manual)
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }

    // Handle Stripe webhook event
    if (body.type === 'checkout.session.completed') {
      const session = body.data?.object;
      if (!session) {
        res.writeHead(400, headers);
        return res.end(JSON.stringify({ error: 'Invalid webhook payload' }));
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
      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            webhookUrl.includes('discord.com')
              ? { content: `🎉 NEW ORDER! ${order.name} (${order.email}) — ${order.plan} $${order.amount} ${order.founding_investigator ? '⭐ Founding Investigator' : ''}` }
              : { text: `New order: ${order.email} — ${order.plan} $${order.amount}` }
          ),
        }).catch(() => {});
      }

      console.log(`[ORDER] ${order.email} — ${order.plan} $${order.amount}`);

      res.writeHead(200, headers);
      return res.end(JSON.stringify({ received: true }));
    }

    // Manual order creation
    const order = {
      id: `manual_${Date.now()}`,
      email: body.email || 'unknown',
      name: body.name || 'unknown',
      plan: body.plan || 'prepaid',
      amount: body.amount || 74.99,
      currency: 'usd',
      shipping: body.shipping || null,
      status: 'unfulfilled',
      founding_investigator: true,
      created: new Date().toISOString(),
    };

    if (kvUrl && kvToken) {
      const score = Date.now();
      await kvFetch(kvUrl, kvToken, `/zadd/orders/${score}/${encodeURIComponent(JSON.stringify(order))}`);
    }

    console.log(`[ORDER MANUAL] ${order.email} — ${order.plan} $${order.amount}`);

    res.writeHead(200, headers);
    return res.end(JSON.stringify({ received: true, order }));
  }

  res.writeHead(405, headers);
  return res.end(JSON.stringify({ error: 'Method not allowed' }));
};

async function kvFetch(kvUrl, kvToken, path) {
  const response = await fetch(`${kvUrl}${path}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  return response.json();
}
