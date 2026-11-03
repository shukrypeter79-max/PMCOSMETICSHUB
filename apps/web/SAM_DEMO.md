# SAM 3.1 image demo in the web app

The `/sam-demo` route offers a minimal image-upload flow for the SAM 3.1 API. It requires the user to confirm image submission, accepts a single concise concept prompt, limits images to 5 MB, and sends requests through a server-side Next.js route. The model key is read from the server-only `MODEL_API_KEY` environment variable.

## Local configuration

Set `MODEL_API_KEY` in the environment used by the Next.js server (or in an untracked local `.env.local` file). Never use a `NEXT_PUBLIC_` prefix for this secret. Restart the dev server after setting it. The API account must have access to `sam-3.1`.

Visit `/sam-demo`, select a non-sensitive image you are authorized to process, enter one noun phrase such as `cosmetic bottle`, and check the explicit consent box. A valid response can contain no matches. The UI currently displays raw box/mask records; it does **not** decode or draw mask overlays.

## Production blockers

The route is a prototype, not a production-ready public endpoint. Add per-user authentication and provider-cost rate limiting, enforce request-body limits at the edge, review provider retention/terms and event rules, and add tests for malformed inputs, timeout, model access failures, and empty results. Do not send customer or sensitive images without a documented consent and retention process. SAM segmentation is not product authentication, ingredient analysis, diagnosis, or treatment advice.
