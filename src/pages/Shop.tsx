import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import productsData, { CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const SORTS = [
  { v: 'featured', label: 'Featured' },
  { v: 'price-low', label: 'Price: low to high' },
  { v: 'price-high', label: 'Price: high to low' },
  { v: 'name-a', label: 'A – Z' },
  { v: 'name-z', label: 'Z – A' },
];

export default function Shop() {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const [sort, setSort] = useState('featured');
  const [q, setQ] = useState('');

  const category = CATEGORIES.find(c => c.slug === categorySlug);

  const products = useMemo(() => {
    const base = category ? productsData.products.filter(p => p.category === category.name) : productsData.products;
    return [...base].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'name-a') return a.name.localeCompare(b.name);
      if (sort === 'name-z') return b.name.localeCompare(a.name);
      return a.id - b.id;
    });
  }, [category, sort]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="page shop">
      <header className="shop__head panel stitch">
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {products.length} {products.length === 1 ? 'pouch' : 'pouches'}, all handmade
        </motion.p>
        <motion.h1
          className="title-xl"
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {category ? <>{category.name.split(' ')[0]} <em>{category.name.split(' ').slice(1).join(' ')}</em></> : <>All <em>pouches</em></>}
        </motion.h1>

        <nav className="shop__chips" aria-label="Categories">
          <Link to="/shop" className={!category ? 'is-on' : ''}>All</Link>
          {CATEGORIES.map(c => (
            <Link key={c.slug} to={`/shop/${c.slug}`} className={category?.slug === c.slug ? 'is-on' : ''}>{c.label}</Link>
          ))}
        </nav>
      </header>

      <div className="shop__bar">
        <form className="shop__search" onSubmit={onSearch} role="search">
          <label htmlFor="shop-q" className="sr-only">Search pouches</label>
          <input id="shop-q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search gingham, cherry, airwrap…" enterKeyHint="search" />
          <button type="submit" className="btn btn--ink">Search</button>
        </form>
        <label className="shop__sort">
          <span className="hand">sort</span>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s.v} value={s.v}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <div className="pgrid">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}
