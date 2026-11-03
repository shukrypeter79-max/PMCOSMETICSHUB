# PM Cosmetics Hub — hackathon branch

This branch contains a prototype beauty discovery experience and a Cloudflare Python Worker catalog fixture. It is separate from the repository's `main` branch, which currently appears to contain a GitHub learning exercise scaffold.

## Hackathon prototype

- **Beauty Guide:** `/beauty-guide` — deterministic preference, budget, fragrance-tag filters, explanations, local saved items, and comparison. It uses six fictional product entries directly in the page.
- **SAM demo:** `/sam-demo` — optional upload and concept-segmentation experiment. It is server-side and disabled unless configured; do not enable publicly without authentication, usage quotas, request limits, and verified provider access.
- **Catalog Worker:** `worker.py` — a separate Python Worker serving 600 synthetic records and 23 fixture country names. These are generated demo entries, not real products, prices, stock, or verified market availability. The Worker does not currently feed the Beauty Guide recommendations.

## Local checks

Run pure catalog tests with:

```sh
python -m unittest discover -s tests -v
```

Use the repository's Python Workers toolchain and `wrangler.jsonc` to run/deploy the Worker only after verifying Cloudflare account access and installed tools. Locate the actual Next.js workspace scripts before running its build; the repository root package scripts do not define the web app build.

## Connectors and truth in presentation

No live catalog provider, Meta model in the recommendation flow, payment gateway, email provider, or object storage integration has been verified from this branch. See `docs/REPOSITORY_CONNECTOR_AUDIT.md` and `docs/PRE_SUBMISSION_REVIEW.md`. Never commit credentials. Revoke the token in the previously shared clone URL if it was real.
