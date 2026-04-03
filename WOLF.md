# WOLF.md — Cold Case Club
## "A Mystery In Your Mailbox"

> **READ FIRST. UPDATE LAST.** This is The Wolf & Council's persistent state.

---

## LAST SESSION
- **Date:** April 3, 2026
- **Who:** Fix agent + overnight Wolf
- **Done:** Stripe products created + payment links wired, embedded checkout added, Founding Investigator launch page, evidence photo gallery (36 Gemini images), shipping/pre-order flow
- **Incomplete:** DNS not configured, Vercel KV not set up, domain refs may still be .com in places, Case #1 not written, OG image is SVG
- **Blockers:** CK: DNS + Vercel KV. Case #1 story needs writing (no product to fulfill yet).

## STATUS
| Area | State | Detail |
|------|-------|--------|
| Domain | ADDED TO VERCEL | coldcaseclub.au — DNS NOT configured. CK: A→76.76.21.21, CNAME www→cname.vercel-dns.com |
| Build | N/A | Static HTML/CSS/JS. No build step. |
| Stripe | LIVE | Embedded checkout + payment links. Monthly $14.99, Prepaid $74.99, Gift $74.99. Founding Investigator pre-order. |
| Auth | None | Subscription box — direct purchase, no accounts. |
| Email | BROKEN | /api/subscribe.js works but NO Vercel KV = emails lost on cold start |
| SEO | Decent | Sitemap, robots, JSON-LD. OG image is SVG (won't render on social). |
| Content | PARTIAL | Landing page, evidence gallery, checkout. NO Case #1 story. NO blog. |
| Distribution | NOT STARTED | No socials, no true crime community posts. |
| Password | None | Public. |

## REVENUE: $0 MRR | $0 total | 0 pre-orders

## STRIPE (from main.js)
- Monthly: https://buy.stripe.com/5kQbJ1afS1Y96AX50SeME03
- Prepaid: https://buy.stripe.com/00wbJ173G8mx5wTgJAeME04
- Gift: https://buy.stripe.com/7sY9AT0FibyJ8J50KCeME05

## DOMAIN WARNING
Domain refs may still be coldcaseclub.com in some files. Verify and fix before DNS goes live.

## PRIORITY QUEUE
1. [ ] CK: DNS at Crazy Domains
2. [ ] CK: Create Vercel KV → add env vars (stop losing emails)
3. [ ] VERIFY + FIX: all coldcaseclub.com → coldcaseclub.au refs
4. [ ] Convert OG image SVG → PNG 1200x630
5. [ ] Write Case #1 story (mystery, 4-5 suspects, 6 monthly evidence packets)
6. [ ] CK: Create @coldcaseclub IG, TikTok, X
7. [ ] CK: Post in r/TrueCrime, r/UnresolvedMysteries
8. [ ] Launch Mother's Day campaign (deadline May 5)
9. [ ] Write 5 SEO blog posts
10. [ ] Build email welcome sequence

## DECISIONS LOG
- Apr 2: Wolf ranked #4 Tier 1 (33/40). Modeled after Hunt a Killer ($150M/yr). Mother's Day = natural urgency.
- Apr 2: Audit: Stripe placeholders, lost emails, domain mismatch. Stripe + domain fixed. KV still needed.

## KNOWN ISSUES
- EMAILS BEING LOST (no Vercel KV)
- OG image is SVG (social platforms won't render)
- Domain refs may still be .com in some files
- No Case #1 = can take money but can't fulfill
- Instagram link may 404 (account doesn't exist)
- Mother's Day deadline: May 5 (32 days away)
