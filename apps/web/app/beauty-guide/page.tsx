'use client';

import { useEffect, useMemo, useState } from 'react';

type Goal = 'hydration' | 'calm' | 'glow';
type DemoProduct = {
  id: string;
  name: string;
  type: string;
  price: number;
  currency: string;
  ingredients: string[];
  goals: Goal[];
  note: string;
  color: string;
};

// Fictional fixtures for the demo only. Never present these as real products, prices, or stock.
const DEMO_PRODUCTS: DemoProduct[] = [
  { id: 'demo-01', name: 'Cloudwater Barrier Cream', type: 'Moisturizer', price: 18, currency: 'USD', ingredients: ['glycerin', 'ceramides', 'fragrance-free'], goals: ['hydration', 'calm'], note: 'A simple demo formula focused on moisture and barrier support.', color: '#e5eee7' },
  { id: 'demo-02', name: 'Daybreak Dew Serum', type: 'Serum', price: 22, currency: 'USD', ingredients: ['glycerin', 'panthenol', 'fragrance-free'], goals: ['hydration', 'glow', 'calm'], note: 'Lightweight demo serum with humectant and soothing ingredient tags.', color: '#f0e9d8' },
  { id: 'demo-03', name: 'Soft Focus Vitamin Serum', type: 'Serum', price: 24, currency: 'USD', ingredients: ['niacinamide', 'panthenol', 'fragrance-free'], goals: ['glow', 'calm'], note: 'Demo listing tagged for a brighter-looking routine; no treatment claims.', color: '#eadff0' },
  { id: 'demo-04', name: 'Tidepool Gel Cleanser', type: 'Cleanser', price: 14, currency: 'USD', ingredients: ['glycerin', 'fragrance-free'], goals: ['hydration', 'calm'], note: 'A gentle-style fictional cleanser entry for the sample catalog.', color: '#dcecf0' },
  { id: 'demo-05', name: 'Golden Hour Comfort Mask', type: 'Mask', price: 16, currency: 'USD', ingredients: ['squalane', 'panthenol'], goals: ['hydration', 'glow'], note: 'A fictional rinse-off mask fixture; its attributes are sample data.', color: '#f1e4d6' },
  { id: 'demo-06', name: 'Quiet Garden Face Oil', type: 'Face oil', price: 20, currency: 'USD', ingredients: ['squalane', 'fragrance-free'], goals: ['hydration', 'calm'], note: 'A sample oil listing. Patch test new products and review full labels.', color: '#e8e7d8' },
];

const SAVED_STORAGE_KEY = 'pm-beauty-guide:saved:v1';
const VALID_PRODUCT_IDS = new Set(DEMO_PRODUCTS.map((product) => product.id));

const GOALS: { id: Goal; label: string; emoji: string }[] = [
  { id: 'hydration', label: 'More hydration', emoji: '💧' },
  { id: 'calm', label: 'A gentler-feeling routine', emoji: '🌿' },
  { id: 'glow', label: 'A fresh, bright look', emoji: '☀️' },
];

