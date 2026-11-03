# Comprehensive pre-submission review (2026-11-03)

## Status summary

The checked-out GitHub source for this review is the `hackathon/cloudflare-python-app-api` branch. It contains a Next.js Beauty Guide demo, an optional SAM 3.1 prototype, a Python Workers catalog scaffold, and local database backup/storage instructions. A deployment URL or user-provided announcement is not, by itself, proof that this branch is the code currently served there. We did not have Cloudflare account access or a runnable local workspace in this review, so no live deployment, API call, build, or backup restore is claimed as verified.

## Findings and actions

### Fixed in this review

- **SAM prompt bug:** the previous validator rejected spaces, so valid noun phrases such as `cosmetic bottle` were rejected. The client and server now allow multiword phrases while rejecting list separators and `and`/`or` lists.
- **SAM upload validation:** the route now requires multipart content with a declared bounded content length, enforces a 5 MiB file limit, and checks JPEG/PNG/WebP signatures instead of trusting the browser MIME type.
- **SAM public-cost exposure:** the API route now fails closed unless `SAM_DEMO_ENABLED=true`; documentation states this switch is not authentication. Keep the feature disabled on public deployment until authentication, distributed quotas/rate limits, and edge request-size controls are in place.
- **Caching:** SAM request results are marked `Cache-Control: no-store`.
- **Honesty of demo:** product fixtures remain explicitly fictional; no live catalog, inventory, currency conversion, or AI-backed recommendation is claimed.

### Still blocks a production/hackathon-ready claim

1. Run install, lint/typecheck, build, and the full desktop/mobile demo in the actual monorepo. The repository-level workspace layout seen in GitHub does not expose a conventional `apps/web/package.json`; verify the real build path before judging.
2. Verify Cloudflare deployment dashboard, account bindings, and both supplied `workers.dev` URLs. The user-reported status is not independently verified here.
3. Confirm whether the live catalog endpoint still returns generated sample records. If so, label every response as synthetic/demo and do not claim 600 real products or 23 supported countries.
4. SAM route: add auth, distributed rate limiting and quotas; confirm Meta endpoint/model access and response schema; decode masks and render an overlay; run tests for invalid prompt, corrupt/oversized image, no matches, 404/model access, timeout, and response parsing. It is currently a prototype and should remain disabled publicly.
5. Python Worker: add tests for query parsing, pagination bounds, missing IDs, unsupported methods, and bad parameters; run `uv run pywrangler dev`/deployment checks with the actual Cloudflare account. Do not claim a production build solely from a config file.
6. Storage: run Compose locally with a unique secret, create a backup, restore into a disposable database, and verify recovery. Never commit populated `.env` files or database dumps.
7. Revoke the credential embedded in the previously shared clone URL if it was real; remove it from shell history and avoid reusing it.
8. Confirm official hackathon rules, permitted data/API usage, track, deadline, and required deliverables. Do not present planned Meta model integration as implemented unless a real request and fallback have been tested.

## Review outcome

**Good demo direction; not yet verified release-ready.** Safest presentation is a working deterministic preference/compare flow with the sample-data label visible. Present SAM segmentation as optional experimental work unless a protected deployment and successful, consent-based API test are completed. Do not promise a prize result.
