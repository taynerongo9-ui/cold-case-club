/**
 * COLD CASE CLUB — Stripe Embedded Checkout API
 * Vercel Serverless Function
 *
 * POST /api/checkout  { plan: "prepaid" | "monthly" | "gift" }
 * Returns: { clientSecret: "cs_..." } for Stripe Embedded Checkout
 *
 * Environment variables (Vercel Dashboard):
 *   STRIPE_SECRET_KEY  — Stripe secret key (sk_live_... or sk_test_...)
 *   SITE_URL           — Base URL for redirects (default: https://coldcaseclub.store)
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Price IDs — set these after running setup/create-stripe-products.js
// or create them manually in Stripe Dashboard
const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || null,
  prepaid: process.env.STRIPE_PRICE_PREPAID || null,
  gift: process.env.STRIPE_PRICE_GIFT || null,
};

// Fallback: use Payment Links if price IDs aren't configured
const PAYMENT_LINKS = {
  monthly: 'https://buy.stripe.com/bJefZhgEg6ep8J5790eME00',
  prepaid: 'https://buy.stripe.com/6oU6oHafSbyJ0cz8d4eME01',
  gift: 'https://buy.stripe.com/bJe8wPew86epe3p790eME02',
};

module.exports = async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '*';
  const headers = {
    'Access-Control-Allow-Origin': origin,
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

  // Check Stripe key
  if (!process.env.STRIPE_SECRET_KEY) {
    // Fallback: return payment link URL for redirect
    let body = req.body;
    if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }
    const plan = body.plan || 'prepaid';
    const link = PAYMENT_LINKS[plan] || PAYMENT_LINKS.prepaid;
    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ url: link, mode: 'redirect' }));
  }

  let body = req.body;
  if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }

  const plan = body.plan || 'prepaid';
  const siteUrl = process.env.SITE_URL || 'https://coldcaseclub.store';

  // If no price IDs configured, fall back to payment links
  const priceId = PRICES[plan];
  if (!priceId) {
    const link = PAYMENT_LINKS[plan] || PAYMENT_LINKS.prepaid;
    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ url: link, mode: 'redirect' }));
  }

  try {
    const sessionConfig = {
      ui_mode: 'embedded',
      return_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=${plan}`,
      automatic_tax: { enabled: false },
    };

    if (plan === 'monthly') {
      sessionConfig.mode = 'subscription';
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }];
    } else {
      sessionConfig.mode = 'payment';
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }];
    }

    // Gift: add custom fields
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
    return res.end(JSON.stringify({ clientSecret: session.client_secret, mode: 'embedded' }));
  } catch (err) {
    console.error('[CHECKOUT ERROR]', err.message);
    // Fallback to payment link
    const link = PAYMENT_LINKS[plan] || PAYMENT_LINKS.prepaid;
    res.writeHead(200, { ...headers, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ url: link, mode: 'redirect' }));
  }
};
