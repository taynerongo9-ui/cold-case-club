# Cold Case Club — Launch Day Checklist

## CK does these tomorrow morning (April 4, 2026)

---

### 1. SOCIAL ACCOUNTS (20 minutes)

- [ ] Create Instagram @coldcaseclub
  - Bio: "Evidence arrives. You solve the case. 12 packets. 6 months. 1 cold case."
  - Link: coldcaseclub.store
  - Post first 3 evidence images (from images/evidence/ folder)
  - Captions ready in marketing/instagram-content-templates.md

- [ ] Create TikTok @coldcaseclub
  - Same bio
  - Don't post yet — prep 10 videos first (scripts in marketing/tiktok-reels-scripts.md)

- [ ] Create X/Twitter @coldcaseclub
  - Bio: "Someone got away with it. Can you prove it? Evidence packets by mail. coldcaseclub.store"
  - Pin tweet: "Case #1 is open. 12 evidence packets. 6 months. 1 cold case to solve. Founding Investigators ship first. coldcaseclub.store"

---

### 2. REDDIT POSTS (30 minutes)

Copy-paste these posts. DO NOT modify — they're optimized.

**Post #1 — r/TrueCrime** (1.2M members)
> Title: I built a mystery subscription where real evidence packets arrive at your door every 2 weeks — you solve a cold case over 6 months
>
> [Full post in conversation above]

**Post #2 — r/SubscriptionBoxes** (50K)
> Title: New mystery subscription — evidence packets by mail, not a box of random stuff

**Post #3 — r/UnresolvedMysteries** (2.4M)
> Title: For those who wish they could actually investigate — I built a mail-based cold case experience

**Best posting times (Perth AWST):**
- r/TrueCrime: 10 PM - 2 AM (US evening)
- r/SubscriptionBoxes: 11 PM - 1 AM
- r/UnresolvedMysteries: 10 PM - 2 AM
- Stagger posts 2-3 hours apart to avoid spam detection

---

### 3. GOOGLE SEARCH CONSOLE (5 minutes)

- [ ] Go to search.google.com/search-console
- [ ] Add property: coldcaseclub.store
- [ ] Verify via DNS TXT record or HTML file (Vercel makes this easy)
- [ ] Submit sitemap: coldcaseclub.store/sitemap.xml
- [ ] Request indexing for homepage, /cases, /sample, /blog

---

### 4. DIRECTORY SUBMISSIONS (45 minutes)

Submit Cold Case Club to these directories for free backlinks:

| Directory | URL | What to submit |
|-----------|-----|----------------|
| AlternativeTo | alternativeto.net | Alternative to Hunt a Killer |
| BetaList | betalist.com | Pre-launch subscription |
| Product Hunt | producthunt.com | Schedule launch for a Tuesday |
| SaaSHub | saashub.com | Mystery subscription |
| Indie Hackers | indiehackers.com/products | Add product page |
| Hacker News | news.ycombinator.com | Show HN post |
| BetaPage | betapage.co | Free listing |
| StartupStash | startupstash.com | Submit |
| Launching Next | launchingnext.com | Submit |
| All My Faves | allmyfaves.com | Submit |

---

### 5. PODCAST OUTREACH TEMPLATE (send to 10-20 podcasts)

**DM/Email Template:**

Subject: Free mystery case for your show — Cold Case Club

Hi [Name],

I'm a fan of [Podcast Name] and I built something your audience might love.

Cold Case Club is a mystery subscription — real evidence packets arrive by mail every 2 weeks. Detective notes, witness statements, coded messages. You solve a cold case over 6 months.

I'd love to send you a free digital preview of Case #1. You could open the evidence on-air and let your listeners follow along. No cost, no strings.

Interested? I can send the first packet today.

— CK
coldcaseclub.store

**Target podcasts (small-mid, likely to respond):**
- My Favorite Murder (big, long shot but worth trying)
- Casefile (Australian! — perfect alignment)
- Crime Junkie
- Morbid
- True Crime Garage
- Small Town Murder
- Generation Why
- The Murder Squad
- RedHanded
- And That's Why We Drink

---

### 6. VERCEL KV SETUP (5 minutes)

Without this, email signups are LOST on serverless cold starts.

- [ ] Go to vercel.com/dashboard
- [ ] Click your cold-case-club project
- [ ] Go to Storage tab
- [ ] Click "Connect Store" → select "Upstash Redis"
- [ ] Create a free database (name: cold-case-club)
- [ ] It auto-sets KV_REST_API_URL and KV_REST_API_TOKEN
- [ ] Redeploy: `vercel --prod`

---

### 7. GEMINI API KEY (2 minutes)

The old key was rotated. Need new one for OG image generation.

- [ ] Go to aistudio.google.com/apikey
- [ ] Generate new key
- [ ] Run: `GEMINI_API_KEY=your_key python3 scripts/transform-all.py` (if needed)
- [ ] Give key to Wolf for OG image generation

---

## AFTER LAUNCH DAY

- Daily: 1 Instagram evidence photo
- Every 2 days: 1 Reddit comment in true crime threads
- Weekly: 1 TikTok video
- Ongoing: Monitor Stripe dashboard + /admin for orders
- Before May 5: Mother's Day gift campaign push
