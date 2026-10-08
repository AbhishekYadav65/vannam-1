import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import type { Product } from '../data/products';
import { accentFor, rupees, accentStyle, oppositeOf } from '../lib/theme';
import { useAddToBag } from './FlowerFX';
import { usePressPreview } from './PressPreview';
import Photo from './Photo';
import './Carousel3D.css';

/* ─────────────────────────────────────────────
   A curved, endlessly looping 3D strip of products.
   Drag / swipe / trackpad / arrow keys. The centre item is the one you can open.
   All per-frame work is done with direct style writes — no React re-renders while it moves.
   ───────────────────────────────────────────── */

const wrap = (d: number, n: number) => ((((d + n / 2) % n) + n) % n) - n / 2;

interface Geo { itemW: number; itemH: number; R: number; step: number; spacing: number }

function geometry(stageW: number): Geo {
  const itemW = stageW < 520 ? stageW * 0.56 : stageW < 900 ? 250 : 290;
  const itemH = itemW * 1.42;
  const R = itemW * 2.5;
  const chord = itemW * 1.12;
  const step = 2 * Math.asin(Math.min(1, chord / (2 * R)));
  return { itemW, itemH, R, step, spacing: chord };
}

interface ItemProps {
  product: Product;
  setRef: (el: HTMLDivElement | null) => void;
  onActivate: () => void;
}

function Item({ product, setRef, onActivate }: ItemProps) {
  const press = usePressPreview(product);
  return (
    <div className="c3d__item" ref={setRef} style={accentStyle(product)} {...press}>
      <button
        type="button"
        className="c3d__card"
        onClick={onActivate}
        aria-label={product.name}
        tabIndex={-1}
      >
        <Photo product={product} index={0} ratio="4 / 5" />
        <span className="c3d__tag">
          <span className="c3d__tag-name">{product.name}</span>
          <span className="c3d__tag-price">{rupees(product.price)}</span>
        </span>
        <span className="c3d__shade" />
      </button>
    </div>
  );
}

