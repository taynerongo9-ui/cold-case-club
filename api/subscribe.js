/**
 * COLD CASE CLUB — Email Collection API
 * Vercel Serverless Function — Production Hardened
 *
 * POST /api/subscribe  { email: "user@example.com", source: "exit-popup" }
 *
 * Security: rate limiting (IP-based), origin validation, input sanitization,
 *           email deduplication, source field max-length.
 *
 * Storage: Vercel KV (Redis) if configured, else function logs.
 *
 * Environment variables (Vercel Dashboard → Settings → Environment Variables):
 *   KV_REST_API_URL    — Vercel KV connection URL (optional)
 *   KV_REST_API_TOKEN  — Vercel KV auth token (optional)
 *   WEBHOOK_URL        — Discord/Slack webhook for notifications (optional)
 *   ADMIN_KEY          — Secret key to access GET /api/subscribe?key=xxx (optional)
 *   ALLOWED_ORIGINS    — Comma-separated allowed origins (optional, defaults to *)
 */

// Rate limiting: KV-backed when available, in-memory fallback
const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 5; // max requests per IP per window
const rateLimitMap = new Map(); // fallback for no-KV

async function isRateLimited(ip) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    // KV-backed: works across all Vercel instances
    const key = `rl:${ip}`;
    const res = await fetch(`${kvUrl}/incr/${key}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    const data = await res.json();
    const count = data?.result || 0;

    // Set TTL on first request in window
    if (count === 1) {
      await fetch(`${kvUrl}/expire/${key}/${RATE_LIMIT_WINDOW}`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
    }

    return count > RATE_LIMIT_MAX;
  }

  // Fallback: in-memory (best-effort, resets per cold start)
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW * 1000) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function getAllowedOrigin(reqOrigin) {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (!allowed) return '*'; // default open for pre-launch

  const origins = allowed.split(',').map(o => o.trim());
  if (origins.includes(reqOrigin)) return reqOrigin;
  return null; // disallowed origin — browser will block the request
}

function sanitizeSource(source) {
  if (!source || typeof source !== 'string') return 'unknown';
  // Strip anything that isn't alphanumeric, dash, or underscore. Max 50 chars.
  return source.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50) || 'unknown';
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const corsOrigin = getAllowedOrigin(origin);

  const CORS_HEADERS = corsOrigin
    ? { 'Access-Control-Allow-Origin': corsOrigin, 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
    : {};

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

    const page = parseInt(req.query.page) || 0;
    const pageSize = 100;
    const subscribers = await getSubscribers(page * pageSize, (page + 1) * pageSize - 1);
    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ page, count: subscribers.length, subscribers }));
  }

  // POST — add subscriber
  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';

    // Rate limit check
    if (isRateLimited(ip)) {
      res.writeHead(429, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Too many requests. Try again in a minute.' }));
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }

    const email = (body.email || '').trim().toLowerCase();
    const source = sanitizeSource(body.source);

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid email address' }));
    }

    // Check for duplicate (KV only)
    const isDupe = await isEmailDuplicate(email);
    if (isDupe) {
      // Return success silently — don't reveal that the email exists
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    }

    const subscriber = {
      email,
      source,
      timestamp: new Date().toISOString(),
      ip,
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

// ─── Storage: Vercel KV (Redis) ───

async function kvFetch(path) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) return null;

  const res = await fetch(`${kvUrl}${path}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  return res.json();
}

async function isEmailDuplicate(email) {
  const kvUrl = process.env.KV_REST_API_URL;
  if (!kvUrl) return false; // can't check without KV

  const data = await kvFetch(`/sismember/subscriber_emails/${encodeURIComponent(email)}`);
  return data?.result === 1;
}

async function storeSubscriber(subscriber) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (kvUrl && kvToken) {
    const score = Date.now();
    const value = JSON.stringify(subscriber);

    // Add to sorted set (ordered by time)
    await kvFetch(`/zadd/subscribers/${score}/${encodeURIComponent(value)}`);

    // Add email to dedup set
    await kvFetch(`/sadd/subscriber_emails/${encodeURIComponent(subscriber.email)}`);
    return;
  }

  // Fallback: log only
  console.log('[STORE]', JSON.stringify(subscriber));
}

async function getSubscribers(start = 0, end = -1) {
  const kvUrl = process.env.KV_REST_API_URL;
  if (!kvUrl) {
    return [{ note: 'KV not configured. Check Vercel function logs for subscribers.' }];
  }

  const data = await kvFetch(`/zrange/subscribers/${start}/${end}`);
  return (data?.result || []).map(item => {
    try { return JSON.parse(item); } catch { return { email: item }; }
  });
}

// ─── Webhook Notification ───

async function notifyWebhook(subscriber) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;

  const payload = url.includes('discord.com')
    ? { content: `New subscriber: \`${subscriber.email}\` (${subscriber.source})` }
    : url.includes('hooks.slack.com')
    ? { text: `New subscriber: ${subscriber.email} (${subscriber.source})` }
    : subscriber;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
