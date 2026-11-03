# Hackathon build plan: PMCosmeticsHub AI Beauty Guide

## The pitch

A multilingual, privacy-conscious beauty shopping assistant that helps people find skincare products suitable for their goals, budget, ingredients, and market. Instead of presenting a huge undifferentiated catalog, it explains each recommendation and flags ingredient concerns for the user to review.

## Why this is a stronger demo than a large catalog

A list of hundreds of generated products is not a product and must never be presented as real inventory. The demo should show one complete, trustworthy user journey: describe a goal, receive a few grounded recommendations, understand why they fit, compare options available in a selected market, and save a routine. Keep sample content clearly labeled as demo data until a licensed/authorized product source is connected.

## MVP demo flow

1. Select language and market; show only markets that have actually been configured.
2. Enter a skincare goal, preferences, budget, and optional ingredient avoid-list. Avoid requesting sensitive health details.
3. Get a short list of candidate products from the configured catalog, with source and availability labels.
4. Use a Meta model API, when authorized and configured, to turn the user request and retrieved catalog facts into concise recommendations. The model must not invent products, prices, ingredients, stock, or medical claims.
5. Show cited catalog facts, ingredient notes, uncertainty, and a clear reminder that this is not medical advice.
6. Compare items and save a routine locally or to an explicitly configured storage service.

## Technical outline

- **Frontend:** the repository's existing web framework; inspect and preserve it before implementation.
- **API:** Cloudflare Worker endpoints for health, configured markets, catalog search, and recommendations.
- **Catalog:** start with a small, clearly labeled fixture; replace it with an authorized source before claiming live products or availability.
- **AI:** server-side model API call only; use a secret stored in the deployment platform, never in source control or browser code. Validate model output and ground it in retrieved catalog records.
- **Safety:** validate request size and fields; rate-limit public endpoints; never expose tokens; do not make diagnosis or treatment claims; provide a non-AI fallback when the model API is unavailable.
- **Testing:** unit tests for market filtering, pagination, missing products, invalid input, and model failure; smoke-test the complete demo path.

## Success criteria for a credible submission

- A working end-to-end demo, not merely a large count of placeholder records.
- Clear distinction between demo fixtures and verified live catalog data.
- Every recommendation traceable to catalog facts; no invented inventory or pricing.
- At least one fully tested market/language flow; claim broader coverage only after validating each market's data and localization.
- A short README with setup steps, architecture, demo video/screenshots, known limitations, and responsible AI choices.

## Before public deployment

Configure real permitted data sources and market availability, review API-provider terms and hackathon rules, add authentication/rate limits as appropriate, and verify deployment logs. No live service or external API is connected by this plan alone.
