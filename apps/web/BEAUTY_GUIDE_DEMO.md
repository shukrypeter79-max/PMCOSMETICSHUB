# Demo guide route

Open `/beauty-guide` in the Next.js web app for the PM Beauty Guide prototype.

## What the demo shows

- Goal, budget, and fragrance-free preference filters.
- Explainable matching from explicit sample catalog tags.
- Fictional sample listings with transparent demo labels.
- A three-item comparison interaction and session-only saved items.

## Data and limitations

The page uses a small in-file fixture of fictional products. Product names, ingredient tags, and prices are illustrative only; they do not represent real inventory or verified formulations. The demo does not contact a model API, product provider, Cloudflare account, or external service. No personal preferences are sent to a server. The page makes no diagnosis, efficacy, stock, or availability claims.

## Local run

Use the repository's existing web workspace scripts and environment setup. The project is a monorepo; run the web app from its configured workspace rather than treating this route as a standalone application. API-backed product data, a model provider, and deployment credentials must be configured separately before claiming those integrations.