export default function Carousel3D({ products }: { products: Product[] }) {
  const n = products.length;
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const addToBag = useAddToBag();

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);

  const pos = useRef(0);          // fractional index sitting at the centre
  const target = useRef(0);       // where inertia / snapping is heading
  const vel = useRef(0);          // index units per second while coasting
  const dragging = useRef(false);
  const moved = useRef(0);
  const geo = useRef<Geo>(geometry(1200));
  const raf = useRef(0);
  const lastT = useRef(0);
  const interacted = useRef(false);
  const wheelTimer = useRef<number | undefined>(undefined);
  const hovering = useRef(false);
  const tilt = useRef(0);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const render = useCallback(() => {
    const g = geo.current;
    const centre = ((Math.round(pos.current) % n) + n) % n;
    if (centre !== activeRef.current) {
      activeRef.current = centre;
      setActive(centre);
    }
    for (let i = 0; i < n; i++) {
      const el = items.current[i];
      if (!el) continue;
      const d = wrap(i - pos.current, n);
      const th = d * g.step;
      const ad = Math.abs(d);
      if (Math.abs(th) > 1.62) {
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.visibility = 'visible';
      const x = g.R * Math.sin(th);
      const z = g.R * Math.cos(th) - g.R;
      const y = -(d * d) * 15;              // the strip curls up at both ends
      el.style.transform =
        `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${th.toFixed(4)}rad) rotateZ(${(d * -1.6).toFixed(2)}deg)`;
      el.style.zIndex = String(Math.round(100 - ad * 10));
      el.style.opacity = String(Math.max(0, 1 - Math.max(0, ad - 2.4) / 0.9));
      el.style.setProperty('--shade', String(Math.min(0.55, ad * 0.2)));
      el.style.pointerEvents = ad < 3.2 ? 'auto' : 'none';
    }
  }, [n]);

  const tick = useCallback((t: number) => {
    const dt = Math.min(0.05, (t - lastT.current) / 1000 || 0.016);
    lastT.current = t;
    if (!dragging.current) {
      if (Math.abs(vel.current) > 0.12) {
        pos.current += vel.current * dt;
        vel.current *= Math.pow(0.04, dt);       // friction
        target.current = Math.round(pos.current + vel.current * 0.25);
      } else {
        vel.current = 0;
        const diff = target.current - pos.current;
        pos.current += diff * (1 - Math.pow(0.0009, dt)); // critically-damped-ish settle
        if (Math.abs(diff) < 0.0008) pos.current = target.current;
      }
    }
    render();
    const idle = !dragging.current && vel.current === 0 && Math.abs(target.current - pos.current) < 0.0008;
    if (idle) { raf.current = 0; return; }
    raf.current = requestAnimationFrame(tick);
  }, [render]);

  const wake = useCallback(() => {
    if (!raf.current) {
      lastT.current = performance.now();
      raf.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const goTo = useCallback((index: number, userAction = true) => {
    if (userAction) interacted.current = true;
    const base = Math.round(pos.current);
    target.current = base + wrap(index - base, n);
    vel.current = 0;
    wake();
  }, [n, wake]);

  const step = useCallback((dir: number) => {
    interacted.current = true;
    target.current = Math.round(target.current) + dir;
    vel.current = 0;
    wake();
  }, [wake]);

  /* layout + first paint */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const apply = () => {
      geo.current = geometry(stage.clientWidth);
      const g = geo.current;
      stage.style.setProperty('--iw', `${g.itemW}px`);
      stage.style.setProperty('--ih', `${g.itemH}px`);
      stage.style.perspective = `${g.itemW * 4.4}px`;
      render();
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [render]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /* page scroll tilts the whole strip a little — scrolling feels spatial */
  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      const sec = sectionRef.current, ring = ringRef.current;
      if (!sec || !ring) return;
      const r = sec.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; // −1…1
      tilt.current = Math.max(-1, Math.min(1, p));
      ring.style.transform = `rotateX(${(tilt.current * 9).toFixed(2)}deg) translateY(${(tilt.current * 14).toFixed(1)}px)`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  /* gentle auto-advance until the visitor touches it */
  useEffect(() => {
    if (reduced) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 });
    if (sectionRef.current) io.observe(sectionRef.current);
    const id = window.setInterval(() => {
      if (!visible || interacted.current || hovering.current || dragging.current || document.hidden) return;
      target.current = Math.round(target.current) + 1;
      wake();
    }, 3600);
    return () => { io.disconnect(); window.clearInterval(id); };
  }, [reduced, wake]);

  /* horizontal wheel / trackpad swipe (vertical wheel still scrolls the page) */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return;
      e.preventDefault();
      interacted.current = true;
      const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
      pos.current += dx / (geo.current.spacing * 1.1);
      target.current = Math.round(pos.current);
      vel.current = 0;
      window.clearTimeout(wheelTimer.current);
      wheelTimer.current = window.setTimeout(() => { target.current = Math.round(pos.current); wake(); }, 90);
      wake();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [wake]);

  /* drag / swipe with inertia */
  const last = useRef({ x: 0, t: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging.current = true;
    interacted.current = true;
    moved.current = 0;
    vel.current = 0;
    last.current = { x: e.clientX, t: performance.now() };
    wake();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const now = performance.now();
    const dx = e.clientX - last.current.x;
    moved.current += Math.abs(dx);
    if (moved.current > 6) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const di = -dx / geo.current.spacing;
    pos.current += di;
    const dt = Math.max(1, now - last.current.t) / 1000;
    vel.current = vel.current * 0.6 + (di / dt) * 0.4;
    last.current = { x: e.clientX, t: now };
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(vel.current) < 0.4) vel.current = 0;
    vel.current = Math.max(-9, Math.min(9, vel.current));
    target.current = Math.round(pos.current + vel.current * 0.2);
    wake();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'Enter') { navigate(`/product/${products[activeRef.current].slug}`); }
  };

  const activate = (i: number) => {
    if (moved.current > 6) return;           // that was a drag, not a click
    if (i === activeRef.current) navigate(`/product/${products[i].slug}`);
    else goTo(i);
  };

  const cur = products[active];
  const accent = accentFor(cur);

  return (
    <section
      ref={sectionRef}
      className="c3d panel"
      style={{ ['--stage' as string]: accent.bg, ['--stage-fg' as string]: accent.fg, ['--stage-hi' as string]: accent.hi, ['--stage-sh' as string]: oppositeOf(accent.fg) } as React.CSSProperties}
      aria-roledescription="carousel"
      aria-label="Pouches in 3D — drag or use the arrow keys"
    >
      <header className="c3d__head">
        <div>
          <p className="c3d__kicker hand">spin it, drag it, open it</p>
          <h2 className="c3d__title">The <em>runway</em></h2>
        </div>
        <div className="c3d__arrows">
          <button className="c3d__arrow" onClick={() => step(-1)} aria-label="Previous pouch">←</button>
          <button className="c3d__arrow" onClick={() => step(1)} aria-label="Next pouch">→</button>
        </div>
      </header>

      <div
        className="c3d__stage"
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => { hovering.current = true; }}
        onMouseLeave={() => { hovering.current = false; }}
      >
        <div className="c3d__ring" ref={ringRef}>
          {products.map((p, i) => (
            <Item
              key={p.id}
              product={p}
              setRef={el => { items.current[i] = el; }}
              onActivate={() => activate(i)}
            />
          ))}
        </div>
        <span className="c3d__floor" aria-hidden="true" />
      </div>

      <footer className="c3d__caption" aria-live="polite">
        <div>
          <span className="c3d__count hand">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <h3>{cur.name}</h3>
          <p>{cur.shortDescription}</p>
        </div>
        <div className="c3d__cta">
          <strong>{rupees(cur.price)}</strong>
          <button className="btn btn--ink" onClick={e => addToBag(cur, 1, e.currentTarget)}>＋ Add to bag</button>
          <button className="btn btn--ghost" onClick={() => navigate(`/product/${cur.slug}`)}>Open</button>
        </div>
      </footer>
    </section>
  );
}
