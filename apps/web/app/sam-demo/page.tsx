'use client';

import { FormEvent, useEffect, useState } from 'react';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function isSingleConcept(value: string) {
  const prompt = value.trim().replace(/\s+/g, ' ');
  return Boolean(prompt) && prompt.length <= 120 && !/[;,+]/.test(prompt) && !/\b(and|or)\b/i.test(prompt);
}

export default function SamDemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [prompt, setPrompt] = useState('cosmetic bottle');
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult('');
    setMessage('');
    const cleanPrompt = prompt.trim().replace(/\s+/g, ' ');
    if (!file) { setMessage('Choose an image first.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { setMessage('Image must be smaller than 5 MB.'); return; }
    if (!consent) { setMessage('Please confirm that you want to send this image to Meta for segmentation.'); return; }
    if (!isSingleConcept(cleanPrompt)) {
      setMessage('Enter one short concept noun phrase, such as “cosmetic bottle”.');
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.set('image', file);
      body.set('prompt', cleanPrompt);
      body.set('consent', 'true');
      const response = await fetch('/api/segment', { method: 'POST', body, cache: 'no-store' });
      const data = await response.json() as { outputText?: string; empty?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || 'Segmentation request failed.');
      setResult(data.outputText || '');
      setMessage(data.empty ? 'Request completed with no matching objects.' : 'Segmentation records received. Raw mask records are shown below; no visual mask decoding is implemented yet.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-10 text-[#20251f]">
      <div className="mx-auto max-w-4xl">
        <a href="/beauty-guide" className="text-sm font-semibold text-[#526e58] underline underline-offset-4">← Back to Beauty Guide</a>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#758579]">Optional computer-vision demo</p>
        <h1 className="mt-2 text-4xl font-semibold">SAM 3.1 object segmentation</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[#68716a]">Name one object as a short noun phrase. The server sends your chosen image to Meta’s API and returns segmentation records. SAM locates objects; it does not verify products, ingredients, or skin conditions.</p>

        <form onSubmit={submit} className="mt-8 grid gap-6 rounded-3xl border border-[#e7e5dd] bg-white p-6 sm:p-8">
          <label className="grid gap-2 text-sm font-medium">Concept prompt
            <input value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={120} placeholder="cosmetic bottle" className="rounded-xl border border-[#dfe2d9] px-4 py-3 outline-none focus:border-[#728774]" />
            <span className="text-xs font-normal text-[#7b847b]">One concept only—e.g. “cosmetic bottle”. Don’t enter a command or a list.</span>
          </label>
          <label className="grid gap-2 text-sm font-medium">Image (JPEG, PNG, or WebP; max 5 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="rounded-xl border border-dashed border-[#dfe2d9] p-4 text-sm" />
          </label>
          {preview && <img src={preview} alt="Local preview of the selected image" className="max-h-[420px] w-full rounded-2xl bg-[#f3f4ef] object-contain" />}
          <label className="flex items-start gap-3 rounded-xl bg-[#fff9eb] p-4 text-sm leading-6 text-[#725d34]"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[#71866f]" /><span>I have permission to use this image and consent to sending it to Meta’s model API for segmentation. Don’t upload sensitive or private images.</span></label>
          <button disabled={busy} className="rounded-xl bg-[#29483c] px-5 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">{busy ? 'Segmenting…' : 'Find matching objects'}</button>
          {message && <p role="status" className="text-sm text-[#526157]">{message}</p>}
          {result && <div><h2 className="mb-2 font-semibold">Raw segmentation output</h2><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-[#18201b] p-4 text-xs leading-5 text-[#e7eee8]">{result}</pre></div>}
        </form>
        <p className="mt-5 text-xs leading-5 text-[#8b938b]">Private/local prototype only. The server disables this route unless SAM_DEMO_ENABLED=true. Do not enable on a public deployment until authentication and provider-cost rate limiting are implemented. Images are not saved by this app; provider processing follows provider terms.</p>
      </div>
    </main>
  );
}
