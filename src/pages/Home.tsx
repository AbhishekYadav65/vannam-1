import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import productsData, { CATEGORIES, getImageUrl, getCategorySlug } from '../data/products';
import { accentFor, accentStyle, lifestyleIndex, rupees } from '../lib/theme';
import ProductCard from '../components/ProductCard';
import Carousel3D from '../components/Carousel3D';
import Photo from '../components/Photo';
import Tilt from '../components/Tilt';
import './Home.css';

const P = productsData.products;

/* ───────── hero: one sharp product in the middle of controlled chaos ───────── */

interface ChaosPhoto { kind: 'photo'; p: number; x: string; y: string; w: number; r: number; par: number; b: number; dur: number }
interface ChaosSwatch { kind: 'swatch'; cls: string; x: string; y: string; w: number; r: number; par: number; b: number; dur: number }
interface ChaosPetal { kind: 'petal'; x: string; y: string; w: number; r: number; par: number; b: number; dur: number; c: string }
type Chaos = ChaosPhoto | ChaosSwatch | ChaosPetal;

const CHAOS: Chaos[] = [
  { kind: 'photo', p: 1, x: '60%', y: '4%', w: 150, r: 12, par: 26, b: 2, dur: 7 },
  { kind: 'photo', p: 8, x: '89%', y: '16%', w: 132, r: -9, par: 42, b: 3.5, dur: 9 },
  { kind: 'photo', p: 4, x: '49%', y: '72%', w: 172, r: -14, par: 20, b: 1.5, dur: 8 },
  { kind: 'photo', p: 10, x: '83%', y: '70%', w: 140, r: 8, par: 34, b: 2.5, dur: 10 },
  { kind: 'photo', p: 6, x: '1%', y: '5%', w: 116, r: -12, par: 30, b: 2.5, dur: 8.5 },
  { kind: 'photo', p: 7, x: '27%', y: '84%', w: 128, r: 10, par: 24, b: 2, dur: 7.5 },
  { kind: 'photo', p: 3, x: '95%', y: '46%', w: 118, r: 14, par: 46, b: 4, dur: 11 },
  { kind: 'swatch', cls: 'sw-gingham', x: '38%', y: '3%', w: 92, r: 20, par: 36, b: 1, dur: 6 },
  { kind: 'swatch', cls: 'sw-polka', x: '71%', y: '40%', w: 84, r: -18, par: 50, b: 3, dur: 9 },
  { kind: 'swatch', cls: 'sw-chess', x: '9%', y: '88%', w: 96, r: 16, par: 28, b: 1.5, dur: 7 },
  { kind: 'swatch', cls: 'sw-button', x: '46%', y: '40%', w: 52, r: 0, par: 56, b: 2, dur: 6.5 },
  { kind: 'petal', x: '55%', y: '22%', w: 30, r: 40, par: 60, b: 1, dur: 5.5, c: '#FFD9E4' },
  { kind: 'petal', x: '78%', y: '90%', w: 26, r: -30, par: 52, b: 1, dur: 6.5, c: '#E3173E' },
  { kind: 'petal', x: '33%', y: '60%', w: 24, r: 70, par: 64, b: 1.5, dur: 7, c: '#FFD84D' },
  { kind: 'petal', x: '92%', y: '84%', w: 28, r: 10, par: 48, b: 2, dur: 5, c: '#FFB3CB' },
];

