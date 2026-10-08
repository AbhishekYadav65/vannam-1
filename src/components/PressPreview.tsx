import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '../data/products';
import { rupees } from '../lib/theme';
import Photo from './Photo';
import './PressPreview.css';

/* ─────────────────────────────────────────────
   Touch devices: press & hold a product to peek at a big version over
   a blurred backdrop. Let go to dismiss.
   ───────────────────────────────────────────── */

interface PreviewCtx {
  show: (p: Product) => void;
  hide: () => void;
}
const Ctx = createContext<PreviewCtx | null>(null);

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const shownAt = useRef(0);

  const show = useCallback((p: Product) => {
    shownAt.current = Date.now();
    setProduct(p);
  }, []);
  const hide = useCallback(() => setProduct(null), []);

  // While open: lift finger = close, page can't scroll underneath.
  useEffect(() => {
    if (!product) return;
    const lift = (e: Event) => {
      // ignore a cancel fired immediately by the browser's own long-press handling
      if ((e.type === 'pointercancel' || e.type === 'touchcancel') && Date.now() - shownAt.current < 300) return;
      hide();
    };
    const block = (e: TouchEvent) => { if (e.cancelable) e.preventDefault(); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    window.addEventListener('pointerup', lift);
    window.addEventListener('pointercancel', lift);
    window.addEventListener('touchend', lift);
    window.addEventListener('touchcancel', lift);
    window.addEventListener('touchmove', block, { passive: false });
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerup', lift);
      window.removeEventListener('pointercancel', lift);
      window.removeEventListener('touchend', lift);
      window.removeEventListener('touchcancel', lift);
      window.removeEventListener('touchmove', block);
      window.removeEventListener('keydown', esc);
    };
  }, [product, hide]);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {product && (
          <motion.div
            className="peek"
            role="dialog"
            aria-label={`Preview of ${product.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={hide}
          >
            <motion.figure
              className="peek__card"
              initial={{ scale: 0.72, y: 40, rotateX: 24 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.88, y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <Photo product={product} index={0} eager />
              <figcaption className="peek__cap">
                <span className="peek__cat hand">{product.category}</span>
                <strong>{product.name}</strong>
                <span className="peek__price">{rupees(product.price)}</span>
              </figcaption>
            </motion.figure>
            <p className="peek__hint hand">let go to close</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export function usePreview() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePreview must be inside PreviewProvider');
  return ctx;
}

const HOLD_MS = 380;
const MOVE_TOLERANCE = 10;

/** Spread the returned handlers onto the element that should respond to press & hold. */
export function usePressPreview(product: Product) {
  const { show } = usePreview();
  const timer = useRef<number | undefined>(undefined);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);
  const suppressUntil = useRef(0);

  const clear = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  useEffect(() => clear, []);

  return {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') return; // desktop uses hover instead
      origin.current = { x: e.clientX, y: e.clientY };
      fired.current = false;
      clear();
      timer.current = window.setTimeout(() => {
        fired.current = true;
        suppressUntil.current = Date.now() + 1200;
        navigator.vibrate?.(12);
        show(product);
      }, HOLD_MS);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!origin.current || fired.current) return;
      if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) > MOVE_TOLERANCE) clear();
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    onContextMenu: (e: React.MouseEvent) => {
      if (fired.current || Date.now() < suppressUntil.current || window.matchMedia('(pointer: coarse)').matches) {
        e.preventDefault();
      }
    },
    // swallow the click that some browsers still fire after a long press
    onClickCapture: (e: React.MouseEvent) => {
      if (Date.now() < suppressUntil.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
  };
}
