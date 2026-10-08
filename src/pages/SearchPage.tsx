import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { POPULAR_SEARCHES, searchProducts } from '../lib/search';
import ProductCard from '../components/ProductCard';
import './Shop.css';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  const [draft, setDraft] = useState(query);

  useEffect(() => { setDraft(query); }, [query]);

  const { items, partial } = useMemo(() => searchProducts(query), [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (t) setParams({ q: t });
  };

  return (
    <div className="page shop">
      <header className="shop__head shop__head--search panel stitch">
        <p className="eyebrow">search</p>
        <motion.h1 className="title-xl" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          {query ? <>Results for <em>“{query}”</em></> : <>Find your <em>favourite</em></>}
        </motion.h1>
        <form className="shop__search shop__search--big" onSubmit={submit} role="search">
          <label htmlFor="search-q" className="sr-only">Search pouches</label>
          <input
            id="search-q"
            type="search"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Search pouches, fabrics, styles…"
            autoFocus={!query}
            enterKeyHint="search"
          />
          <button type="submit" className="btn btn--ink">Search</button>
        </form>
        {query && items.length > 0 && (
          <p className="shop__meta" aria-live="polite">
            {partial
              ? <>Nothing matched every word, so here are the closest {items.length} {items.length === 1 ? 'pouch' : 'pouches'}.</>
              : <>{items.length} {items.length === 1 ? 'pouch' : 'pouches'} found.</>}
          </p>
        )}
      </header>

      {items.length > 0 ? (
        <div className="pgrid">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      ) : (
        <section className="shop__empty panel stitch">
          <h2 className="title-xl">{query ? <>Nothing for <em>“{query}”</em></> : <>Type something <em>sweet</em></>}</h2>
          <p className="hand">try one of these</p>
          <div className="shop__chips">
            {POPULAR_SEARCHES.map(t => <Link key={t} to={`/search?q=${encodeURIComponent(t)}`}>{t}</Link>)}
          </div>
          <Link to="/shop" className="btn btn--ink">Browse everything</Link>
        </section>
      )}
    </div>
  );
}
