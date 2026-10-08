import type { CSSProperties } from 'react';
import type { Product } from '../data/products';
import { getImageUrl } from '../data/products';
import { accentStyle } from '../lib/theme';
import './Photo.css';

interface PhotoProps {
  product: Product;
  /** which of product.images to show */
  index?: number;
  /** CSS aspect-ratio of the frame. Every frame on the site is 4 / 5 unless told otherwise. */
  ratio?: string;
  /** fill the parent instead of owning an aspect-ratio (used for stacked crossfades) */
  fill?: boolean;
  eager?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One consistent frame for every product photo.
 *  - studio shots (white background)  → contained on a tinted mat, white is multiplied away
 *  - lifestyle shots                  → cover-cropped to the frame
 *  - infographics                     → contained on white so no text is ever cropped
 */
export default function Photo({ product, index = 0, ratio = '4 / 5', fill, eager, className = '', style }: PhotoProps) {
  const img = product.images[index] ?? product.images[0];
  return (
    <div
      className={`photo photo--${img.kind} ${fill ? 'photo--fill' : ''} ${className}`}
      style={{ ...accentStyle(product), ...(fill ? null : { aspectRatio: ratio }), ...style }}
    >
      <img
        src={getImageUrl(img.file)}
        alt={img.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
