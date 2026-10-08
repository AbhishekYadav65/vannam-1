import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="page">
      <section className="lost panel stitch">
        <motion.p className="lost__num" initial={{ opacity: 0, rotateX: -60, y: 40 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>404</motion.p>
        <h1 className="title-xl">We lost <em>this thread.</em></h1>
        <p>The page you're looking for seems to have unraveled.</p>
        <Link to="/" className="btn btn--ink">Back to Vannam</Link>
      </section>
    </div>
  );
}
