/**
 * COLD CASE CLUB — Stripe Embedded Checkout API
 * POST /api/checkout  { plan: "prepaid" | "monthly" | "gift" }
 * Returns: { clientSecret: "cs_..." }
 *
 * Features:
 * - Shipping address collection (required for all plans except gift purchaser)
 * - Shipping cost calculated by country zone
 * - Founding Investigator metadata
 * - Customer email collection for order fulfillment
 */

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  prepaid: process.env.STRIPE_PRICE_PREPAID,
  gift: process.env.STRIPE_PRICE_GIFT,
};

// Shipping rates by zone (Stripe shipping_options format)
// AusPost rates for large letter / small packet
const SHIPPING_OPTIONS = {
  standard: [
    {
      // Australia domestic — AusPost large letter
      display_name: 'Australia Post — Standard',
      amount: 500, // $5.00 AUD
      delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 10 } },
    },
    {
      // International — standard airmail
      display_name: 'International Airmail',
      amount: 1500, // $15.00 AUD
      delivery_estimate: { minimum: { unit: 'business_day', value: 10 }, maximum: { unit: 'business_day', value: 21 } },
    },
  ],
  gift: [
    {
      // Gift = digital delivery of gift card, no shipping for purchaser
      display_name: 'Digital Gift Card (emailed instantly)',
      amount: 0,
      delivery_estimate: { minimum: { unit: 'business_day', value: 0 }, maximum: { unit: 'business_day', value: 1 } },
    },
  ],
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

  // Collect customer email (required for fulfillment)
  params.append('customer_creation', 'always');

  // Shipping — collect address for monthly/prepaid, digital for gift
  if (plan === 'gift') {
    // Gift purchaser doesn't need to provide shipping — recipient does later
    const opts = SHIPPING_OPTIONS.gift;
    opts.forEach((opt, i) => {
      params.append(`shipping_options[${i}][shipping_rate_data][display_name]`, opt.display_name);
      params.append(`shipping_options[${i}][shipping_rate_data][type]`, 'fixed_amount');
      params.append(`shipping_options[${i}][shipping_rate_data][fixed_amount][amount]`, opt.amount);
      params.append(`shipping_options[${i}][shipping_rate_data][fixed_amount][currency]`, 'usd');
    });

    // Gift custom fields
    params.append('custom_fields[0][key]', 'recipient_name');
    params.append('custom_fields[0][label][type]', 'custom');
    params.append('custom_fields[0][label][custom]', "Recipient's name");
    params.append('custom_fields[0][type]', 'text');
    params.append('custom_fields[1][key]', 'gift_message');
    params.append('custom_fields[1][label][type]', 'custom');
    params.append('custom_fields[1][label][custom]', 'Gift message (optional)');
    params.append('custom_fields[1][type]', 'text');
    params.append('custom_fields[1][optional]', 'true');
  } else {
    // Monthly & Prepaid — collect shipping address + show shipping options
    params.append('shipping_address_collection[allowed_countries][0]', 'AU');
    params.append('shipping_address_collection[allowed_countries][1]', 'US');
    params.append('shipping_address_collection[allowed_countries][2]', 'GB');
    params.append('shipping_address_collection[allowed_countries][3]', 'CA');
    params.append('shipping_address_collection[allowed_countries][4]', 'NZ');
    params.append('shipping_address_collection[allowed_countries][5]', 'IE');
    params.append('shipping_address_collection[allowed_countries][6]', 'DE');
    params.append('shipping_address_collection[allowed_countries][7]', 'FR');
    params.append('shipping_address_collection[allowed_countries][8]', 'NL');
    params.append('shipping_address_collection[allowed_countries][9]', 'SG');

    const opts = SHIPPING_OPTIONS.standard;
    opts.forEach((opt, i) => {
      params.append(`shipping_options[${i}][shipping_rate_data][display_name]`, opt.display_name);
      params.append(`shipping_options[${i}][shipping_rate_data][type]`, 'fixed_amount');
      params.append(`shipping_options[${i}][shipping_rate_data][fixed_amount][amount]`, opt.amount);
      params.append(`shipping_options[${i}][shipping_rate_data][fixed_amount][currency]`, 'usd');
      if (opt.delivery_estimate) {
        params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][minimum][unit]`, opt.delivery_estimate.minimum.unit);
        params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][minimum][value]`, opt.delivery_estimate.minimum.value);
        params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][maximum][unit]`, opt.delivery_estimate.maximum.unit);
        params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][maximum][value]`, opt.delivery_estimate.maximum.value);
      }
    });
  }

  // Metadata for fulfillment
  params.append('metadata[plan]', plan);
  params.append('metadata[source]', 'coldcaseclub');
  params.append('metadata[founding_investigator]', 'true');

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
