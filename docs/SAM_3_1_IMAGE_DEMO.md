# SAM 3.1 image segmentation prototype

This command-line prototype uses one SAM 3.1 concept prompt to segment matching objects in an image. It streams the provider's segmentation text records to stdout; it does not decode masks, store images, or modify catalog entries.

## Safety and scope

- Use only an HTTPS image URL that you are authorized to submit to Meta's API. The provider receives the URL and image content.
- Set `MODEL_API_KEY` in your local shell or deployment secret manager. Never place the API key in source control, a URL, a browser bundle, a screenshot, or chat.
- The script is a concept-prompt image example only. It does not process video, box/point prompts, product uploads, customer images, or production inventory.
- Use one short noun phrase per request (for example, `cosmetic bottle`), not instructions, questions, or comma/and/or-separated concepts. Run separate requests for separate concepts.
- Confidence and one-bit masks are requested. Provider access, pricing, retention, and current model behavior must be checked against the official account/docs and event rules. No result should be treated as product verification or medical guidance.

## Run locally

From the repository root, install the small optional dependency:

```sh
python -m pip install 'openai>=1.68.0'
export MODEL_API_KEY='your-secret-from-the-provider'
python tools/sam_segment.py --prompt 'cosmetic bottle' --image-url 'https://example.com/authorized-image.jpg'
```

The returned records contain frame/object markers, boxes, and mask payloads as documented by the provider. A zero-match completed response is a valid result. This prototype prints raw streamed records; a UI renderer still needs a compatible SAM parser to decode and overlay masks safely.

## Next integration step

For the Beauty Guide, keep segmentation optional and separate from recommendation logic: process a user-selected image only after clear consent, display the returned mask/box preview, and never infer ingredients, authenticity, stock, price, or skin condition from segmentation. Store media only with a documented retention policy. Add server-side secret handling, upload size/type limits, provider timeouts, and parser tests before exposing this as a public endpoint.
