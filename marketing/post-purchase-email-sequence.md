# Cold Case Club — Post-Purchase Email Sequence

> **Purpose:** 3-email onboarding sequence for new paying customers.
> **Goal:** Reduce buyer's remorse, build excitement, drive referrals.
> **Trigger:** Successful Stripe checkout (use webhook → ESP)
> **Suppress:** Remove from welcome/lead-magnet sequence immediately on purchase.

---

## Email 1: Order Confirmation + Excitement (Immediate)

**Subject:** Welcome to the investigation, Detective.
**Preview:** Your case file has been opened. Here's what happens next.

---

Detective,

Your case file is officially open.

Here's what happens now:

**1. Your first evidence packet ships within 48 hours.**
You'll receive a tracking number via email. Keep an eye on your mailbox.

**2. After that, new evidence arrives every 2 weeks.**
12 packets total over 6 months. Each one adds new leads, new suspects, and new contradictions.

**3. By month six, you'll have everything you need to crack the case.**
Submit your theory. We send the final reveal. No spoilers anywhere online — the answer is only in the last packet.

**A few tips from veteran investigators:**

- Keep all your packets together. Some people use a folder. Others pin everything to a board. A few go full detective wall.
- Read everything twice. The first time for the story. The second time for the details.
- Don't Google anything. Trust the evidence. Trust yourself.

Welcome to Cold Case Club. The investigation starts when your mailbox does.

— The Cold Case Club Team

P.S. If you ordered a gift, the recipient will receive a separate email with their redemption instructions.

---

## Email 2: What to Expect From Packet #1 (Day 3)

**Subject:** Your first evidence packet is on its way.
**Preview:** Here's how to get the most out of it.

---

Detective,

Your first evidence packet should be arriving soon (or may already be in your mailbox).

Here's what to expect:

**Inside Packet #1:**
- The initial case briefing — who went missing, when, and where
- Your first witness statement — pay attention to what she says (and what she doesn't)
- A newspaper clipping from the time of the disappearance
- A coded message — your first puzzle to crack

**How to approach it:**
Don't rush. Sit down with a drink, clear some space, and read through everything at least twice. The first packet establishes the foundation. Details that seem unimportant now will matter later.

**If you're doing this with someone else:**
Read the materials separately first, then compare notes. You'll be surprised how different your initial theories are.

**Keep everything.**
Every packet connects. Something in Month 1 might be the key to cracking Month 5. We recommend a dedicated folder, binder, or (if you're committed) an investigation board.

Enjoy the investigation. We'll be in touch when Packet #2 ships.

— CCC

---

## Email 3: Community + Referral Ask (Day 10)

**Subject:** How's the investigation going?
**Preview:** Share Cold Case Club with someone who'd love it.

---

Detective,

By now you've had your first evidence packet for about a week. We're curious:

**Do you have a suspect yet?**

Most investigators form a theory after Packet #1 — and most of them change it by Packet #4. That's by design. Every new piece of evidence shifts the picture.

**Share the investigation.**

If you know someone who would love this — a true crime fan, a puzzle lover, a friend who's always saying "I knew it was the husband" — we'd love for you to tell them about us.

You can share your experience directly, or send them to our gift page:
**[coldcaseclub.au/gift](https://coldcaseclub.au/gift)**

**A small ask:**

Word of mouth is everything for a small business like ours. If you're enjoying the experience so far, we'd be incredibly grateful if you:

1. Told a friend (text, email, in person — all count)
2. Shared a photo of your evidence on Instagram or TikTok with **#coldcaseclub**
3. Left us a review when the case wraps up

Every referral helps us keep creating new cases.

Thank you for being one of our earliest investigators. Your case file is just getting started.

— The Cold Case Club Team

P.S. Packet #2 ships on [date]. New evidence. New questions. Stay sharp.

---

## Sequence Settings

| Email | Delay | Goal |
|-------|-------|------|
| 1 | Immediate | Confirm, build excitement, set expectations |
| 2 | Day 3 | Prepare for first packet, deepen engagement |
| 3 | Day 10 | Community building, referral ask |

## Notes for CK

- **Personalization:** If Stripe captures first name, use it in the greeting ("Welcome to the investigation, [Name]" instead of "Detective")
- **Gift buyers:** Email 1 should branch — gift buyers get a different version explaining the gift card/redemption process. Use Stripe metadata to differentiate.
- **Referral tracking:** Consider adding a unique referral link per customer in Email 3 (most ESPs support this via Stripe customer ID or email hash)
- **Review collection:** At Month 6 (after case reveal), trigger a separate email asking for a review. Include direct link to Google Business Profile or Trustpilot.
- **Winback:** If a monthly subscriber cancels before Month 6, trigger a "Don't let this case go cold" winback email with an incentive to rejoin.
