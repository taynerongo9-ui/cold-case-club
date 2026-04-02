# Cold Case Club — Email Welcome Sequence

> **Purpose:** 5-email sequence for new leads who signed up via the "Free Evidence Preview" lead magnet.
> **Goal:** Convert email subscribers to paying customers within 7 days.
> **ESP:** Load into any platform (Mailchimp, ConvertKit, Klaviyo, etc.)
> **Trigger:** New subscriber via /api/subscribe

---

## Email 1: The Evidence (Immediate — 0 min delay)

**Subject:** Your evidence sample is here, Detective.
**Preview:** A witness statement. A newspaper clipping. Your first coded clue.

---

Detective,

Welcome to the investigation.

You asked for a preview of Case #1 — and we don't keep detectives waiting.

Here's what we've pulled from the file:

**EXHIBIT A — Witness Statement #003**
Margaret Ellis, bartender at The Monarch.
*"She was alone. Ordered gin, no ice. I remember because she kept looking at the door like she was waiting for someone who never showed up."*

**EXHIBIT B — Daily Herald, November 3, 1987**
LOCAL WOMAN MISSING: Police have suspended the search for Eleanor Hargrove, 34. Husband remains "person of interest."

**EXHIBIT C — Coded Message**
Found tucked inside a library book returned two days after the disappearance:

`WKLV LV QRW ZKDW LW VHHPV`

Can you crack it? (Hint: Caesar would know.)

This is a taste. The full investigation includes 12 evidence packets delivered to your door over 6 months. Detective notes. Photographs. Artifacts. Everything you need to solve the case.

**[Start Your Investigation → coldcaseclub.au/#pricing]**

— The Cold Case Club Team

P.S. The coded message has a real answer. Reply to this email with your theory — we read every one.

---

## Email 2: The Story Hook (Day 1 — 24hr delay)

**Subject:** Three witnesses. Three different stories.
**Preview:** Someone is lying about Eleanor Hargrove.

---

Detective,

Here's what we know about the night of November 1, 1987:

Eleanor Hargrove, 34, was last seen leaving The Monarch Theatre at 11:42 PM. Her coat was found on the bridge. No body was ever recovered.

Three people saw her that night. Their stories don't match.

The bartender says she was alone and anxious.
The theatre manager says she left with a man in a grey coat.
Her husband says she never left the house.

**Someone is lying.** Maybe more than one of them.

Over 6 months, you'll receive the full evidence file — twelve packets of detective notes, witness statements, newspaper clippings, coded messages, and artifacts that piece together what really happened.

By month six, you'll have everything you need to name the person responsible.

The question is: are you paying attention to the right details?

**[Open the Case File → coldcaseclub.au/#pricing]**

— CCC

---

## Email 3: Social Proof + Objection Handling (Day 3 — 48hr delay)

**Subject:** "My mom has a suspect board on her office wall"
**Preview:** What 2,400+ investigators are saying about their cases.

---

Detective,

We get asked the same question a lot:

*"Is this actually good, or is it just a gimmick?"*

Fair. Here's what investigators are saying:

> "I bought this for my mom on a whim. She called me after the second packet — she's got a suspect board pinned to her office wall. I've never seen her this excited."
> — **Sarah K.**

> "My book club switched from novels to this. We meet every two weeks to go through the evidence together."
> — **Diana M.**

> "The coded message in month 3 took me a full weekend to crack. Already signed up for Case #2."
> — **James R.**

A few things people worry about (and shouldn't):

**"I'm not good at puzzles."**
You don't need to be. This isn't a test. The cases are designed to be engaging, not frustrating. Everything you need is in the packets.

**"What if I don't like it?"**
We have a 30-day money-back guarantee. If your first evidence packet doesn't hook you, we refund every penny. No interrogation.

**"Is $14.99/mo actually worth it?"**
A movie is $15 for 2 hours. This is $14.99 for a month of investigation. The math checks out.

**[Join 2,400+ Investigators → coldcaseclub.au/#pricing]**

---

## Email 4: The Gift Angle (Day 5 — 48hr delay)

**Subject:** Know a true crime fan? This gift will make their year.
**Preview:** Mother's Day is coming. This is better than flowers.

---

Detective,

Quick question: do you know someone who...

- Binges true crime podcasts on every commute?
- Has a "murder wall" joke that's only half a joke?
- Would rather watch Dateline than anything on Netflix?

**Cold Case Club might be the best gift you've ever given them.**

Here's how gifting works:

1. You purchase the Full Case ($74.99 — that's all 12 packets, prepaid)
2. We email you a printable gift card with a redemption code
3. Your recipient enters their address and chooses when to start
4. They get real evidence in the mail every two weeks for 6 months

**Mother's Day is May 11th.** Order by May 5th and we'll guarantee delivery of the first packet in time.

They get a 6-month investigation. You get "best gift ever" status. Everyone wins.

**[Gift a Case → coldcaseclub.au/gift]**

---

## Email 5: Last Chance / Urgency (Day 7 — 48hr delay)

**Subject:** The case file is closing, Detective.
**Preview:** Your evidence preview expires soon.

---

Detective,

This is your last briefing.

A week ago, you requested a preview of Case #1 — The Hargrove Disappearance. You saw the witness statement. The newspaper clipping. The coded message.

But here's what you haven't seen:

- The crime scene photographs that don't match the official report
- The letter Eleanor mailed the day before she vanished
- The second coded message — the one hidden inside a matchbook
- The final packet that reveals everything

**97% of investigators who start a case finish it.** That's not a subscription metric — it's a testament to how compelling the story is.

Two options:

**Monthly** — $14.99/mo. Cancel anytime. Pay as you investigate.
**The Full Case** — $74.99 one-time. (That's $6.25/packet. Less than a coffee.)

Both include all 12 evidence packets, all physical artifacts, and access to our investigator community.

**30-day money-back guarantee.** If you're not hooked, we'll refund you. No questions.

**[Start Your Case → coldcaseclub.au/#pricing]**

The evidence is waiting, Detective. Don't let this one go cold.

— The Cold Case Club Team

---

## Sequence Settings

| Email | Delay | Subject | Goal |
|-------|-------|---------|------|
| 1 | Immediate | Your evidence sample is here, Detective. | Deliver lead magnet, create intrigue |
| 2 | +24 hours | Three witnesses. Three different stories. | Deepen story hook, build desire |
| 3 | +48 hours | "My mom has a suspect board on her office wall" | Social proof, handle objections |
| 4 | +48 hours | Know a true crime fan? This gift will make their year. | Gift angle, Mother's Day urgency |
| 5 | +48 hours | The case file is closing, Detective. | Final urgency push, convert |

## Notes for CK

- **Suppression:** Remove subscribers from sequence once they purchase (use Stripe webhook → ESP integration)
- **Reply handling:** Email 1 asks for coded message answers — set up a filter or auto-reply. Replies = engagement = deliverability signal.
- **A/B test subjects:** Email 1 alt: "Case File #1 — Evidence Enclosed" / Email 5 alt: "Last chance to join the investigation"
- **Post-purchase:** Build a separate 3-email onboarding sequence (what to expect, when first packet ships, community invite)
- **Win-back:** If no purchase after 30 days, trigger a single "case reopened" email with a 10% discount code