export default function BeautyGuidePage() {
  const [goal, setGoal] = useState<Goal>('hydration');
  const [budget, setBudget] = useState(25);
  const [avoidFragrance, setAvoidFragrance] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [savedLoaded, setSavedLoaded] = useState(false);
  const [compared, setCompared] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Keep the small demo wishlist in this browser only. Invalid/stale IDs are discarded.
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem(SAVED_STORAGE_KEY) ?? '[]');
      if (Array.isArray(stored)) {
        setSaved([...new Set(stored.filter((id): id is string => typeof id === 'string' && VALID_PRODUCT_IDS.has(id)))]);
      }
    } catch {
      // Ignore unavailable storage or malformed old data; the guide remains usable.
    } finally {
      setSavedLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!savedLoaded) return;
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Private browsing or a full storage quota should not break recommendations.
    }
  }, [saved, savedLoaded]);

  const ranked = useMemo(() => DEMO_PRODUCTS
    .filter((product) => product.price <= budget)
    .filter((product) => !avoidFragrance || product.ingredients.includes('fragrance-free'))
    .map((product) => {
      const goalMatch = product.goals.includes(goal);
      const reasons = [
        ...(goalMatch ? [`Tagged for ${GOALS.find((item) => item.id === goal)?.label.toLowerCase()}`] : []),
        ...(avoidFragrance && product.ingredients.includes('fragrance-free') ? ['Matches your fragrance-free preference'] : []),
        [`${product.currency} ${product.price} · within your demo budget`],
      ];
      return { product, reasons, score: Number(goalMatch) * 2 + Number(product.ingredients.includes('fragrance-free') && avoidFragrance) };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price),
  [goal, budget, avoidFragrance]);

  const visible = showAll ? ranked : ranked.slice(0, 3);
  const comparedProducts = DEMO_PRODUCTS.filter((product) => compared.includes(product.id));

  function toggle(id: string, values: string[], setter: (next: string[]) => void, max: number) {
    setter(values.includes(id) ? values.filter((value) => value !== id) : values.length < max ? [...values, id] : values);
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#20251f]" dir="ltr">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-7 sm:px-8">
        <header className="flex items-center justify-between border-b border-[#e4e1d8] pb-5">
          <a href="/" className="text-sm font-bold tracking-[0.18em] text-[#29483c]">PM / BEAUTY GUIDE</a>
          <span className="rounded-full border border-[#d9dfd4] bg-white px-3 py-1.5 text-xs font-medium text-[#526157]">HACKATHON DEMO</span>
        </header>

        <section className="grid gap-10 py-12 md:grid-cols-[1.05fr_.95fr] md:items-end md:py-16">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#758579]">A little more you, less guesswork</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Your routine, <span className="font-serif italic text-[#71866f]">thoughtfully</span> chosen.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#68716a]">Tell us what you’re looking for. Explore explainable suggestions that respect your preferences and budget.</p>
          </div>
          <aside className="rounded-2xl border border-[#e7d7b4] bg-[#fff9eb] p-5 text-sm leading-6 text-[#725d34]">
            <div className="mb-2 flex items-center gap-2 font-semibold"><span aria-hidden="true">✳</span> Transparent demo catalog</div>
            These products and prices are fictional sample data for the hackathon. They are not real listings, inventory, or medical advice. No external AI or product API is connected.
          </aside>
        </section>

        <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-3xl border border-[#e7e5dd] bg-white p-6 shadow-[0_8px_32px_rgba(47,57,45,.04)]">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-semibold">Your preferences</h2><span className="text-xs text-[#8b938b]">01 / 03</span></div>
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-[#59635b]">What matters today?</legend>
              <div className="space-y-2">
                {GOALS.map((item) => <button key={item.id} type="button" onClick={() => setGoal(item.id)} aria-pressed={goal === item.id} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition ${goal === item.id ? 'border-[#728774] bg-[#f1f5ef] text-[#314c3b]' : 'border-[#ecebe6] hover:bg-[#fafaf7]'}`}><span className="text-lg">{item.emoji}</span>{item.label}</button>)}
              </div>
            </fieldset>
            <div className="mt-7">
              <div className="mb-2 flex justify-between text-sm"><label htmlFor="budget" className="font-medium text-[#59635b]">Budget per item</label><span className="font-semibold">${budget}</span></div>
              <input id="budget" type="range" min="10" max="25" step="1" value={budget} onChange={(event) => setBudget(Number(event.target.value))} className="w-full accent-[#71866f]" />
              <div className="mt-1 flex justify-between text-xs text-[#9a9f99]"><span>$10</span><span>$25</span></div>
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-[#f7f7f3] p-3 text-sm leading-5 text-[#59635b]"><input type="checkbox" checked={avoidFragrance} onChange={(event) => setAvoidFragrance(event.target.checked)} className="mt-1 accent-[#71866f]" /><span><strong className="font-semibold text-[#354439]">Prefer fragrance-free</strong><br />Use the sample catalog tag as a filter.</span></label>
            <p className="mt-5 border-t border-[#eeede7] pt-4 text-xs leading-5 text-[#929890]">We use only these selections in this page. No profile or skin-health data is sent to a server.</p>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#879188]">Curated for your preferences</p><h2 className="mt-1 text-2xl font-semibold">A good place to start <span className="text-sm font-normal text-[#9ba099]">({ranked.length} matches)</span></h2></div>
              <button type="button" onClick={() => setShowAll((value) => !value)} className="text-sm font-semibold text-[#526e58] underline decoration-[#cad3c8] underline-offset-4">{showAll ? 'Show fewer' : 'View all matches'}</button>
            </div>

            {visible.length === 0 ? <div className="rounded-2xl border border-dashed border-[#d7d9d0] bg-white p-10 text-center"><p className="font-medium">No demo items match those filters.</p><p className="mt-2 text-sm text-[#7d857d]">Try a higher budget or change your preference.</p></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map(({ product, reasons }, index) => <article key={product.id} className="overflow-hidden rounded-2xl border border-[#e7e5dd] bg-white shadow-[0_8px_32px_rgba(47,57,45,.035)]">
                <div className="relative flex h-36 items-center justify-center" style={{ backgroundColor: product.color }}><span className="text-5xl" aria-hidden="true">{product.type === 'Cleanser' ? '🫧' : product.type === 'Mask' ? '🌙' : product.type === 'Face oil' ? '🌼' : '🧴'}</span><span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#667467]">Sample #{index + 1}</span><button type="button" aria-label={`${saved.includes(product.id) ? 'Remove' : 'Save'} ${product.name}`} aria-pressed={saved.includes(product.id)} onClick={() => toggle(product.id, saved, setSaved, DEMO_PRODUCTS.length)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-lg text-[#637b66]">{saved.includes(product.id) ? '♥' : '♡'}</button></div>
                <div className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a9389]">{product.type} · Demo fixture</p><h3 className="mt-1 font-semibold leading-5">{product.name}</h3></div><p className="shrink-0 text-sm font-semibold">${product.price}</p></div>
                  <p className="mt-3 text-xs leading-5 text-[#737c74]">{product.note}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{product.ingredients.map((ingredient) => <span key={ingredient} className="rounded-full bg-[#f3f4ef] px-2 py-1 text-[10px] text-[#657166]">{ingredient}</span>)}</div>
                  <details className="mt-4 border-t border-[#efeee9] pt-3"><summary className="cursor-pointer text-xs font-semibold text-[#526e58]">Why it matched</summary><ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-5 text-[#737c74]">{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><p className="mt-2 text-[10px] text-[#969d95]">Reasons are computed from the sample tags shown above.</p></details>
                  <button type="button" onClick={() => toggle(product.id, compared, setCompared, 3)} className={`mt-4 w-full rounded-xl border px-3 py-2 text-xs font-semibold transition ${compared.includes(product.id) ? 'border-[#728774] bg-[#f1f5ef] text-[#314c3b]' : 'border-[#e7e8e1] text-[#677268] hover:bg-[#fafaf7]'}`}>{compared.includes(product.id) ? '✓ Added to compare' : 'Add to compare'}</button>
                </div>
              </article>)}
            </div>}

            {comparedProducts.length > 0 && <section aria-live="polite" className="mt-6 rounded-2xl border border-[#dce4d9] bg-[#f0f4ee] p-5"><div className="flex items-center justify-between"><h3 className="font-semibold text-[#354439]">Your comparison <span className="text-xs font-normal">({comparedProducts.length}/3)</span></h3><button type="button" onClick={() => setCompared([])} className="text-xs text-[#657166] underline underline-offset-2">Clear</button></div><div className="mt-3 divide-y divide-[#dce4d9]">{comparedProducts.map((product) => <div key={product.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><span>{product.name}</span><span className="text-[#667467]">${product.price} · {product.ingredients.join(', ')}</span></div>)}</div></section>}
            {saved.length > 0 && <p className="mt-4 text-sm text-[#657166]" aria-live="polite">♥ {saved.length} {saved.length === 1 ? 'sample item' : 'sample items'} saved in this browser.</p>}
          </div>
        </section>

        <footer className="mt-14 border-t border-[#e4e1d8] pt-5 text-xs leading-5 text-[#8b938b]">PM Beauty Guide is a hackathon prototype. Sample products are fictional. Check full ingredient labels and consult a qualified professional for medical concerns.</footer>
      </div>
    </main>
  );
}
