/**
 * COLD CASE CLUB — Email Verification API
 * Vercel Serverless Function
 *
 * GET /api/verify?token=xxx  — Verifies a subscriber's email address
 *
 * Flow:
 *   1. User signs up via /api/subscribe → stored with verified: false + token
 *   2. Verification email sent with link to /api/verify?token=xxx
 *   3. User clicks link → this endpoint marks them verified
 *   4. Redirects to /verified with status
 *
 * Environment variables:
 *   KV_REST_API_URL    — Vercel KV connection URL (required for verification)
 *   KV_REST_API_TOKEN  — Vercel KV auth token (required for verification)
 *   WEBHOOK_URL        — Discord/Slack webhook for notifications (optional)
 */

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  const token = req.query.token;

  if (!token || typeof token !== 'string' || token.length < 10) {
    return redirect(res, '/verified?status=invalid');
  }

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    // Without KV, we can't verify — just redirect with success
    return redirect(res, '/verified?status=ok');
  }

  try {
    // Look up the token
    const tokenData = await kvGet(kvUrl, kvToken, `verify:${token}`);

    if (!tokenData) {
      return redirect(res, '/verified?status=expired');
    }

    let subscriber;
    try {
      subscriber = JSON.parse(tokenData);
    } catch {
      return redirect(res, '/verified?status=invalid');
    }

    // Mark email as verified in the dedup set
    await kvFetch(kvUrl, kvToken, `/sadd/verified_emails/${encodeURIComponent(subscriber.email)}`);

    // Store verified subscriber in the verified sorted set
    const score = Date.now();
    const value = JSON.stringify({ ...subscriber, verified: true, verifiedAt: new Date().toISOString() });
    await kvFetch(kvUrl, kvToken, `/zadd/verified_subscribers/${score}/${encodeURIComponent(value)}`);

    // Delete the token (one-time use)
    await kvFetch(kvUrl, kvToken, `/del/verify:${token}`);

    // Notify webhook
    notifyWebhook(subscriber).catch(() => {});

    console.log(`[VERIFIED] ${subscriber.email}`);

    return redirect(res, '/verified?status=ok');
  } catch (err) {
    console.error('[VERIFY ERROR]', err);
    return redirect(res, '/verified?status=error');
  }
};

function redirect(res, path) {
  res.writeHead(302, { Location: path });
  return res.end();
}

async function kvFetch(kvUrl, kvToken, path) {
  const response = await fetch(`${kvUrl}${path}`, {
    headers: { Authorization: `Bearer ${kvToken}` },
  });
  return response.json();
}

async function kvGet(kvUrl, kvToken, key) {
  const data = await kvFetch(kvUrl, kvToken, `/get/${encodeURIComponent(key)}`);
  return data?.result || null;
}

async function notifyWebhook(subscriber) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;

  const payload = url.includes('discord.com')
    ? { content: `✅ Email verified: \`${subscriber.email}\` (${subscriber.source})` }
    : url.includes('hooks.slack.com')
    ? { text: `✅ Email verified: ${subscriber.email} (${subscriber.source})` }
    : subscriber;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
