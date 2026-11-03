import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 120;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MODEL_ENDPOINT = 'https://api.meta.ai/v1/responses';

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function validConceptPrompt(raw: string): string | null {
  const prompt = raw.trim().replace(/\s+/g, ' ');
  if (!prompt || prompt.length > 120) return null;
  if (/[;, +]/.test(prompt) || /\b(and|or)\b/i.test(prompt)) return null;
  return prompt;
}

export async function POST(request: Request) {
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey) return error('SAM demo is not configured on the server.', 503);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error('Send an image and a concept prompt as multipart form data.', 400);
  }

  const promptInput = form.get('prompt');
  const consent = form.get('consent');
  const image = form.get('image');
  if (consent !== 'true') return error('Consent is required before sending an image to the model provider.', 400);
  if (typeof promptInput !== 'string') return error('A single concept prompt is required.', 400);
  const prompt = validConceptPrompt(promptInput);
  if (!prompt) return error('Use one short noun phrase only (no lists, instructions, or questions).', 400);
  if (!(image instanceof File)) return error('Choose an image file.', 400);
  if (!image.type.startsWith('image/')) return error('The selected file must be an image.', 400);
  if (image.size < 1 || image.size > MAX_IMAGE_BYTES) return error('Image must be smaller than 5 MB.', 413);

  try {
    const bytes = Buffer.from(await image.arrayBuffer());
    const imageDataUrl = `data:${image.type};base64,${bytes.toString('base64')}`;
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
        : 'The segmentation provider could not complete this request.', upstream.status === 404 ? 502 : 502);
    }

    const result = await upstream.json() as { output_text?: unknown; output?: unknown };
    let outputText = typeof result.output_text === 'string' ? result.output_text : '';
    if (!outputText && Array.isArray(result.output)) {
      outputText = result.output.flatMap((item) => {
        if (!item || typeof item !== 'object' || !('content' in item) || !Array.isArray(item.content)) return [];
        return item.content.flatMap((part) => part && typeof part === 'object' && 'text' in part && typeof part.text === 'string' ? [part.text] : []);
      }).join('\n');
    }
    return NextResponse.json({ outputText, empty: outputText.trim().length === 0 });
  } catch {
    return error('The segmentation request timed out or could not reach the provider.', 502);
  }
}
