import productsData, { type Product } from '../data/products';

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/make[\s-]+up/g, 'makeup')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stem = (w: string) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w);

interface Indexed {
  product: Product;
  fields: { text: string; weight: number }[];
}

const INDEX: Indexed[] = productsData.products.map(product => ({
  product,
  fields: [
    { text: norm(product.name), weight: 10 },
    { text: norm(product.tags.join(' ')), weight: 8 },
    { text: norm(product.category), weight: 6 },
    { text: norm(product.fabric), weight: 4 },
    { text: norm(product.shortDescription), weight: 3 },
    { text: norm(product.description + ' ' + product.highlights.join(' ')), weight: 2 },
  ],
}));

function termScore(term: string, entry: Indexed): number {
  let best = 0;
  for (const f of entry.fields) {
    const words = f.text.split(' ');
    let s = 0;
    if (words.some(w => w === term || stem(w) === term)) s = f.weight;
    else if (words.some(w => w.startsWith(term))) s = f.weight * 0.8;
    else if (term.length >= 3 && f.text.includes(term)) s = f.weight * 0.5;
    if (s > best) best = s;
  }
  return best;
}

export interface SearchResult {
  items: Product[];
  /** true when no product matched every word, so we fell back to "any word" */
  partial: boolean;
}

export function searchProducts(query: string): SearchResult {
  const terms = norm(query).split(' ').filter(Boolean).map(stem);
  if (!terms.length) return { items: [], partial: false };

  const scored = INDEX.map(entry => {
    const per = terms.map(t => termScore(t, entry));
    return { entry, per, total: per.reduce((a, b) => a + b, 0) };
  });

  const all = scored.filter(s => s.per.every(p => p > 0));
  if (all.length) {
    all.sort((a, b) => b.total - a.total || a.entry.product.id - b.entry.product.id);
    return { items: all.map(s => s.entry.product), partial: false };
  }

  const any = scored.filter(s => s.total > 0);
  any.sort((a, b) => b.total - a.total || a.entry.product.id - b.entry.product.id);
  return { items: any.map(s => s.entry.product), partial: any.length > 0 };
}

export const POPULAR_SEARCHES = ['Gingham', 'Ruffle', 'Cherry', 'Polka', 'Quilted', 'Airwrap', 'Makeup', 'Cheetah'];
