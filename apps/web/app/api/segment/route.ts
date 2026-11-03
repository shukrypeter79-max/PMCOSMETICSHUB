import { NextResponse } from 'next/server';

// This route is a local/private prototype. Do not enable on a public deployment
// until authenticated access and provider-cost rate limiting are in place.
export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_IMAGE_BYTES + 128 * 1024;
const MODEL_ENDPOINT = 'https://api.meta.ai/v1/responses';

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

function validConceptPrompt(raw: string): string | null {
  const prompt = raw.trim().replace(/\s+/g, ' ');
  if (!prompt || prompt.length > 120) return null;
  // Spaces are valid in noun phrases; only reject list separators and conjunction lists.
  if (/[;, +]/.test(prompt.replaceAll(' ', ''))) return null;
  if (/\b(and|or)\b/i.test(prompt)) return null;
  return prompt;
}

function detectImageType(bytes: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(request: Request) {
  // Fail closed. Public deployments must add real auth and distributed rate limiting first.
  if (process.env.SAM_DEMO_ENABLED !== 'true') return error('SAM demo is disabled until protected deployment is configured.', 503);
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey) return error('SAM demo is not configured on the server.', 503);

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data;')) {
    return error('Send an image and a concept prompt as multipart form data.', 400);
  }
  const declaredLength = Number(request.headers.get('content-length'));
  if (!Number.isFinite(declaredLength) || declaredLength <= 0 || declaredLength > MAX_MULTIPART_BYTES) {
    return error('Request must include Content-Length and stay below the 5 MB image limit.', 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error('Could not read the multipart image request.', 400);
  }

  const promptInput = form.get('prompt');
  const consent = form.get('consent');
  const image = form.get('image');
  if (consent !== 'true') return error('Consent is required before sending an image to the model provider.', 400);
  if (typeof promptInput !== 'string') return error('A single concept prompt is required.', 400);
  const prompt = validConceptPrompt(promptInput);
  if (!prompt) return error('Use one short noun phrase only (no lists, instructions, or questions).', 400);
  if (!(image instanceof File)) return error('Choose an image file.', 400);
  if (image.size < 1 || image.size > MAX_IMAGE_BYTES) return error('Image must be smaller than 5 MB.', 413);

  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    const verifiedMime = detectImageType(bytes);
    if (!verifiedMime) return error('Only valid JPEG, PNG, or WebP images are supported.', 415);
    const imageDataUrl = `data:${verifiedMime};base64,${bytes.toString('base64')}`;
    const upstream = await fetch(MODEL_ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        model: 'sam-3.1',
        input: [{
          type: 'message',
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageDataUrl },
          ],
        }],
        metadata: { mask_encoding: 'one_bit', include_confidence: 'true' },
        stream: false,
      }),
    });

    if (!upstream.ok) {
      // Do not return upstream payloads: they may contain request/provider details.
      return error(upstream.status === 404
        ? 'SAM 3.1 is unavailable for this API account or model ID.'
        : 'The segmentation provider could not complete this request.', 502);
    }

    const result = await upstream.json() as { output_text?: unknown; output?: unknown };
    let outputText = typeof result.output_text === 'string' ? result.output_text : '';
    if (!outputText && Array.isArray(result.output)) {
      outputText = result.output.flatMap((item) => {
        if (!item || typeof item !== 'object' || !('content' in item) || !Array.isArray(item.content)) return [];
        return item.content.flatMap((part) => part && typeof part === 'object' && 'text' in part && typeof part.text === 'string' ? [part.text] : []);
      }).join('\n');
    }
    return NextResponse.json({ outputText, empty: outputText.trim().length === 0 }, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch {
    return error('The segmentation request timed out or could not reach the provider.', 502);
  }
}
