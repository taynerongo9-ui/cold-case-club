# WOLF.md — Cold Case Club
## "A Mystery In Your Mailbox"

> **READ FIRST. UPDATE LAST.** This is The Wolf & Council's persistent state.

---

## LAST SESSION
- **Date:** April 3-4, 2026 (overnight marathon)
- **Who:** The Wolf + all councils
- **Done:**
  - 3 complete mystery cases (15,600 lines, 1.2MB) with cross-case Easter eggs, 5-6 ciphers each
  - 36 hyperrealistic evidence images (real photos → Gemini Nano Banana Pro)
  - 25 HTML pages (homepage, cases, sample, 3 use-cases, 9 blog posts, 2 comparison pages, checkout, success, verified, admin, gift, about, mothers-day, privacy, terms, 404)
  - 15+ homepage animations (typewriter, particles, count-up, tilt, shimmer, grain)
  - Stripe embedded checkout (all 3 plans working — monthly, prepaid, gift)
  - Stripe webhook with signature verification
  - Email verification (double opt-in) via Resend
  - Admin order dashboard at /admin
  - Shipping address collection + shipping cost by country
  - Founding Investigator pre-order framing
  - Social sharing on success page
  - Mobile responsive pass
  - 4 critical bugs found and fixed
  - Domain: coldcaseclub.store (live, DNS propagated, SSL active)
  - Parent company: Seaqae Group (seaqae.com purchased)
  - Shopify store created (seaqae-com.myshopify.com) — NOT YET CONNECTED (deferred)
  - LOOPHOLES.md with 22 $0-cost exploits
  - Launch checklist written (marketing/launch-checklist.md)
  - All marketing assets: Google Ads, Instagram templates, TikTok scripts, email sequences, Reddit posts

- **Incomplete:**
  - OG image still SVG (need new Gemini API key to generate JPG)
  - Vercel KV / Upstash Redis not set up (emails lost on cold start)
  - Shopify integration deferred (using Stripe + admin dashboard for now)
  - Google Search Console not submitted
  - No social accounts created yet
  - Zero Reddit posts made
  - No podcast outreach sent

- **Blockers:**
  - CK: Create social accounts (IG, TikTok, X)
  - CK: Post on Reddit (copy-paste posts are ready)
  - CK: Set up Upstash Redis via Vercel dashboard
  - CK: Generate new Gemini API key
  - CK: Register ABN as "Seaqae Group" sole trader

## STATUS
| Area | State | Detail |
|------|-------|--------|
| Domain | LIVE | coldcaseclub.store — DNS propagated, SSL active |
| Company | NAMED | Seaqae Group — seaqae.com purchased, ABN not yet registered |
| Build | STATIC | HTML/CSS/JS on Vercel. No build step. |
| Stripe | LIVE | Embedded checkout. Monthly $14.99, Prepaid $74.99, Gift $74.99. Webhook verified. |
| Checkout | WORKING | /checkout page with inline Stripe. Shipping address collected. |
| Orders | LIVE | /admin dashboard. Webhook at /api/orders with signature verification. |
| Email | PARTIAL | Verification works via Resend. Welcome sequence NOT loaded into ESP. |
| KV/Redis | BROKEN | Not configured. Emails + orders lost on cold start. CK: set up Upstash. |
| Cases | COMPLETE | 3 cases, 36 packets, 15,600 lines. Production-ready with printing notes. |
| Images | COMPLETE | 36 evidence photos (real → Gemini). On site + in git. |
| SEO | GOOD | 25 pages, sitemap, robots, JSON-LD, llms.txt. NOT in Search Console yet. |
| Content | COMPLETE | 9 blog posts, 3 use-case pages, 2 comparison pages, sample page. |
| Distribution | NOT STARTED | Zero posts. Zero social accounts. Zero podcast outreach. |
| Socials | NOT CREATED | CK: create @coldcaseclub on IG, TikTok, X |

## REVENUE: $0 MRR | $0 total | 0 orders

## STRIPE
- Product: prod_UGa21fjMkWIP0e
- Monthly: price_1TI2sNGsNBzVX9j8AkfJJCv3
- Prepaid: price_1TI2sOGsNBzVX9j8MKT2Qc9s
- Gift: price_1TI2sOGsNBzVX9j8ZstwZj9o
- Webhook: we_1TIAlXGsNBzVX9j8YpffUG7h (signature verified)
- PK: pk_live_51THFD2GsNBzVX9j8k97GMVcvFUAzo6lRJL0pQMdfVfFBDKP1E4WFmCxyeQpz4LWfeIkzUpDetROWNV6Wt6LqHvQj00XHD9ljmq

## VERCEL ENV VARS
- STRIPE_SECRET_KEY ✅
- STRIPE_PRICE_MONTHLY ✅
- STRIPE_PRICE_PREPAID ✅
- STRIPE_PRICE_GIFT ✅
- STRIPE_WEBHOOK_SECRET ✅
- RESEND_API_KEY ✅
- FROM_EMAIL ✅
- SITE_URL ✅
- ADMIN_KEY ✅ (ccc-wolf-admin-2026)
- KV_REST_API_URL ❌ (not set — need Upstash)
- KV_REST_API_TOKEN ❌ (not set — need Upstash)

## PRIORITY QUEUE (CK's tasks for tomorrow)
1. [ ] Create @coldcaseclub on Instagram, TikTok, X
2. [ ] Post Reddit in r/TrueCrime (copy-paste post is ready)
3. [ ] Set up Upstash Redis via Vercel dashboard (stop losing emails)
4. [ ] Submit to Google Search Console + request indexing
5. [ ] Generate new Gemini API key → give to Wolf for OG image
6. [ ] Register ABN as "Seaqae Group" sole trader at abr.business.gov.au
7. [ ] Report ABN to Centrelink within 14 days (report $0 income)
8. [ ] Rotate Stripe secret key (was in chat)

## DECISIONS LOG
- Apr 3: 3 cases built with cross-case Easter eggs and progressive cipher systems
- Apr 3: Domain changed from coldcaseclub.au → coldcaseclub.store
- Apr 3: Parent company: Seaqae Group (Japanese-inspired, "see-kay", zero global conflicts)
- Apr 3: Shopify deferred — using Stripe + admin dashboard for MVP fulfillment
- Apr 3: Founding Investigator pre-order model (ships May 2026, collect money now)
- Apr 3: Shipping: AU $5, International $15, customer pays
- Apr 3: Pre-order framing: honest about timeline, founding badge + bonus evidence
- Apr 4: 4 critical bugs fixed (rate limiter, monthly checkout, webhook security, order injection)
- Apr 4: $14.99/mo pricing corrected (was misleadingly showing $12.50/mo)
- Apr 4: LOOPHOLES.md generated — 22 $0-cost exploits including R&D tax ($21K+ refund potential)

## KNOWN ISSUES
- OG image is SVG (won't render on social) — need new Gemini key to fix
- Vercel KV not configured — emails/orders lost on cold start
- Testimonials are placeholder (pre-customers)
- Instagram link in footer 404s (account doesn't exist yet)
- Stripe secret key was exposed in chat — CK needs to rotate
- Mother's Day deadline: May 5 (31 days away)
- ABN not registered yet
