import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import type { AnimationPlaybackControlsWithThen } from 'framer-motion';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/products';
import { useFX } from './FlowerFX';
import './ZipNav.css';

/* ─────────────────────────────────────────────
   The navbar is a zipper.
   Pull the tag across the strip and the pouch "unzips", revealing the
   menu inside its gingham lining. Tap the tag, press Enter, or drag.
   ───────────────────────────────────────────── */

const PULL_W = 60;

const LINKS = [
  { to: '/shop', label: 'Shop', note: 'every pouch' },
  { to: '/about', label: 'About', note: 'who sews' },
  { to: '/story', label: 'Story', note: 'the fabric' },
  { to: '/contact', label: 'Contact', note: 'say hello' },
];

const HINT_KEY = 'vannam-zip-hint';
const readHint = () => { try { return sessionStorage.getItem(HINT_KEY) === '1'; } catch { return false; } };
const writeHint = () => { try { sessionStorage.setItem(HINT_KEY, '1'); } catch { /* ignore */ } };

export default function ZipNav() {
  const { cartDispatch, cartCount, searchDispatch } = useStore();
  const { registerBag, bagPulse } = useFX();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const maxRef = useRef(1);
  const anim = useRef<AnimationPlaybackControlsWithThen | null>(null);
  const dragged = useRef(false);
  const liveRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(false);       // menu is at least partly unzipped
  const [maxX, setMaxX] = useState(300);
  const [hinted, setHinted] = useState(readHint);
  const [menuQuery, setMenuQuery] = useState('');

  /* paint the teeth + the opening wedge for the current slider position */
  const paint = useCallback((v: number) => {
    const t = trackRef.current;
    const m = menuRef.current;
    if (!t || !m) return;
    const p = Math.min(1, Math.max(0, v / maxRef.current));
    t.style.setProperty('--zx', `${v}px`);
    const vw = window.innerWidth;
    const apex = t.getBoundingClientRect().left + v + PULL_W / 2;
    const topX = apex + (vw - apex) * Math.pow(p, 4);
    const botX = Math.min(vw, apex * 1.8) + (vw - Math.min(vw, apex * 1.8)) * p * p;
    m.style.clipPath =
      p < 0.003 ? 'inset(0 100% 100% 0)' : `polygon(0 0, ${topX.toFixed(1)}px 0, ${botX.toFixed(1)}px 100%, 0 100%)`;
  }, []);

  useMotionValueEvent(x, 'change', v => {
    paint(v);
    const isLive = v > 2;
    if (isLive !== liveRef.current) { liveRef.current = isLive; setLive(isLive); }
  });

  const measure = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const max = Math.max(1, t.clientWidth - PULL_W);
    maxRef.current = max;
    setMaxX(max);
    if (liveRef.current && open) x.set(max);
    paint(x.get());
  }, [paint, x, open]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [measure]);

  const unzip = useCallback(() => {
    anim.current?.stop();
    setOpen(true);
    if (!hinted) { setHinted(true); writeHint(); }
    anim.current = animate(x, maxRef.current, { type: 'spring', stiffness: 120, damping: 20 });
  }, [x, hinted]);

  const zipUp = useCallback(() => {
    anim.current?.stop();
    setOpen(false);
    anim.current = animate(x, 0, { type: 'spring', stiffness: 160, damping: 24 });
  }, [x]);

  // close on navigation
  useEffect(() => { if (liveRef.current) zipUp(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pathname]);

  // Esc closes, body scroll locks while open
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') zipUp(); };
    window.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = prev; };
  }, [open, zipUp]);

  const onDragEnd = () => {
    const p = x.get() / maxRef.current;
    if (open ? p < 0.85 : p > 0.4) {
      if (open) zipUp(); else unzip();
    } else if (open) unzip();
    else zipUp();
    window.setTimeout(() => { dragged.current = false; }, 60);
  };

  const onMenuSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = menuQuery.trim();
    if (!q) return;
    setMenuQuery('');
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="zip" role="banner">
        <div className="zip__track" ref={trackRef}>
          <div className="zip__teeth zip__teeth--closed" aria-hidden="true" />
          <div className="zip__teeth zip__teeth--open" aria-hidden="true"><i /><i /></div>
          {!hinted && <span className="zip__hint hand" aria-hidden="true">pull to unzip →</span>}

          <motion.button
            type="button"
            className="zip__pull"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: maxX }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={() => { dragged.current = true; anim.current?.stop(); }}
            onDragEnd={onDragEnd}
            onClick={() => { if (!dragged.current) (open ? zipUp() : unzip()); }}
            aria-label={open ? 'Zip the menu shut' : 'Unzip the menu'}
            aria-expanded={open}
            aria-controls="zip-menu"
            whileTap={{ scale: 0.94 }}
          >
            <span className="zip__pull-body">
              <span className="zip__v">V</span>
              <span className="zip__pull-hole" />
            </span>
            <span className="zip__pull-tab" />
          </motion.button>
        </div>

        <div className="zip__tools">
          <button className="zip__btn" onClick={() => searchDispatch({ type: 'OPEN_SEARCH' })} aria-label="Search">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7.5" /><line x1="21" y1="21" x2="16.4" y2="16.4" />
            </svg>
          </button>
          <button
            className="zip__btn zip__btn--bag"
            ref={registerBag}
            onClick={() => cartDispatch({ type: 'TOGGLE' })}
            aria-label={`Shopping bag, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
          >
            <motion.svg
              key={bagPulse}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              animate={bagPulse ? { rotate: [0, -16, 14, -8, 0], scale: [1, 1.28, 1] } : undefined}
              transition={{ duration: 0.6 }}
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </motion.svg>
            {cartCount > 0 && (
              <motion.span
                className="zip__count"
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 14 }}
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>
      </header>

      {/* the inside of the pouch */}
      <div
        id="zip-menu"
        ref={menuRef}
        className="zipmenu"
        style={{ clipPath: 'inset(0 100% 100% 0)', visibility: live ? 'visible' : 'hidden' }}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="zipmenu__sheet">
          <Link to="/" className="zipmenu__home" aria-label="Vannam home"><span>V</span>annam</Link>

          <nav className="zipmenu__nav" aria-label="Main">
            {LINKS.map((l, i) => (
              <motion.div
                key={l.to}
                initial={false}
                animate={open ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 36, rotateX: -35 }}
                transition={{ delay: open ? 0.22 + i * 0.07 : 0, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={l.to} className={`zipmenu__link ${pathname.startsWith(l.to) ? 'is-active' : ''}`}>
                  <span className="zipmenu__num hand">0{i + 1}</span>
                  <span className="zipmenu__label">{l.label}</span>
                  <span className="zipmenu__note hand">{l.note}</span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            className="zipmenu__foot"
            initial={false}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: open ? 0.55 : 0, duration: 0.5 }}
          >
            <form className="zipmenu__search" onSubmit={onMenuSearch} role="search">
              <label htmlFor="zip-search" className="hand">looking for something?</label>
              <div>
                <input
                  id="zip-search"
                  type="search"
                  value={menuQuery}
                  onChange={e => setMenuQuery(e.target.value)}
                  placeholder="gingham, cherry, airwrap…"
                  enterKeyHint="search"
                />
                <button type="submit">Search</button>
              </div>
            </form>
            <div className="zipmenu__cats">
              {CATEGORIES.map(c => <Link key={c.slug} to={`/shop/${c.slug}`}>{c.label}</Link>)}
              <a href="https://www.instagram.com/vannam.ig" target="_blank" rel="noopener noreferrer">@vannam.ig ↗</a>
            </div>
          </motion.div>

          <button type="button" className="zipmenu__close hand" onClick={zipUp}>↑ zip me shut</button>
        </div>
      </div>
    </>
  );
}
