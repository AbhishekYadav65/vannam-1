import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import productsData from '../data/products';
import { lifestyleIndex } from '../lib/theme';
import Photo from '../components/Photo';
import Tilt from '../components/Tilt';
import './About.css';

const lead = productsData.products[4];

const STATS = [
  { num: '100%', label: 'Handmade', bg: 'var(--cherry)', fg: '#fff' },
  { num: 'YKK', label: 'Premium zippers', bg: 'var(--butter)', fg: 'var(--ink)' },
  { num: 'Soft', label: 'Quilted protection', bg: 'var(--mint)', fg: 'var(--ink)' },
];

export default function About() {
  return (
    <div className="page about">
      <section className="about__hero panel stitch">
        <div className="about__hero-text">
          <p className="eyebrow">about vannam</p>
          <motion.h1
            className="title-xl"
            initial={{ opacity: 0, y: 50, rotateX: -35 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            We believe everyday objects should make you <em>smile.</em>
          </motion.h1>
        </div>
        <motion.div
          className="about__photo"
          initial={{ opacity: 0, rotate: 8, x: 40 }}
          animate={{ opacity: 1, rotate: 3, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <Tilt max={8}>
            <div className="about__frame">
              <Photo product={lead} index={lifestyleIndex(lead)} ratio="4 / 5" eager />
            </div>
          </Tilt>
        </motion.div>
      </section>

      <section className="about__philosophy">
        <div className="about__text">
          <h2 className="title-xl">Handcrafted in <em>Coimbatore</em></h2>
          <p>Vannam was born from a simple desire: to make storage as beautiful as the things we store. We were tired of generic, uninspired bags. We wanted ruffles, gingham, polka dots, and color.</p>
          <p>Every pouch is meticulously handcrafted in our Coimbatore studio. From the selection of premium cottons to the perfect tension of a quilted stitch, we care deeply about the details.</p>
        </div>
        <div className="about__stats">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 900 }}
            >
              <Tilt max={10} className="stat" >
                <div className="stat__in" style={{ background: s.bg, color: s.fg }}>
                  <span className="stat__num">{s.num}</span>
                  <span className="stat__label">{s.label}</span>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="about__cta panel">
        <h2 className="title-xl">Discover the <em>collection</em></h2>
        <Link to="/shop" className="btn btn--ink">Shop Vannam</Link>
      </section>
    </div>
  );
}
