/**
 * COLD CASE CLUB — Stripe Embedded Checkout API
 * POST /api/checkout  { plan: "prepaid" | "monthly" | "gift" }
 * Returns: { clientSecret: "cs_..." }
 *
 * Uses fetch directly to Stripe API (no SDK) for reliability in serverless.
 */

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  prepaid: process.env.STRIPE_PRICE_PREPAID,
  gift: process.env.STRIPE_PRICE_GIFT,
};

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

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Stripe not configured' }));
  }

  let body = req.body;
  if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }
  const plan = body.plan || 'prepaid';
  const siteUrl = process.env.SITE_URL || 'https://coldcaseclub.store';

  const priceId = PRICES[plan];
  if (!priceId) {
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: `No price for plan: ${plan}` }));
  }

  // Build Stripe API form data
  const params = new URLSearchParams();
  params.append('ui_mode', 'embedded_page');
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  params.append('mode', plan === 'monthly' ? 'subscription' : 'payment');
  params.append('return_url', `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=${plan}`);

  if (plan === 'gift') {
    params.append('custom_fields[0][key]', 'recipient_name');
    params.append('custom_fields[0][label][type]', 'custom');
    params.append('custom_fields[0][label][custom]', "Recipient's name");
    params.append('custom_fields[0][type]', 'text');
    params.append('custom_fields[1][key]', 'gift_message');
    params.append('custom_fields[1][label][type]', 'custom');
    params.append('custom_fields[1][label][custom]', 'Gift message (optional)');
    params.append('custom_fields[1][type]', 'text');
    params.append('custom_fields[1][optional]', 'true');
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[CHECKOUT ERROR]', JSON.stringify(data.error || data));
      res.writeHead(response.status, { ...headers, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: data.error?.message || 'Stripe error' }));
    }

    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ clientSecret: data.client_secret }));
  } catch (err) {
    console.error('[CHECKOUT FETCH ERROR]', err.message);
    res.writeHead(500, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: err.message }));
  }
};
