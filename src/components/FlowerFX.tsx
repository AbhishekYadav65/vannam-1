import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Product } from '../data/products';
import { getImageUrl } from '../data/products';
import { useStore } from '../store/useStore';
import './FlowerFX.css';

/* ─────────────────────────────────────────────
   Petal burst + fly-to-bag for "add to bag".
   One fixed, click-through layer for the whole app.
   ───────────────────────────────────────────── */

const PETAL_COLOURS = ['#FF4F8B', '#FFB3CB', '#E3173E', '#FFD9E4', '#FFD84D', '#FF8FB1'];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface PetalSpec {
  id: number;
  colour: string;
  dx: number;
  rise: number;
  fall: number;
  sway: number;
  rot0: number;
  rotSpan: number;
  scale: number;
  duration: number;
  delay: number;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  image?: string;
  petals: PetalSpec[];
  target: { x: number; y: number } | null;
}

interface FXContextType {
  burst: (opts: { x: number; y: number; image?: string; label?: string }) => void;
  registerBag: (el: HTMLElement | null) => void;
  bagPulse: number;
}

const FXContext = createContext<FXContextType | null>(null);

let burstId = 0;

export function FXProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [bagPulse, setBagPulse] = useState(0);
  const [message, setMessage] = useState('');
  const bagRef = useRef<HTMLElement | null>(null);

  const registerBag = useCallback((el: HTMLElement | null) => { bagRef.current = el; }, []);

  const burst = useCallback<FXContextType['burst']>(({ x, y, image, label }) => {
    const n = reduced ? 5 : 16;
    const petals: PetalSpec[] = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rand(-0.35, 0.35);
      const dist = reduced ? 40 : rand(70, 190);
      return {
        id: i,
        colour: PETAL_COLOURS[i % PETAL_COLOURS.length],
        dx: Math.cos(a) * dist,
        rise: Math.sin(a) * dist - rand(30, 90),
        fall: reduced ? 20 : rand(70, 190),
        sway: rand(-46, 46),
        rot0: rand(-90, 90),
        rotSpan: rand(-420, 420),
        scale: rand(0.8, 1.5),
        duration: reduced ? 0.8 : rand(1.3, 2.1),
        delay: rand(0, 0.12),
      };
    });
    const rect = bagRef.current?.getBoundingClientRect();
    const target = rect && !reduced ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
    const id = ++burstId;
    setBursts(b => [...b, { id, x, y, image, petals, target }]);
    if (!target) setBagPulse(p => p + 1);
    if (label) setMessage(`Added ${label} to your bag`);
    window.setTimeout(() => setBursts(b => b.filter(item => item.id !== id)), 2600);
  }, [reduced]);

  const value = useMemo(() => ({ burst, registerBag, bagPulse }), [burst, registerBag, bagPulse]);

  return (
    <FXContext.Provider value={value}>
      {children}
      <div className="fx-layer" aria-hidden="true">
        {bursts.map(b => (
          <BurstView key={b.id} burst={b} onLand={() => setBagPulse(p => p + 1)} />
        ))}
      </div>
      <div className="sr-only" role="status" aria-live="polite">{message}</div>
    </FXContext.Provider>
  );
}

function BurstView({ burst, onLand }: { burst: Burst; onLand: () => void }) {
  const { x, y, petals, image, target } = burst;
  return (
    <>
      {petals.map(p => (
        <motion.svg
          key={p.id}
          className="fx-petal"
          viewBox="0 0 24 24"
          width={18}
          height={18}
          style={{ left: x - 9, top: y - 9, fill: p.colour }}
          initial={{ x: 0, y: 0, scale: 0.2, rotate: p.rot0, opacity: 1 }}
          animate={{
            x: [0, p.dx * 0.55, p.dx + p.sway],
            y: [0, p.rise, p.rise + p.fall],
            rotate: [p.rot0, p.rot0 + p.rotSpan * 0.5, p.rot0 + p.rotSpan],
            rotateY: [0, 160, 340],
            scale: [0.2, p.scale, p.scale * 0.7],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut', times: [0, 0.35, 1] }}
        >
          <path d="M12 1.5C18.5 7.5 18.5 16.5 12 22.5 5.5 16.5 5.5 7.5 12 1.5Z" />
          <path d="M12 5v14" stroke="rgba(255,255,255,.55)" strokeWidth="0.8" fill="none" />
        </motion.svg>
      ))}

      {image && target && (
        <motion.img
          src={image}
          alt=""
          className="fx-fly"
          initial={{ x: x - 28, y: y - 28, scale: 0.7, opacity: 0 }}
          animate={{
            x: [x - 28, (x + target.x) / 2 - 130, target.x - 28],
            y: [y - 28, target.y + (y - target.y) * 0.45, target.y - 28],
            scale: [0.7, 1.15, 0.25],
            rotate: [0, -12, 26],
            opacity: [0, 1, 0.9],
          }}
          transition={{ duration: 0.95, delay: 0.3, times: [0, 0.45, 1], ease: 'easeInOut' }}
          onAnimationComplete={onLand}
        />
      )}
    </>
  );
}

export function useFX() {
  const ctx = useContext(FXContext);
  if (!ctx) throw new Error('useFX must be inside FXProvider');
  return ctx;
}

/** Adds to the bag *and* plays the petal + fly-to-bag animation from `origin`. */
export function useAddToBag() {
  const { cartDispatch } = useStore();
  const { burst } = useFX();
  return useCallback(
    (product: Product, quantity = 1, origin?: Element | null) => {
      cartDispatch({ type: 'ADD', product, quantity });
      const r = origin?.getBoundingClientRect();
      burst({
        x: r ? r.left + r.width / 2 : window.innerWidth / 2,
        y: r ? r.top + r.height / 2 : window.innerHeight / 2,
        image: getImageUrl(product.images[0].file),
        label: product.name,
      });
    },
    [cartDispatch, burst],
  );
}
