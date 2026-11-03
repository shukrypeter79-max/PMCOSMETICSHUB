# Submission-ready project brief (working draft)

## Working title

**PM Beauty Guide — explainable skincare discovery, grounded in your preferences**

## One-line pitch

A beauty discovery guide that turns a shopper's goal, budget, and ingredient preferences into a short, explainable shortlist—without pretending generated advice or sample listings are verified product facts.

## Proposed theme and track

- **Theme:** Build for Your World — a practical, focused shopping experience for people overwhelmed by beauty-product choices.
- **Track:** Indie Developer, if submitting as an individual. Confirm the track against the official rules and actual team status before submission.

## Problem and solution

People face a noisy product catalog and struggle to compare products against a budget or ingredients they want to avoid. PM Beauty Guide makes those preferences explicit, ranks candidate catalog items with deterministic rules, and shows the exact attributes behind each match. The product concept can later support localized markets, but the prototype must not claim availability in 23 countries until product, currency, shipping, and regulatory data are actually verified in each one.

## What works in the current demo

- Select a discovery goal, set a per-item budget, and apply a fragrance-free tag preference.
- See a ranked shortlist with visible match reasons derived from displayed catalog tags.
- Compare up to three items and save items in browser local storage.
- Preference matching and saved-list handling run in the browser; this prototype sends no preference or skin-health data to a server.
- Catalog entries are fictional demo fixtures and are labeled as such. They are not real products, prices, formulations, stock, or medical advice.

## Meta-model integration plan (not yet connected)

Use a Meta model only after setting up the official event-provided API credentials and checking the current API docs and hackathon rules. Retrieve permitted catalog records first; send the model only the user's non-sensitive shopping preferences and those retrieved records. Ask it to summarize and explain a small candidate set, never to invent products, ingredients, prices, stock, country availability, or clinical outcomes. Validate all referenced product IDs against the retrieved set and retain the deterministic no-model fallback. Keep credentials server-side in the hosting secret store; never commit them or expose them in browser code.

The code currently has **no Meta Model API call**, no live product-provider connection, and no Cloudflare deployment. Do not describe those integrations as implemented until verified.

## 60-second demo narration

"Beauty shopping can mean sorting through hundreds of claims before finding anything that fits your budget. PM Beauty Guide starts with what matters to you: a goal, a price ceiling, and an ingredient preference. The shortlist changes immediately, and each card tells you exactly why it matched. Compare a few choices, then save them for later in this browser. The prototype uses clearly labeled fictional data so it never invents stock or makes medical claims. With permissioned catalog data and Meta models, the next step is a grounded natural-language explanation over verified records—with deterministic matching and a non-AI fallback keeping the experience reliable."

## Final-hour submission checklist

1. Check the current official event page, participant email, rules, submission deadline/time zone, and required deliverables. User-provided event summaries are helpful but do not replace the official rules.
2. Start the web app using the repository's actual workspace commands; exercise the complete recommendation, filter, compare, and saved-items flow on desktop and mobile widths.
3. If official Meta API credentials and documentation are available, integrate only through a server-side endpoint, then test invalid responses, timeout, and no-key fallback. Otherwise submit the working deterministic demo honestly; do not fabricate API usage.
4. Capture a short screen recording showing a preference change, an explanation, a comparison, and persistence after refresh. Avoid showing real customer information or credentials.
5. Ensure the entry says exactly which parts are implemented, what data is synthetic, and what remains planned. Submit through the official portal before its stated cutoff.
