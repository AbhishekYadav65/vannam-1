import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { rupees } from '../lib/theme';
import Photo from './Photo';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cart, cartDispatch, cartTotal, cartCount } = useStore();
  const close = () => cartDispatch({ type: 'CLOSE' });

  return (
    <AnimatePresence>
      {cart.isOpen && (
        <>
          <motion.div
            className="bag-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="bag"
            initial={{ x: '105%', rotateY: -14 }}
            animate={{ x: 0, rotateY: 0 }}
            exit={{ x: '105%', rotateY: -14 }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            role="dialog"
            aria-label="Shopping bag"
          >
            <div className="bag__head">
              <h2>Your bag <span>{cartCount}</span></h2>
              <button className="bag__close" onClick={close} aria-label="Close bag">✕</button>
            </div>

            {cart.items.length === 0 ? (
              <div className="bag__empty">
                <p className="bag__empty-title">Nothing in here yet</p>
                <p className="hand">go pick a little favourite</p>
                <Link to="/shop" className="btn btn--ink" onClick={close}>Start shopping</Link>
              </div>
            ) : (
              <>
                <ul className="bag__items">
                  <AnimatePresence initial={false}>
                    {cart.items.map(({ product, quantity }) => (
                      <motion.li
                        key={product.id}
                        className="bag__item"
                        layout
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24, height: 0 }}
                      >
                        <Link to={`/product/${product.slug}`} onClick={close} className="bag__thumb">
                          <Photo product={product} index={0} ratio="4 / 5" />
                        </Link>
                        <div className="bag__info">
                          <Link to={`/product/${product.slug}`} onClick={close} className="bag__name">{product.name}</Link>
                          <p className="bag__price">{rupees(product.price)}</p>
                          <div className="bag__qty">
                            <button onClick={() => cartDispatch({ type: 'UPDATE_QTY', productId: product.id, quantity: quantity - 1 })} aria-label="Decrease quantity">−</button>
                            <span aria-label={`Quantity ${quantity}`}>{quantity}</span>
                            <button onClick={() => cartDispatch({ type: 'UPDATE_QTY', productId: product.id, quantity: quantity + 1 })} aria-label="Increase quantity">＋</button>
                            <button className="bag__remove" onClick={() => cartDispatch({ type: 'REMOVE', productId: product.id })} aria-label={`Remove ${product.name}`}>remove</button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="bag__foot">
                  <div className="bag__sub"><span>Subtotal</span><strong>{rupees(cartTotal)}</strong></div>
                  <p className="bag__ship">Shipping calculated at checkout</p>
                  <a href="https://www.instagram.com/vannam.ig" target="_blank" rel="noopener noreferrer" className="btn btn--cherry">DM to order on Instagram</a>
                  <button className="btn btn--ghost" disabled>Checkout (coming soon)</button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
