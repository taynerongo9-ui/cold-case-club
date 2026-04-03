/**
 * COLD CASE CLUB — Stripe Embedded Checkout API
 * POST /api/checkout  { plan: "prepaid" | "monthly" | "gift" }
 * Returns: { clientSecret: "cs_..." }
 */

module.exports = async function handler(req, res) {
  const headers = {
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    return res.end();
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  let body = req.body;
  if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }
  const plan = body.plan || 'prepaid';
  const siteUrl = process.env.SITE_URL || 'https://coldcaseclub.store';

  // Initialize stripe INSIDE handler so env vars are available
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('[CHECKOUT] STRIPE_SECRET_KEY not set');
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Stripe not configured' }));
  }

  const stripe = require('stripe')(secretKey);

  const prices = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    prepaid: process.env.STRIPE_PRICE_PREPAID,
    gift: process.env.STRIPE_PRICE_GIFT,
  };

  const priceId = prices[plan];
  if (!priceId) {
    console.error(`[CHECKOUT] No price ID for plan: ${plan}`);
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Price not configured' }));
  }

  try {
    const sessionConfig = {
      ui_mode: 'embedded_page',
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=${plan}`,
    };

    if (plan === 'monthly') {
      sessionConfig.mode = 'subscription';
    } else {
      sessionConfig.mode = 'payment';
    }

    if (plan === 'gift') {
      sessionConfig.custom_fields = [
        {
          key: 'recipient_name',
          label: { type: 'custom', custom: "Recipient's name" },
          type: 'text',
        },
        {
          key: 'gift_message',
          label: { type: 'custom', custom: 'Gift message (optional)' },
          type: 'text',
          optional: true,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ clientSecret: session.client_secret }));
  } catch (err) {
    console.error('[CHECKOUT ERROR]', err.message);
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: err.message }));
  }
};
