import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import productsData, { getCategorySlug } from '../data/products';
import { accentStyle, rupees } from '../lib/theme';
import { useAddToBag } from '../components/FlowerFX';
import ProductCard from '../components/ProductCard';
import Photo from '../components/Photo';
import Tilt from '../components/Tilt';
import './ProductPage.css';

const SUGGESTION_COUNT = 4;

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { wishlistDispatch, isWished } = useStore();
  const addToBag = useAddToBag();

  const product = productsData.products.find(p => p.slug === slug);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => { setActive(0); setQty(1); }, [slug]);

  /** same category first, then whatever is closest in price */
  const related = useMemo(() => {
    if (!product) return [];
    const others = productsData.products.filter(p => p.id !== product.id);
    const byPrice = (a: typeof product, b: typeof product) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
    const same = others.filter(p => p.category === product.category).sort(byPrice);
    const rest = others.filter(p => p.category !== product.category).sort(byPrice);
    return [...same, ...rest].slice(0, SUGGESTION_COUNT);
  }, [product]);

  if (!product) {
    return (
      <div className="page">
        <section className="pp-missing panel stitch">
          <h1 className="title-xl">Product <em>not found</em></h1>
          <button onClick={() => navigate('/shop')} className="btn btn--ink">Back to shop</button>
        </section>
      </div>
    );
  }

  const wished = isWished(product.id);
  const details = Object.entries(product.details);
  const img = product.images[active];

  return (
    <div className="page pp">
      <nav className="pp__crumbs" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/shop/${getCategorySlug(product.category)}`}>{product.category}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pp__top">
        {/* ── gallery on a loud stage ── */}
        <div className="pp__gallery panel stitch" style={accentStyle(product)}>
          <Tilt max={7} className="pp__tilt">
            <div className="pp__frame">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${product.id}-${active}`}
                  initial={{ opacity: 0, rotateY: -35, scale: 0.94 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 35, scale: 0.94 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformPerspective: 1000 }}
                >
                  <Photo product={product} index={active} eager />
                </motion.div>
              </AnimatePresence>
            </div>
          </Tilt>
          <p className="pp__kind hand" aria-live="polite">{img.kind === 'studio' ? 'on white' : img.kind === 'lifestyle' ? 'in the wild' : 'all the details'}</p>

          {product.images.length > 1 && (
            <div className="pp__thumbs" role="tablist" aria-label="Product photos">
              {product.images.map((im, i) => (
                <button
                  key={im.file}
                  role="tab"
                  aria-selected={i === active}
                  className={`pp__thumb ${i === active ? 'is-on' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Photo ${i + 1} of ${product.images.length}`}
                >
                  <Photo product={product} index={i} ratio="1 / 1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── info ── */}
        <motion.div className="pp__info" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <p className="eyebrow">{product.category}</p>
          <h1 className="pp__title">{product.name}</h1>
          <p className="pp__price">
            <span>{rupees(product.price)}</span>
            {product.mrp > product.price && <><s>{rupees(product.mrp)}</s><b>−{product.discountPercent}%</b></>}
          </p>
          <p className="pp__desc">{product.description}</p>

          <ul className="pp__tags" aria-label="Tags">
            {product.tags.map(t => <li key={t}>{t}</li>)}
          </ul>

          <div className="pp__buy">
            <div className="pp__qty" role="group" aria-label="Quantity">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity">＋</button>
            </div>
            <button className="btn btn--cherry pp__add" onClick={e => addToBag(product, qty, e.currentTarget)}>Add to bag</button>
            <button
              className={`pp__wish ${wished ? 'is-on' : ''}`}
              onClick={() => wishlistDispatch({ type: 'TOGGLE_WISH', productId: product.id })}
              aria-pressed={wished}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <a href="https://www.instagram.com/vannam.ig" target="_blank" rel="noopener noreferrer" className="btn btn--ink pp__dm">DM to order on Instagram ↗</a>

          <div className="pp__sheet">
            <section>
              <h2>Highlights</h2>
              <ul>{product.highlights.map(h => <li key={h}>{h}</li>)}</ul>
            </section>
            <section>
              <h2>Fabric &amp; care</h2>
              <p>{product.fabric}</p>
            </section>
            {details.length > 0 && (
              <section>
                <h2>Details</h2>
                <ul>
                  {details.map(([k, v]) => <li key={k}><strong>{k.charAt(0).toUpperCase() + k.slice(1)}:</strong> {v}</li>)}
                </ul>
              </section>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── more photos, same frame size ── */}
      {product.images.length > 1 && (
        <section className="pp__more" aria-labelledby="pp-more">
          <h2 id="pp-more" className="title-xl">The <em>details</em></h2>
          <div className="pp__more-grid">
            {product.images.slice(1).map((im, i) => (
              <motion.div
                key={im.file}
                initial={{ opacity: 0, y: 50, rotateX: 16 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 1100 }}
                className="pp__more-item"
              >
                <Photo product={product} index={i + 1} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── keep scrolling: suggestions ── */}
      <section className="pp__suggest panel stitch" aria-labelledby="pp-suggest">
        <div className="sec-head sec-head--row">
          <div>
            <p className="eyebrow">while you're here</p>
            <h2 id="pp-suggest" className="title-xl">You might also <em>love</em></h2>
          </div>
          <Link to="/shop" className="sec-link">See everything →</Link>
        </div>
        <div className="pgrid pp__suggest-grid">
          {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </div>
  );
}
