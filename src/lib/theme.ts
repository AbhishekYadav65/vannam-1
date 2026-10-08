import type { CSSProperties } from 'react';
import type { Product } from '../data/products';

/**
 * Every product gets a loud "stage" colour chosen to CONTRAST with its fabric
 * (navy on bubble-pink, red gingham on mint, cheetah on hot pink …) so the
 * product is always the thing your eye lands on.
 */
export interface Accent {
  bg: string;
  fg: string;
  /** punchy colour for captions / second headline line sitting on `bg` */
  hi: string;
}

const INK = '#1A0E14';
const PAPER = '#FFF4E9';
/** the colour that contrasts with a given text colour — used for hard "sticker" shadows */
export const oppositeOf = (fg: string) => (fg === INK ? PAPER : INK);

const ACCENTS: Accent[] = [
  { bg: '#FF5C93', fg: '#1A0E14', hi: '#FFF4E9' }, // 1  pink gingham ruffle  → hot pink
  { bg: '#E3173E', fg: '#FFF4E9', hi: '#FFD84D' }, // 2  polka & lace         → cherry
  { bg: '#2437B8', fg: '#FFF4E9', hi: '#FFD84D' }, // 3  blue stripe bows     → cobalt
  { bg: '#FFB3CB', fg: '#1A0E14', hi: '#E3173E' }, // 4  navy quilted         → bubble pink
  { bg: '#14204F', fg: '#FFF4E9', hi: '#FFD84D' }, // 5  pink stripe ruffle   → navy
  { bg: '#B5E8A8', fg: '#1A0E14', hi: '#E3173E' }, // 6  red gingham ruffle   → mint
  { bg: '#5A36D6', fg: '#FFF4E9', hi: '#FFD84D' }, // 7  napkin hearts        → violet
  { bg: '#FFD84D', fg: '#1A0E14', hi: '#E3173E' }, // 8  pink chess           → butter
  { bg: '#FF8FB1', fg: '#1A0E14', hi: '#2437B8' }, // 9  cheetah              → candy pink
  { bg: '#2A1F5C', fg: '#FFF4E9', hi: '#FFD84D' }, // 10 meadow gingham       → deep plum
  { bg: '#FF6B4A', fg: '#1A0E14', hi: '#2437B8' }, // 11 polka ruffle         → coral
  { bg: '#0F7A55', fg: '#FFF4E9', hi: '#FFD84D' }, // 12 cherry cream         → deep green
];

export function accentFor(product: Product): Accent {
  return ACCENTS[(product.id - 1) % ACCENTS.length];
}

/** Inline CSS variables consumed by .photo, cards, stages … */
export function accentStyle(product: Product): CSSProperties {
  const a = accentFor(product);
  return {
    ['--accent' as string]: a.bg,
    ['--accent-fg' as string]: a.fg,
    ['--accent-hi' as string]: a.hi,
    ['--accent-sh' as string]: oppositeOf(a.fg),
  } as CSSProperties;
}

/** First "lifestyle" shot (falls back to the second image, then the first). */
export function lifestyleIndex(product: Product): number {
  const i = product.images.findIndex(img => img.kind === 'lifestyle');
  if (i >= 0) return i;
  return product.images.length > 1 ? 1 : 0;
}

export const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;
