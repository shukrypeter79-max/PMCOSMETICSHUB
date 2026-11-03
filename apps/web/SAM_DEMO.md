# SAM 3.1 image demo in the web app

The `/sam-demo` route offers a minimal image-upload flow for the SAM 3.1 API. It requires user confirmation, accepts one concise concept prompt, limits images to 5 MB, checks JPEG/PNG/WebP file signatures, and sends requests through a server-side Next.js route. The model key is read from the server-only `MODEL_API_KEY` environment variable.

## Local configuration

Set `MODEL_API_KEY` and `SAM_DEMO_ENABLED=true` in the environment used by the Next.js server (or in an untracked local `.env.local` file). Never use a `NEXT_PUBLIC_` prefix for the secret. Restart the dev server after setting these values. The API account must have access to `sam-3.1`.

Visit `/sam-demo`, select a non-sensitive image you are authorized to process, enter one noun phrase such as `cosmetic bottle`, and check the explicit consent box. A valid response can contain no matches. The UI currently displays raw box/mask records; it does **not** decode or draw mask overlays.

## Critical deployment warning

The endpoint can incur provider costs. It is disabled unless `SAM_DEMO_ENABLED=true`, but that flag is **not access control**. Do not enable it on a public deployment until authentication, distributed rate limiting/quotas, and request-size limits at the edge are configured and tested. Keep the provider key in the server secret store. Review provider retention/terms and event rules. Do not send customer or sensitive images without documented consent and retention handling. SAM segmentation is not product authentication, ingredient analysis, diagnosis, or treatment advice.

## Current limitations

This route is a Node.js Next.js API route and has not been verified on Cloudflare Pages/Workers. The API request is non-streaming and the UI displays raw mask tokens only. Add a compatible parser, overlay renderer, and tests for malformed inputs, prompt grammar, empty results, timeout, model access failures, and the target deployment runtime before public release.
