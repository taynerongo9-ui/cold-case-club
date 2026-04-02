# Cold Case Club — Project Context for Claude

## What This Is

Cold Case Club is a true crime / mystery **snail mail subscription business**. Subscribers receive physical evidence packets (detective notes, witness statements, newspaper clippings, coded messages, crime scene photos) every 2 weeks for 6 months. They piece together clues to solve a fictional cold case.

**Business model** is directly modeled on [The Flower Letters](https://theflowerletters.com) ($7M/yr revenue, 120K letters/month). We chose the true crime niche because:
- Hunt a Killer does $150M/yr in mystery boxes (proven market)
- True crime is the #1 podcast category
- Core demo (women 35-55) matches Flower Letters exactly
- Letter format = lower COGS + higher margins than boxes

## Tech Stack

- **Frontend:** Static HTML/CSS/JS — no framework, no build step
- **Hosting:** Vercel (production)
- **Payments:** Stripe (Payment Links + Checkout)
- **Email collection:** Self-hosted Vercel serverless function at `/api/subscribe`
- **Design:** Dark detective noir — gold (#c9a84c) accents, Playfair Display serif headers, Courier Prime mono for evidence
- **Fonts:** Google Fonts (Playfair Display, Inter, Courier Prime)

## Live URLs

- **Production:** https://cold-case-club.vercel.app
- **Domain:** coldcaseclub.com (TO BE PURCHASED — then add in Vercel Dashboard → Domains)

## Project Structure

```
cold-case-club/
├── index.html              # Landing page — hero, proof bar, how it works, evidence,
│                           #   pricing, testimonials, guarantee, FAQ, email CTA, exit popup
├── gift.html               # Dedicated gift purchase page (anti-churn play)
├── success.html            # Post-checkout confirmation + referral hook
├── privacy.html            # Privacy policy (required for Stripe + Meta ads)
├── terms.html              # Terms of service
├── 404.html                # On-brand "Case File #404" error page
├── css/style.css           # Full design system (~700 lines)
├── js/main.js              # All client JS: nav, FAQ accordion, scroll animations,
│                           #   email forms, Stripe checkout redirects, countdown timer,
│                           #   sticky mobile CTA, exit-intent popup, Meta Pixel events
├── api/
│   └── subscribe.js        # Vercel serverless: email collection API
│                           #   Supports: Vercel KV, Discord/Slack webhooks, function logs
│                           #   Env vars: KV_REST_API_URL, KV_REST_API_TOKEN, WEBHOOK_URL, ADMIN_KEY
├── setup/
│   └── create-stripe-products.js  # One-command Stripe setup
│                           #   Run: STRIPE_SECRET_KEY=sk_live_xxx node setup/create-stripe-products.js
│                           #   Creates: 3 products, 3 prices, 3 payment links
│                           #   Outputs: URLs to paste into js/main.js CONFIG
├── ads/
│   └── meta-ad-copy.md     # 6 Meta ad variants across 3 campaigns
│                           #   Cold traffic, Mother's Day, retargeting
├── DISTRIBUTION.md         # Full go-to-market playbook
│                           #   Pricing justification, unit economics, 6 channels,
│                           #   email sequences, launch timeline, metrics
├── marketing-video-script.md  # Warren Buffett-style marketing video script
├── sitemap.xml             # SEO sitemap (4 pages)
├── robots.txt              # Blocks /success, exposes sitemap
├── llms.txt                # AI search engine optimization
├── favicon.svg             # SVG favicon (CC monogram + red dot)
├── images/og-image.svg     # OG social sharing image (placeholder — replace with photo)
├── vercel.json             # Clean URLs, security headers, asset caching
├── package.json            # Stripe SDK dependency
└── .gitignore              # node_modules, .vercel, .env
```

## Pricing

| Plan | Price | Type | Stripe Status |
|------|-------|------|--------------|
| Monthly | $14.99/mo | Recurring (6 months) | NEEDS SETUP — run setup script |
| Prepaid (Full Case) | $74.99 | One-time | NEEDS SETUP — run setup script |
| Gift | $74.99 | One-time (+ custom fields) | NEEDS SETUP — run setup script |

## Unit Economics

- COGS per customer (12 packets): ~$44
- CPA target (Meta ads): $40-50
- Customer LTV: $180 (repeat purchasers)
- LTV:CAC ratio: 3.6:1
- Email drives 38-50% of revenue (target from Flower Letters model)

## SEO Implemented

- JSON-LD: Organization, Product (with AggregateRating + Reviews), FAQPage
- Full OG + Twitter Card meta on all pages
- Canonical URLs on all pages
- sitemap.xml, robots.txt, llms.txt
- Semantic HTML, proper heading hierarchy

## Conversion Stack

- Urgency bar with Mother's Day countdown timer (deadline: May 5, 2026) — dismissal persisted to localStorage
- Price anchoring: ~~$89.94~~ $74.99 strikethrough on prepaid
- "2 months free" framing (instead of "save $15")
- 30-day money-back guarantee section (on BOTH index and gift pages)
- Exit-intent popup with free evidence preview lead magnet — desktop (mouseleave) + mobile (45s timer)
- Sticky mobile CTA bar on BOTH index and gift pages
- Meta Pixel events: Lead, InitiateCheckout, Purchase (with plan-specific value: $14.99 monthly, $74.99 prepaid/gift)
- Referral hook on success page
- Success page differentiates gift vs subscriber experience via ?type= query param
- Gift page has urgency bar, testimonials, guarantee, email capture fallback CTA

## Conventions

- All internal links use root-relative paths (`/gift`, `/privacy`, not `gift.html`)
- Vercel's `cleanUrls: true` strips `.html` extensions
- CSS uses custom properties (tokens) defined in `:root`
- JS CONFIG object at top of main.js holds all configurable values
- Email forms use universal `handleEmailForm()` handler with source tracking
- FAQ buttons have `aria-expanded` toggled by JS
- Evidence stack hero visual has `aria-hidden="true"` (decorative)
- Email API has rate limiting (KV-backed when available), dedup, source sanitization, origin validation
- No frameworks. No build step. Deploy = push to Vercel.

## What's NOT Done Yet

1. Domain purchase (coldcaseclub.com) + Vercel custom domain
2. Stripe products/payment links (run setup script)
3. Social accounts (@coldcaseclub on IG + TikTok)
4. Meta Business Manager + Pixel installation
5. Email marketing platform + welcome sequence
6. Case #1 story content
7. Physical evidence packet prototypes + photography
8. Real OG images (replace SVG placeholders with product photos)
9. Real testimonials (replace placeholders after first customers)
10. Meta ad launch

## Key Design Decisions

- **Static HTML over React/Next.js** — Zero JS bundle overhead. Sub-second load. No hydration. For a landing page that needs to convert cold ad traffic, speed wins.
- **Self-hosted email API over Formspree** — No 50/month cap. Source tracking per form. Webhook notifications. Scales with Vercel free tier.
- **Stripe Payment Links over custom checkout** — No server-side secret key needed on the frontend. Stripe handles PCI compliance, tax, receipts. One URL per plan.
- **6-month case (not 12)** — Lower commitment for first-time buyers. The Flower Letters does 12 months, but a 6-month entry is lighter for a new brand with no reputation yet.
