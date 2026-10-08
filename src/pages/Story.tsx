import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import productsData from '../data/products';
import { lifestyleIndex } from '../lib/theme';
import Photo from '../components/Photo';
import Tilt from '../components/Tilt';
import './Story.css';

const P = productsData.products;
const WORDS = ['GINGHAM', 'RUFFLES', 'LACE', 'BOWS', 'QUILTING'];

export default function Story() {
  const navy = P[3];
  const gallery = [P[10], P[11], P[9]];

  return (
    <div className="page story">
      <section className="story__head panel stitch">
        <p className="eyebrow">our story</p>
        <motion.h1
          className="title-xl"
          initial={{ opacity: 0, y: 50, rotateX: -35 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          The fabric of <em>Vannam</em>
        </motion.h1>
        <p className="story__lede">Every stitch tells a story of care, color, and absolute functionality.</p>
      </section>

      <section className="story__body">
        <motion.div
          className="story__photo"
          initial={{ opacity: 0, x: -50, rotate: -5 }}
          whileInView={{ opacity: 1, x: 0, rotate: -2 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Tilt max={7}>
            <div className="story__frame">
              <Photo product={navy} index={lifestyleIndex(navy)} ratio="4 / 5" />
            </div>
          </Tilt>
        </motion.div>
        <motion.div
          className="story__text"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="title-xl">More than <em>just a pouch</em></h2>
          <p>We saw that women invest heavily in premium tools — like the Dyson Airwrap — but end up storing them in generic, unprotective bags. Vannam was created to bridge the gap between high-end functionality and unabashed cuteness.</p>
          <p>We quilt our cottons for safety. We source smooth YKK zippers so they never snag. We tailor compartments so every barrel, brush, and serum has a home.</p>
        </motion.div>
      </section>

      <div className="story__words" aria-hidden="true">
        <div className="story__words-track">
          {[0, 1].map(k => (
            <div key={k} className="story__words-row">
              {[...WORDS, ...WORDS].map((w, i) => <span key={i}>{w}<i>✿</i></span>)}
            </div>
          ))}
        </div>
      </div>

      <section className="story__gallery" aria-label="A few favourites">
        {gallery.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 50, rotateX: 18 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 1100 }}
          >
            <Tilt max={8}>
              <Link to={`/product/${p.slug}`} className="story__tile">
                <Photo product={p} index={lifestyleIndex(p)} ratio="4 / 5" />
                <span className="hand">{p.name.split('·')[1]?.trim() ?? p.name}</span>
              </Link>
            </Tilt>
          </motion.div>
        ))}
      </section>

      <section className="story__cta panel">
        <h2 className="title-xl">Explore the <em>collection</em></h2>
        <Link to="/shop" className="btn btn--ink">Shop all pouches</Link>
      </section>
    </div>
  );
}
