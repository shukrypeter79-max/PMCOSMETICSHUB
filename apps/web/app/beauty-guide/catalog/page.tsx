'use client';

import { useEffect, useMemo, useState } from 'react';

type CatalogItem = {
  id: number;
  name: string;
  category: string;
  country: string;
  price: number;
  rating: number;
  currency: string;
  description: string;
  is_demo: boolean;
};

type CatalogResponse = {
  is_demo: boolean;
  notice: string;
  page: number;
  limit: number;
  total: number;
  items: CatalogItem[];
};

const API_BASE = (process.env.NEXT_PUBLIC_CATALOG_API_URL || 'https://pmcosmetics-cloudflare-api.shukrypeter79.workers.dev').replace(/\/$/, '');
const PAGE_SIZE = 12;

export default function ConnectedCatalogPage() {
  const [query, setQuery] = useState('serum');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [notice, setNotice] = useState('Loading catalog connector…');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [selected, setSelected] = useState<CatalogItem[]>([]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const params = useMemo(() => {
    const next = new URLSearchParams({ q: query.trim(), page: String(page), limit: String(PAGE_SIZE), sort: 'rating', order: 'desc' });
    if (country) next.set('country', country);
    if (category) next.set('category', category);
    if (maxPrice) next.set('max_price', maxPrice);
    return next;
  }, [query, page, country, category, maxPrice]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/apps?${params.toString()}`, { signal: controller.signal, cache: 'no-store' });
        const body = await response.json() as CatalogResponse & { error?: string };
        if (!response.ok) throw new Error(body.error || `Catalog returned HTTP ${response.status}`);
        if (!body.is_demo || !Array.isArray(body.items) || typeof body.total !== 'number') {
          throw new Error('Catalog response did not match the expected demo API schema.');
        }
        setItems(body.items);
        setTotal(body.total);
        setConnected(true);
        setNotice(body.notice || 'Connected to the catalog demo API.');
      } catch (error) {
        if (controller.signal.aborted) return;
        setConnected(false);
        setItems([]);
        setTotal(0);
        setNotice(error instanceof Error ? error.message : 'Catalog connection failed.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [params]);

  function toggleCompare(item: CatalogItem) {
    setSelected((current) => current.some((entry) => entry.id === item.id)
      ? current.filter((entry) => entry.id !== item.id)
      : current.length < 3 ? [...current, item] : current);
  }

  function resetPage(action: () => void) {
    setPage(1);
    setSelected([]);
    action();
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] px-5 py-10 text-[#20251f]">
      <div className="mx-auto max-w-6xl">
        <a href="/beauty-guide" className="text-sm font-semibold text-[#526e58] underline underline-offset-4">← Beauty Guide</a>
        <header className="my-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#758579]">End-to-end connector demo</p><h1 className="mt-2 text-4xl font-semibold">Beauty Guide × Catalog API</h1><p className="mt-3 max-w-2xl leading-6 text-[#68716a]">Searches the catalog Worker directly, then lets you compare up to three returned entries. These are synthetic fixtures—not verified products, formulations, prices, or stock.</p></div>
          <span className={`rounded-full border px-3 py-2 text-xs font-semibold ${connected ? 'border-[#b8d5be] bg-[#edf6ee] text-[#315d3b]' : 'border-[#e7d7b4] bg-[#fff9eb] text-[#725d34]'}`}>{loading ? 'CONNECTING…' : connected ? 'CATALOG CONNECTED · DEMO DATA' : 'CONNECTOR UNAVAILABLE'}</span>
        </header>

        <section className="mb-6 rounded-2xl border border-[#e7d7b4] bg-[#fff9eb] p-4 text-sm leading-6 text-[#725d34]" role="status"><strong>Transparent source status:</strong> {notice} <span className="block break-all text-xs">{API_BASE}/apps</span></section>

        <section className="grid gap-3 rounded-2xl border border-[#e7e5dd] bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1 text-xs font-semibold text-[#59635b]">Search catalog<input value={query} onChange={(event) => resetPage(() => setQuery(event.target.value))} maxLength={100} placeholder="serum, cleanser…" className="rounded-lg border border-[#dfe2d9] px-3 py-2 text-sm font-normal" /></label>
          <label className="grid gap-1 text-xs font-semibold text-[#59635b]">Country<input value={country} onChange={(event) => resetPage(() => setCountry(event.target.value))} placeholder="e.g. Egypt" className="rounded-lg border border-[#dfe2d9] px-3 py-2 text-sm font-normal" /></label>
          <label className="grid gap-1 text-xs font-semibold text-[#59635b]">Category<select value={category} onChange={(event) => resetPage(() => setCategory(event.target.value))} className="rounded-lg border border-[#dfe2d9] px-3 py-2 text-sm font-normal"><option value="">All categories</option>{['Beauty', 'Skincare', 'Wellness', 'Care', 'Lifestyle', 'Essentials'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="grid gap-1 text-xs font-semibold text-[#59635b]">Maximum demo price (USD)<input type="number" min="0" step="0.01" value={maxPrice} onChange={(event) => resetPage(() => setMaxPrice(event.target.value))} placeholder="Any" className="rounded-lg border border-[#dfe2d9] px-3 py-2 text-sm font-normal" /></label>
        </section>

        <div className="my-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#68716a]"><span>{connected ? `${total} matching demo entries` : 'No results until the API responds'}{selected.length ? ` · ${selected.length}/3 selected to compare` : ''}</span><span>Connector: GET /apps · sorted by rating</span></div>
        {connected && items.length === 0 && <p className="rounded-xl bg-white p-8 text-center">No entries match these filters.</p>}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {items.map((item) => {
            const isSelected = selected.some((entry) => entry.id === item.id);
            return <article key={item.id} className="rounded-2xl border border-[#e7e5dd] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-xs uppercase tracking-wide text-[#879188]">{item.category} · {item.country}</p><h2 className="mt-1 text-lg font-semibold">{item.name}</h2></div><span className="rounded-full bg-[#f3f4ef] px-2 py-1 text-xs">#{item.id}</span></div><p className="mt-4 text-sm font-semibold">${item.price.toFixed(2)} {item.currency}</p><p className="mt-2 text-xs text-[#68716a]">Demo rating: {item.rating.toFixed(1)} · synthetic API fixture</p><p className="mt-3 text-xs leading-5 text-[#7b847b]">{item.description}</p><button type="button" aria-pressed={isSelected} onClick={() => toggleCompare(item)} disabled={!isSelected && selected.length >= 3} className="mt-4 w-full rounded-lg border border-[#dfe2d9] px-3 py-2 text-sm font-semibold disabled:opacity-50">{isSelected ? 'Remove from comparison' : 'Compare'}</button></article>;
          })}
        </section>

        {selected.length > 0 && <section className="mt-8 rounded-2xl border border-[#dce4d9] bg-[#f0f4ee] p-5"><h2 className="font-semibold">Side-by-side comparison</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{selected.map((item) => <div key={item.id} className="rounded-xl bg-white p-4"><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm">${item.price.toFixed(2)} {item.currency}</p><p className="text-xs text-[#68716a]">{item.category} · {item.country} · demo rating {item.rating.toFixed(1)}</p></div>)}</div></section>}

        <nav className="mt-8 flex items-center justify-center gap-4"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40">Previous</button><span className="text-sm">Page {page} / {totalPages}</span><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-40">Next</button></nav>
        <p className="mt-8 text-xs leading-5 text-[#8b938b]">This integration demonstrates a live API connection only when the status reads “CATALOG CONNECTED”. The API currently serves synthetic fixtures. It does not supply verified ingredient lists or suitability evidence, so this page does not claim skincare recommendations.</p>
      </div>
    </main>
  );
}
