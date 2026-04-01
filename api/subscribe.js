/**
 * COLD CASE CLUB — Email Collection API
 * Vercel Serverless Function
 *
 * POST /api/subscribe  { email: "user@example.com", source: "exit-popup" }
 *
 * Stores emails in Vercel KV (Redis) and optionally forwards to a webhook.
 * Falls back to Vercel function logs if KV is not configured.
 *
 * Environment variables (set in Vercel Dashboard → Settings → Environment Variables):
 *   KV_REST_API_URL    — Vercel KV connection URL (optional)
 *   KV_REST_API_TOKEN  — Vercel KV auth token (optional)
 *   WEBHOOK_URL        — Discord/Slack webhook for instant notifications (optional)
 *   ADMIN_KEY          — Secret key to access GET /api/subscribe?key=xxx (optional)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    return res.end();
  }

  // GET — list subscribers (admin only)
  if (req.method === 'GET') {
    const adminKey = process.env.ADMIN_KEY;
    if (!adminKey || req.query.key !== adminKey) {
      res.writeHead(401, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Unauthorized' }));
    }

    const subscribers = await getSubscribers();
    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ count: subscribers.length, subscribers }));
  }

  // POST — add subscriber
  if (req.method === 'POST') {
    let body = req.body;

    // Parse body if needed
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const email = (body.email || '').trim().toLowerCase();
    const source = body.source || 'unknown';

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid email address' }));
    }

    const subscriber = {
      email,
      source,
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
      ua: req.headers['user-agent'] || 'unknown',
    };

    // Store
    await storeSubscriber(subscriber);

    // Notify via webhook (non-blocking)
    notifyWebhook(subscriber).catch(() => {});

    console.log(`[SUBSCRIBE] ${email} from ${source}`);

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  res.writeHead(405, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ error: 'Method not allowed' }));
};

// ─── Storage: Vercel KV (Redis) if available, else log-only ───

async function storeSubscriber(subscriber) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    // Store in Redis sorted set (score = timestamp for ordering)
    const score = Date.now();
    const value = JSON.stringify(subscriber);

    await fetch(`${kvUrl}/zadd/subscribers/${score}/${encodeURIComponent(value)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    return;
  }

  // Fallback: just log (visible in Vercel → Deployments → Functions → Logs)
  console.log('[STORE]', JSON.stringify(subscriber));
}

async function getSubscribers() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    const res = await fetch(`${kvUrl}/zrange/subscribers/0/-1`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    const data = await res.json();
    return (data.result || []).map(item => {
      try { return JSON.parse(item); } catch { return { email: item }; }
    });
  }

  return [{ note: 'KV not configured. Check Vercel function logs for subscribers.' }];
}

// ─── Webhook Notification (Discord, Slack, or custom) ───

async function notifyWebhook(subscriber) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;

  // Discord format
  if (url.includes('discord.com')) {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📧 **New Subscriber!**\nEmail: \`${subscriber.email}\`\nSource: ${subscriber.source}\nTime: ${subscriber.timestamp}`,
      }),
    });
    return;
  }

  // Slack format
  if (url.includes('hooks.slack.com')) {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `📧 New subscriber: ${subscriber.email} (from ${subscriber.source})`,
      }),
    });
    return;
  }

  // Generic webhook
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriber),
  });
}
