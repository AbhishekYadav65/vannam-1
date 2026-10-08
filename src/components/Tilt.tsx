import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { ReactNode } from 'react';

interface TiltProps {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  max?: number;
}

/**
 * Pointer-driven 3D tilt (mouse only). Children may use translateZ() to pop out.
 * Pointer tracking is on the outer, never-transformed box so the tilted content can't
 * slip out from under the cursor and make hover flicker.
 */
export default function Tilt({ children, className, max = 10 }: TiltProps) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 16 });
  const sry = useSpring(ry, { stiffness: 180, damping: 16 });

  return (
    <div
      className={className}
      onPointerMove={e => {
        if (e.pointerType !== 'mouse') return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * max);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      onPointerCancel={() => { rx.set(0); ry.set(0); }}
    >
      <motion.div
        className="tilt-inner"
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
