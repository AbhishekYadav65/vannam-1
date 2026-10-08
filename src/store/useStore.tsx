import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Product } from '../data/products';

/* ─── Cart ─── */
export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: number }
  | { type: 'UPDATE_QTY'; productId: number; quantity: number }
  | { type: 'TOGGLE' }
  | { type: 'CLOSE' }
  | { type: 'OPEN' }
  | { type: 'LOAD'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + (action.quantity || 1) }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, { product: action.product, quantity: action.quantity || 1 }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QTY':
      if (action.quantity <= 0)
        return { ...state, items: state.items.filter(i => i.product.id !== action.productId) };
      return {
        ...state,
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        ),
      };
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'LOAD':
      return { ...state, items: action.items };
    default:
      return state;
  }
}

/* ─── Wishlist ─── */
interface WishlistState {
  ids: number[];
}

type WishlistAction =
  | { type: 'TOGGLE_WISH'; productId: number }
  | { type: 'LOAD_WISH'; ids: number[] };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'TOGGLE_WISH': {
      const has = state.ids.includes(action.productId);
      return { ids: has ? state.ids.filter(id => id !== action.productId) : [...state.ids, action.productId] };
    }
    case 'LOAD_WISH':
      return { ids: action.ids };
    default:
      return state;
  }
}

/* ─── Search ─── */
interface SearchState {
  isOpen: boolean;
  query: string;
}

type SearchAction =
  | { type: 'OPEN_SEARCH' }
  | { type: 'CLOSE_SEARCH' }
  | { type: 'SET_QUERY'; query: string };

function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'OPEN_SEARCH':
      return { ...state, isOpen: true };
    case 'CLOSE_SEARCH':
      return { isOpen: false, query: '' };
    case 'SET_QUERY':
      return { ...state, query: action.query };
    default:
      return state;
  }
}

/* ─── Context ─── */
interface StoreContextType {
  cart: CartState;
  cartDispatch: React.Dispatch<CartAction>;
  cartTotal: number;
  cartCount: number;
  wishlist: WishlistState;
  wishlistDispatch: React.Dispatch<WishlistAction>;
  isWished: (id: number) => boolean;
  search: SearchState;
  searchDispatch: React.Dispatch<SearchAction>;
}

const StoreContext = createContext<StoreContextType | null>(null);

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, cartDispatch] = useReducer(cartReducer, undefined, () => ({
    items: readStored<CartItem[]>('vannam-cart', []),
    isOpen: false,
  }));
  const [wishlist, wishlistDispatch] = useReducer(wishlistReducer, undefined, () => ({
    ids: readStored<number[]>('vannam-wishlist', []),
  }));
  const [search, searchDispatch] = useReducer(searchReducer, { isOpen: false, query: '' });

  // Save to localStorage
  useEffect(() => {
    try { localStorage.setItem('vannam-cart', JSON.stringify(cart.items)); } catch { /* storage unavailable */ }
  }, [cart.items]);

  useEffect(() => {
    try { localStorage.setItem('vannam-wishlist', JSON.stringify(wishlist.ids)); } catch { /* storage unavailable */ }
  }, [wishlist.ids]);

  const cartTotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const isWished = (id: number) => wishlist.ids.includes(id);

  return (
    <StoreContext.Provider value={{ cart, cartDispatch, cartTotal, cartCount, wishlist, wishlistDispatch, isWished, search, searchDispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
