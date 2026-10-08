import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
import { lifestyleIndex, rupees, accentStyle } from '../lib/theme';
import { useAddToBag } from './FlowerFX';
import { usePressPreview } from './PressPreview';
import Photo from './Photo';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addToBag = useAddToBag();
  const press = usePressPreview(product);

  // pointer-driven 3D tilt (mouse only — touch uses press & hold instead)
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const grow = useMotionValue(1);
  const srx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sry = useSpring(ry, { stiffness: 220, damping: 18 });
  const sgrow = useSpring(grow, { stiffness: 300, damping: 22 });

  // Pointer tracking lives on the OUTER wrapper, which never tilts or scales.
  // (Tracking on the tilted element itself made it slip out from under the cursor → flicker.)
  const onEnter = (e: React.PointerEvent<HTMLElement>) => { if (e.pointerType === 'mouse') grow.set(1.045); };
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const reset = () => { rx.set(0); ry.set(0); grow.set(1); };

  const hasHover = product.images.length > 1;

  return (
    <motion.div
      className="pcard"
      style={accentStyle(product)}
      initial={{ opacity: 0, y: 40, rotateX: 22 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <motion.article
        className="pcard__body"
        style={{ rotateX: srx, rotateY: sry, scale: sgrow, transformPerspective: 900 }}
      >
        <Link to={`/product/${product.slug}`} className="pcard__link" {...press}>
          <div className="pcard__frame">
            <Photo product={product} index={0} />
            {hasHover && (
              <div className="pcard__alt">
                <Photo product={product} index={lifestyleIndex(product)} fill />
              </div>
            )}
            {product.discountPercent > 0 && <span className="pcard__badge">−{product.discountPercent}%</span>}
          </div>
          <div className="pcard__info">
            <p className="pcard__cat hand">{product.category}</p>
            <h3 className="pcard__name">{product.name}</h3>
          </div>
        </Link>
        <div className="pcard__buy">
          <p className="pcard__price">
            <span>{rupees(product.price)}</span>
            {product.mrp > product.price && <s>{rupees(product.mrp)}</s>}
          </p>
          <button
            className="pcard__add"
            onClick={e => addToBag(product, 1, e.currentTarget)}
            aria-label={`Add ${product.name} to bag`}
          >
            <span aria-hidden="true">＋</span> Add
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}