function ChaosItem({ item }: { item: Chaos }) {
  const style = {
    '--x': item.x, '--y': item.y, '--w': `${item.w}px`, '--r': `${item.r}deg`,
    '--par': item.par, '--b': `${item.b}px`, '--dur': `${item.dur}s`,
    '--dy': `${item.par % 2 ? -14 : 14}px`, '--dr': `${item.r > 0 ? 4 : -4}deg`,
  } as React.CSSProperties;

  return (
    <div className="chaos__item" style={style} aria-hidden="true">
      <div className="chaos__float">
        {item.kind === 'photo' && (
          <img
            src={getImageUrl(P[item.p].images[lifestyleIndex(P[item.p])].file)}
            alt=""
            loading="lazy"
            decoding="async"
            className="chaos__photo"
          />
        )}
        {item.kind === 'swatch' && <div className={`chaos__swatch ${item.cls}`} />}
        {item.kind === 'petal' && (
          <svg viewBox="0 0 24 24" style={{ fill: item.c }}>
            <path d="M12 1.5C18.5 7.5 18.5 16.5 12 22.5 5.5 16.5 5.5 7.5 12 1.5Z" />
          </svg>
        )}
      </div>
    </div>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const product = P[i];
  const accent = accentFor(product);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => setI(v => (v + 1) % P.length), 4200);
    return () => window.clearInterval(id);
  }, [reduced, paused]);

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === 'touch') return;
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.style.setProperty('--my', String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };

  return (
    <section
      ref={heroRef}
      className="hero panel"
      style={{ background: accent.bg, color: accent.fg, ...accentStyle(product) }}
      onPointerMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="chaos" aria-hidden="true">
        {CHAOS.map((c, k) => <ChaosItem key={k} item={c} />)}
      </div>

      <div className="hero__text">
        <motion.p className="hero__eyebrow hand" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          handmade in Coimbatore ✿
        </motion.p>
        <h1 className="hero__title">
          {['All things'].map(t => (
            <motion.span key={t} className="hero__line" initial={{ opacity: 0, y: 60, rotateX: -50 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>{t}</motion.span>
          ))}
          <motion.span className="hero__line hero__line--it" initial={{ opacity: 0, y: 60, rotateX: -50 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>cute &amp; functional</motion.span>
        </h1>
        <motion.p className="hero__sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Handcrafted pouches designed with personality in Coimbatore.
        </motion.p>
        <motion.div className="hero__cta" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <Link to="/shop" className="btn btn--ink">Explore the collection</Link>
          <Link to="/story" className="btn btn--ghost">Our story</Link>
        </motion.div>
      </div>

      <div className="hero__stage">
        <span className="hero__ring" aria-hidden="true" />
        <span className="hero__glow" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div
            key={product.id}
            className="hero__tag"
            initial={reduced ? { opacity: 0 } : { rotateY: -80, opacity: 0, scale: 0.82, y: 20 }}
            animate={reduced ? { opacity: 1 } : { rotateY: 0, opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { rotateY: 80, opacity: 0, scale: 0.86 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Tilt max={9}>
              <Link to={`/product/${product.slug}`} className="hero__card" style={accentStyle(product)} aria-label={`${product.name} — ${rupees(product.price)}`}>
                <Photo product={product} index={0} ratio="4 / 5" eager />
                <span className="hero__price">
                  <i aria-hidden="true" />
                  {rupees(product.price)}
                </span>
              </Link>
            </Tilt>
            <p className="hero__name">{product.name}</p>
          </motion.div>
        </AnimatePresence>
        <p className="hero__psst hand" aria-hidden="true">psst — this one! ↴</p>

        <div className="hero__dots" role="group" aria-label="Choose a pouch">
          {P.map((p, k) => (
            <button key={p.id} className={k === i ? 'is-on' : ''} onClick={() => setI(k)} aria-label={`Show ${p.name}`} aria-current={k === i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── ribbon ───────── */
const RIBBON = ['HANDMADE IN COIMBATORE', 'YKK ZIPPERS', 'QUILTED COTTON', 'SMART COMPARTMENTS', 'MADE WITH LOVE'];
function Ribbon() {
  const row = useMemo(() => RIBBON.flatMap(t => [t, '✿']), []);
  return (
    <div className="ribbon" aria-hidden="true">
      <div className="ribbon__track">
        {[0, 1].map(k => (
          <div className="ribbon__row" key={k}>
            {[...row, ...row].map((t, n) => <span key={n}>{t}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── categories ───────── */
const CAT_STYLE: Record<string, { bg: string; fg: string; hi: string; sh: string }> = {
  'hair-tool-pouches': { bg: 'var(--cherry)', fg: '#fff', hi: 'var(--butter)', sh: 'var(--ink)' },
  'makeup-pouches': { bg: 'var(--cobalt)', fg: '#fff', hi: 'var(--butter)', sh: 'var(--ink)' },
  'napkin-small-pouches': { bg: 'var(--butter)', fg: 'var(--ink)', hi: 'var(--cherry)', sh: 'var(--paper)' },
};

function Categories() {
  return (
    <section className="cats" aria-labelledby="cats-title">
      <div className="sec-head">
        <p className="eyebrow">pick a corner of the sewing table</p>
        <h2 id="cats-title" className="title-xl">Shop by <em>category</em></h2>
      </div>
      <div className="cats__grid">
        {CATEGORIES.map((c, k) => {
          const items = P.filter(p => getCategorySlug(p.category) === c.slug);
          const lead = items[0];
          const st = CAT_STYLE[c.slug];
          return (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 50, rotateX: 18 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: k * 0.12, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200 }}
            >
              <Tilt max={8} className="cat-tilt">
                <Link to={`/shop/${c.slug}`} className="cat panel stitch" style={{ background: st.bg, color: st.fg, ['--cat-hi' as string]: st.hi, ['--cat-sh' as string]: st.sh } as React.CSSProperties}>
                  <span className="cat__count hand">{items.length} {items.length === 1 ? 'style' : 'styles'}</span>
                  <span className="cat__name">{c.label}</span>
                  <span className="cat__photo">
                    <Photo product={lead} index={0} ratio="4 / 5" />
                  </span>
                  <span className="cat__go">Explore →</span>
                </Link>
              </Tilt>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ───────── story teaser ───────── */
function StoryTeaser() {
  const lead = P[2];
  return (
    <section className="teaser panel stitch" aria-labelledby="teaser-title">
      <motion.div
        className="teaser__photo"
        initial={{ opacity: 0, x: -60, rotate: -6 }}
        whileInView={{ opacity: 1, x: 0, rotate: -3 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <Tilt max={7}>
          <div className="teaser__frame">
            <Photo product={lead} index={lifestyleIndex(lead)} ratio="4 / 5" />
          </div>
        </Tilt>
        <span className="teaser__note hand" aria-hidden="true">stitched, not stamped</span>
      </motion.div>
      <motion.div
        className="teaser__text"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">the why</p>
        <h2 id="teaser-title" className="title-xl">Crafted for <em>everyday joy</em></h2>
        <p>Every Vannam pouch is meticulously handcrafted in Coimbatore, blending delightful patterns with protective padding and smart compartments to keep your essentials safe.</p>
        <Link to="/story" className="btn btn--paper">Read our story</Link>
      </motion.div>
    </section>
  );
}

/* ───────── page ───────── */
export default function Home() {
  const latest = P.slice(4);

  return (
    <div className="page home">
      <Hero />
      <Ribbon />
      <Carousel3D products={P} />
      <Categories />
      <StoryTeaser />

      <section className="latest" aria-labelledby="latest-title">
        <div className="sec-head sec-head--row">
          <div>
            <p className="eyebrow">fresh off the machine</p>
            <h2 id="latest-title" className="title-xl">Latest <em>additions</em></h2>
          </div>
          <Link to="/shop" className="sec-link">Shop all →</Link>
        </div>
        <div className="pgrid">
          {latest.map((p, k) => <ProductCard key={p.id} product={p} index={k} />)}
        </div>
      </section>

      <section className="finale panel" aria-labelledby="finale-title">
        <div className="finale__petals" aria-hidden="true">
          {Array.from({ length: 14 }, (_, k) => <i key={k} style={{ ['--k' as string]: k } as React.CSSProperties} />)}
        </div>
        <p className="eyebrow">last stop</p>
        <h2 id="finale-title" className="title-xl">Find your little <em>favourite.</em></h2>
        <Link to="/shop" className="btn btn--ink">Start looking</Link>
      </section>
    </div>
  );
}
