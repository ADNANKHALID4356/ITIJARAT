import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../config';
import { BENTO_TOKENS, TILE_SPANS } from '../config/bentoConfig';

/**
 * BentoImageTile — Pure Image Product Tile for International Tijarat Bento Grid
 * 
 * Strict specifications:
 * - Image-only display across all sizes (hero, wide, tall, small) and states.
 * - Zero visible text overlays, badges, buttons, prices, ratings, or icons.
 * - Accessible link to /product/:slug (or :id) with aria-label from product title.
 * - Out-of-stock: subtle visual desaturation + visually hidden screen-reader label.
 * - Missing/failed image: soft gradient placeholder with minimal geometric SVG icon.
 * - Respects prefers-reduced-motion.
 */
const BentoImageTile = ({
  product,
  slotSize = 'small',
  isPriority = false,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
  const accessibleLabel = `${product.title || product.name || 'Featured Product'}${isOutOfStock ? ' (Out of stock)' : ''}`;

  // Image resolution helper with correct getImageUrl(type, filename) signature
  const resolveImg = (file) => {
    if (!file) return null;
    return getImageUrl('products', file);
  };

  const optimized = product.optimizedImage;
  const rawImage = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
  const primarySrc = resolveImg(rawImage);
  const avifSrc = optimized?.avif?.full ? resolveImg(optimized.avif.full) : null;
  const webpSrc = optimized?.webp?.full ? resolveImg(optimized.webp.full) : null;

  const spanClasses = TILE_SPANS[slotSize] || TILE_SPANS.small;

  return (
    <Link
      to={productUrl}
      aria-label={accessibleLabel}
      className={`
        group relative block overflow-hidden
        ${BENTO_TOKENS.radius.tile}
        ${BENTO_TOKENS.minTouchTarget}
        bg-neutral-100 shadow-xs hover:shadow-md
        border border-neutral-200/60
        transform transition-all duration-300 ease-out
        hover:-translate-y-1
        focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-none focus-visible:ring-offset-2
        motion-reduce:hover:transform-none motion-reduce:transition-none
        ${spanClasses.mobile} ${spanClasses.tablet} ${spanClasses.desktop}
        ${className}
      `}
    >
      {/* Tile Container */}
      <div className="relative w-full h-full min-h-[160px] sm:min-h-[190px] md:min-h-[220px]">
        {/* Placeholder skeleton while image is loading */}
        {!imgLoaded && !imgError && (
          <div 
            className="absolute inset-0 bg-neutral-200/80 animate-pulse"
            aria-hidden="true"
          />
        )}

        {/* Failed image or no image placeholder */}
        {imgError || !primarySrc ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 text-neutral-400"
            aria-hidden="true"
          >
            {/* Neutral minimalist product silhouette icon — no text */}
            <svg
              className="w-12 h-12 opacity-40 transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        ) : (
          /* Product Image with responsive sources */
          <picture className="block w-full h-full">
            {avifSrc && (
              <source
                type="image/avif"
                srcSet={avifSrc}
              />
            )}
            {webpSrc && (
              <source
                type="image/webp"
                srcSet={webpSrc}
              />
            )}
            <img
              src={primarySrc}
              alt="" // Decorative within accessible link (link has aria-label)
              loading={isPriority ? 'eager' : 'lazy'}
              decoding={isPriority ? 'sync' : 'async'}
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgError(true);
                setImgLoaded(true);
              }}
              className={`
                w-full h-full object-cover object-center
                transform transition-transform duration-500 ease-out
                group-hover:scale-[1.05]
                motion-reduce:group-hover:scale-100 motion-reduce:transition-none
                ${isOutOfStock ? 'grayscale-[45%] opacity-85 contrast-[0.92]' : ''}
                ${imgLoaded ? 'opacity-100' : 'opacity-0'}
              `}
            />
          </picture>
        )}

        {/* Visually hidden screen-reader out-of-stock announcement */}
        {isOutOfStock && (
          <span className="sr-only">Out of stock</span>
        )}
      </div>
    </Link>
  );
};

export default BentoImageTile;
