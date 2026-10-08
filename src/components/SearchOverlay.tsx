import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { POPULAR_SEARCHES, searchProducts } from '../lib/search';
import { rupees } from '../lib/theme';
import Photo from './Photo';
import './SearchOverlay.css';

const MAX_SUGGESTIONS = 5;

export default function SearchOverlay() {
  const { search, searchDispatch } = useStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [highlight, setHighlight] = useState(-1);
  const [shake, setShake] = useState(0);

  const close = () => searchDispatch({ type: 'CLOSE_SEARCH' });
  const query = search.query;

  const { items, partial } = useMemo(() => searchProducts(query), [query]);
  const suggestions = items.slice(0, MAX_SUGGESTIONS);

  useEffect(() => { setHighlight(-1); }, [query]);

  useEffect(() => {
    if (!search.isOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.clearTimeout(t); document.body.style.overflow = prev; };
  }, [search.isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && search.isOpen) close();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchDispatch({ type: search.isOpen ? 'CLOSE_SEARCH' : 'OPEN_SEARCH' });
      }
      // "/" opens search when you're not typing somewhere
      const el = document.activeElement as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing && !search.isOpen) {
        e.preventDefault();
        searchDispatch({ type: 'OPEN_SEARCH' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.isOpen, searchDispatch]);

  /** Enter: open the highlighted suggestion, otherwise run the full search. */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) { setShake(s => s + 1); return; }
    if (highlight >= 0 && highlight < suggestions.length) {
      navigate(`/product/${suggestions[highlight].slug}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const rows = suggestions.length + (items.length ? 1 : 0); // + "see all" row
    if (!rows) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => (h + 1) % rows); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => (h <= 0 ? rows - 1 : h - 1)); }
  };

  const seeAllActive = highlight === suggestions.length;

  return (
    <AnimatePresence>
      {search.isOpen && (
        <motion.div
          className="search"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="search__backdrop" onClick={close} />
          <motion.div
            className="search__panel"
            initial={{ y: -40, opacity: 0, rotateX: -12 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <form onSubmit={submit} role="search" className="search__form">
              <motion.div
                className="search__field"
                key={shake}
                animate={shake ? { x: [0, -10, 9, -6, 0] } : undefined}
                transition={{ duration: 0.4 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7.5" /><line x1="21" y1="21" x2="16.4" y2="16.4" />
                </svg>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={e => searchDispatch({ type: 'SET_QUERY', query: e.target.value })}
                  onKeyDown={onKeyDown}
                  placeholder="Search pouches, fabrics, styles…"
                  aria-label="Search products"
                  enterKeyHint="search"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={suggestions.length > 0}
                  aria-controls="search-suggestions"
                />
                <button type="submit" className="search__go">Search ↵</button>
              </motion.div>
              <button type="button" className="search__close" onClick={close} aria-label="Close search">esc</button>
            </form>

            {query.trim() ? (
              items.length > 0 ? (
                <ul className="search__list" id="search-suggestions" role="listbox">
                  {partial && <li className="search__note hand" role="presentation">nothing matched every word — closest matches:</li>}
                  {suggestions.map((p, i) => (
                    <li key={p.id} role="option" aria-selected={highlight === i}>
                      <Link
                        to={`/product/${p.slug}`}
                        className={`search__row ${highlight === i ? 'is-active' : ''}`}
                        onClick={close}
                        onMouseEnter={() => setHighlight(i)}
                      >
                        <Photo product={p} index={0} ratio="1 / 1" className="search__thumb" />
                        <span className="search__info">
                          <span className="search__cat hand">{p.category}</span>
                          <span className="search__name">{p.name}</span>
                        </span>
                        <span className="search__price">{rupees(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                  <li role="option" aria-selected={seeAllActive}>
                    <Link
                      to={`/search?q=${encodeURIComponent(query.trim())}`}
                      className={`search__all ${seeAllActive ? 'is-active' : ''}`}
                      onClick={close}
                      onMouseEnter={() => setHighlight(suggestions.length)}
                    >
                      See all {items.length} result{items.length === 1 ? '' : 's'} for “{query.trim()}” →
                    </Link>
                  </li>
                </ul>
              ) : (
                <div className="search__empty">
                  <p>No pouches found for “<em>{query.trim()}</em>”.</p>
                  <p className="hand">try one of these instead</p>
                  <div className="search__chips">
                    {POPULAR_SEARCHES.map(t => (
                      <button key={t} type="button" onClick={() => searchDispatch({ type: 'SET_QUERY', query: t })}>{t}</button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="search__empty">
                <p className="hand">popular right now</p>
                <div className="search__chips">
                  {POPULAR_SEARCHES.map(t => (
                    <button key={t} type="button" onClick={() => searchDispatch({ type: 'SET_QUERY', query: t })}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
