# Beauty Guide catalog connector

The optional `/beauty-guide/catalog` route fetches search, country, category, price and pagination results directly from the catalog Worker at `NEXT_PUBLIC_CATALOG_API_URL` (defaults to the user-provided `https://pmcosmetics-cloudflare-api.shukrypeter79.workers.dev`). The browser expects the Worker `/apps` response schema with `is_demo: true`, `items`, and `total`, and relies on its read-only CORS headers. The UI reports connection failures and never silently substitutes local results.

The page permits comparing up to three returned entries. It intentionally does not label them personalized skincare recommendations: the Worker does not provide verified formulations or ingredient data. All records are synthetic demo fixtures.

Before a presentation, confirm the Cloudflare deployment revision and test `/health`, `/countries`, `/categories`, and `/apps?q=serum&limit=12`. Verify the page shows `CATALOG CONNECTED · DEMO DATA`; otherwise present the static Beauty Guide and state the connector is unavailable. Neither the supplied worker URL nor deployment state was independently verified during implementation.
