import { motion } from 'framer-motion';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader" role="status" aria-label="Loading">
      <motion.span
        className="loader__v"
        animate={{ rotateY: [0, 180, 360], scale: [1, 1.12, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        V
      </motion.span>
    </div>
  );
}
