/**
 * COLD CASE CLUB — Email Collection API
 * Vercel Serverless Function — Production Hardened
 *
 * POST /api/subscribe  { email: "user@example.com", source: "exit-popup" }
 *
 * Security: rate limiting (IP-based), origin validation, input sanitization,
 *           email deduplication, source field max-length.
 *
 * Email verification (double opt-in):
 *   1. Subscriber signs up → stored with verified: false + unique token
 *   2. Verification email sent via Resend API (or logged if not configured)
 *   3. User clicks /api/verify?token=xxx → marked as verified
 *
 * Storage: Vercel KV (Redis) if configured, else function logs.
 *
 * Environment variables (Vercel Dashboard → Settings → Environment Variables):
 *   KV_REST_API_URL    — Vercel KV connection URL (optional)
 *   KV_REST_API_TOKEN  — Vercel KV auth token (optional)
 *   RESEND_API_KEY     — Resend.com API key for sending verification emails (optional)
 *   FROM_EMAIL         — Sender email address (default: hello@coldcaseclub.store)
 *   SITE_URL           — Base URL for verification links (default: https://coldcaseclub.store)
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

    // Generate verification token
    const token = generateToken();

    const subscriber = {
      email,
      source,
      timestamp: new Date().toISOString(),
      ip,
      verified: false,
      token,
    };

    // Store subscriber (unverified)
    await storeSubscriber(subscriber);

    // Store verification token → subscriber mapping (expires in 48 hours)
    await storeVerificationToken(token, subscriber);

    // Send verification email (non-blocking)
    sendVerificationEmail(email, token).catch((err) => {
      console.error('[EMAIL ERROR]', err.message || err);
    });

    // Notify via webhook (non-blocking)
    notifyWebhook(subscriber).catch(() => {});

    console.log(`[SUBSCRIBE] ${email} from ${source} (verification pending)`);

    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, verification: true }));
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

// ─── Token Generation ───

function generateToken() {
  // Crypto-safe random token (URL-safe base64, 32 bytes = 43 chars)
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64url');
}

// ─── Verification Token Storage ───

async function storeVerificationToken(token, subscriber) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    console.log(`[VERIFY TOKEN] ${token} → ${subscriber.email} (KV not configured, token logged only)`);
    return;
  }

  const key = `verify:${token}`;
  const value = JSON.stringify({ email: subscriber.email, source: subscriber.source, timestamp: subscriber.timestamp });

  // SET with 48-hour expiry (172800 seconds)
  await fetch(`${kvUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/172800`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
}

// ─── Verification Email ───

async function sendVerificationEmail(email, token) {
  const resendKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.SITE_URL || 'https://coldcaseclub.store';
  const fromEmail = process.env.FROM_EMAIL || 'Cold Case Club <hello@coldcaseclub.store>';

  const verifyUrl = `${siteUrl}/api/verify?token=${encodeURIComponent(token)}`;

  if (!resendKey) {
    console.log(`[VERIFY EMAIL] Would send to ${email}: ${verifyUrl}`);
    console.log(`[VERIFY EMAIL] Set RESEND_API_KEY env var to enable email sending`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: 'Confirm your email, Detective.',
      html: buildVerificationEmailHtml(verifyUrl),
      text: buildVerificationEmailText(verifyUrl),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error: ${response.status} ${err}`);
  }

  console.log(`[VERIFY EMAIL] Sent to ${email}`);
}

function buildVerificationEmailHtml(verifyUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:0 0 30px;text-align:center;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#e2e2e8;letter-spacing:0.02em;">Cold Case <span style="color:#c9a84c;">Club</span></span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#12121a;border:1px solid #2a2a3a;border-radius:8px;padding:40px 32px;">
              <p style="font-family:'Courier New',monospace;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#c62828;margin:0 0 20px;">
                ● Case File — Email Verification
              </p>
              <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#e2e2e8;margin:0 0 16px;line-height:1.3;">
                Confirm your identity, <span style="color:#c9a84c;">Detective.</span>
              </h1>
              <p style="font-size:15px;color:#9494a8;line-height:1.7;margin:0 0 24px;">
                Before we can grant you access to classified evidence, we need to verify your email address. Standard protocol — even for investigators.
              </p>
              <p style="font-size:15px;color:#9494a8;line-height:1.7;margin:0 0 32px;">
                Click the button below to confirm your email and unlock your free evidence sample from <strong style="color:#e2e2e8;">Case #1: The Hargrove Disappearance.</strong>
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" style="display:inline-block;background:#c9a84c;color:#0a0a0f;font-family:-apple-system,sans-serif;font-size:16px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:6px;">
                      Verify My Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;color:#4a4a5e;line-height:1.6;margin:28px 0 0;text-align:center;">
                This link expires in 48 hours. If you didn't sign up for Cold Case Club, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Fallback URL -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="font-size:12px;color:#4a4a5e;margin:0 0 4px;">If the button doesn't work, copy and paste this link:</p>
              <p style="font-size:11px;color:#9494a8;word-break:break-all;margin:0;">${verifyUrl}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:32px 0 0;text-align:center;border-top:1px solid #2a2a3a;margin-top:32px;">
              <p style="font-size:12px;color:#4a4a5e;margin:0;">
                &copy; 2026 Cold Case Club. All cases are works of fiction.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildVerificationEmailText(verifyUrl) {
  return `COLD CASE CLUB — Email Verification

Confirm your identity, Detective.

Before we can grant you access to classified evidence, we need to verify your email address. Standard protocol — even for investigators.

Click the link below to confirm your email and unlock your free evidence sample from Case #1: The Hargrove Disappearance.

${verifyUrl}

This link expires in 48 hours. If you didn't sign up for Cold Case Club, you can safely ignore this email.

— Cold Case Club
All cases are works of fiction.`;
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
