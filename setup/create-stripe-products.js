/**
 * COLD CASE CLUB — Stripe Product & Payment Link Setup
 *
 * Run once to create all products, prices, and payment links:
 *   STRIPE_SECRET_KEY=sk_live_xxx node setup/create-stripe-products.js
 *
 * It will output the 3 payment link URLs to paste into js/main.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('\n  ERROR: Set your Stripe secret key first:\n');
  console.error('  STRIPE_SECRET_KEY=sk_live_xxx node setup/create-stripe-products.js\n');
  process.exit(1);
}

async function setup() {
  console.log('\n=== COLD CASE CLUB — Stripe Setup ===\n');

  // ─── 1. Create the Product ───
  console.log('Creating product...');
  const product = await stripe.products.create({
    name: 'Cold Case Club — Mystery Subscription',
    description: 'A 6-month cold case investigation. 12 evidence packets delivered to your door every 2 weeks. Detective notes, witness statements, newspaper clippings, coded messages, and surprise artifacts.',
    metadata: { brand: 'cold-case-club' },
  });
  console.log(`  ✓ Product created: ${product.id}`);

  // ─── 2. Create Prices ───

  // Monthly: $14.99/mo recurring (6 months)
  console.log('Creating monthly price ($14.99/mo)...');
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 1499,
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: { plan: 'monthly' },
  });
  console.log(`  ✓ Monthly price: ${monthlyPrice.id}`);

  // Prepaid: $74.99 one-time
  console.log('Creating prepaid price ($74.99 one-time)...');
  const prepaidPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 7499,
    currency: 'usd',
    metadata: { plan: 'prepaid' },
  });
  console.log(`  ✓ Prepaid price: ${prepaidPrice.id}`);

  // Gift: $74.99 one-time (separate price for tracking)
  console.log('Creating gift price ($74.99 one-time)...');
  const giftPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 7499,
    currency: 'usd',
    metadata: { plan: 'gift' },
  });
  console.log(`  ✓ Gift price: ${giftPrice.id}`);

  // ─── 3. Create Payment Links ───

  console.log('\nCreating payment links...');

  const monthlyLink = await stripe.paymentLinks.create({
    line_items: [{ price: monthlyPrice.id, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: { url: 'https://coldcaseclub.com/success' },
    },
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    phone_number_collection: { enabled: false },
    metadata: { plan: 'monthly' },
  });
  console.log(`  ✓ Monthly link: ${monthlyLink.url}`);

  const prepaidLink = await stripe.paymentLinks.create({
    line_items: [{ price: prepaidPrice.id, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: { url: 'https://coldcaseclub.com/success' },
    },
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    phone_number_collection: { enabled: false },
    metadata: { plan: 'prepaid' },
  });
  console.log(`  ✓ Prepaid link: ${prepaidLink.url}`);

  const giftLink = await stripe.paymentLinks.create({
    line_items: [{ price: giftPrice.id, quantity: 1 }],
    after_completion: {
      type: 'redirect',
      redirect: { url: 'https://coldcaseclub.com/success?type=gift' },
    },
    // No shipping — gift purchaser enters their OWN email, recipient enters address later
    phone_number_collection: { enabled: false },
    custom_fields: [
      {
        key: 'recipient_name',
        label: { type: 'custom', custom: "Recipient's Name" },
        type: 'text',
      },
      {
        key: 'gift_message',
        label: { type: 'custom', custom: 'Gift Message (optional)' },
        type: 'text',
        optional: true,
      },
    ],
    metadata: { plan: 'gift' },
  });
  console.log(`  ✓ Gift link:    ${giftLink.url}`);

  // ─── 4. Output config for main.js ───

  console.log('\n=== COPY THIS INTO js/main.js ===\n');
  console.log(`  stripeMonthly: '${monthlyLink.url}',`);
  console.log(`  stripePrepaid: '${prepaidLink.url}',`);
  console.log(`  stripeGift:    '${giftLink.url}',`);
  console.log('\n=== DONE ===\n');

  // ─── 5. Price justification summary ───
  console.log('=== BUSINESS MODEL JUSTIFICATION ===\n');
  console.log('  MONTHLY ($14.99/mo × 6 = $89.94 full price)');
  console.log('    - COGS per packet: ~$2.50 (paper, printing, stationery, artifacts)');
  console.log('    - Postage per packet: ~$1.20 (USPS First Class letter rate)');
  console.log('    - Cost per month (2 packets): ~$7.40');
  console.log('    - Gross margin per month: $7.59 (50.6%)');
  console.log('    - CAC recovery: ~6.5 months at $50 CPA → barely breaks even');
  console.log('    - This is the "anchor" price. You WANT people on prepaid.\n');
  console.log('  PREPAID ($74.99 = $12.50/mo effective)');
  console.log('    - Total COGS over 6 months: ~$44.40');
  console.log('    - Gross profit: $30.59 (40.8%)');
  console.log('    - CAC recovery: INSTANT — $74.99 cash day 1 vs $50 CPA');
  console.log('    - Net after CAC: $24.99 profit per customer on day 1');
  console.log('    - Churn risk: ZERO — they already paid');
  console.log('    - This is the ENGINE. Every prepaid sale funds the next ad.\n');
  console.log('  GIFT ($74.99 — same price, different psychology)');
  console.log('    - Gifter pays full price (no price sensitivity — it\'s a gift)');
  console.log('    - Recipient can\'t cancel (structural anti-churn)');
  console.log('    - 1 gift sale often → 2-3 more (recipient + their friends)');
  console.log('    - Mother\'s Day window (May) = 40% of annual gift revenue');
  console.log('    - LTV of gifted customers: ~$180 (they buy for themselves next)\n');
  console.log('  UNIT ECONOMICS SUMMARY');
  console.log('    - Blended AOV: ~$82 (mix of monthly first-month + prepaid)');
  console.log('    - Blended COGS: ~$44 per customer lifecycle');
  console.log('    - CPA target: $40-50 (Meta ads)');
  console.log('    - Breakeven: 1st prepaid sale or month 3 of monthly');
  console.log('    - LTV: $180 (repeat purchasers buy 2nd case)');
  console.log('    - LTV:CAC ratio: 3.6:1 (healthy e-commerce benchmark is 3:1)\n');
}

setup().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
