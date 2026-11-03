import React, { useMemo } from 'react';
import BentoImageTile from './BentoImageTile';
import { BENTO_TOKENS, getPresetForCount } from '../config/bentoConfig';

/**
 * FeaturedBentoGrid — Editorial, Interlocking Bento Grid for Homepage Featured Products
 * 
 * Features:
 * - 4-Column pure CSS Grid architecture with deterministic zero-gap presets.
 * - Dynamic slot size resolution (admin configured slotSize > per-count geometric preset).
 * - Image-only tiles: zero text on cards, accessible links, out-of-stock visual cue.
 * - Responsive breakpoints: 4 columns on desktop, 2 columns on tablet, 2 columns/stacked on mobile.
 * - Zero products: renders null cleanly without layout shift.
 * - Loading state: renders proportional bento skeleton tiles.
 */
const FeaturedBentoGrid = ({
  products = [],
  isLoading = false,
  title = "Featured Products",
  subtitle = "Handpicked marketplace highlights"
}) => {
  // Validate and sanitize products list
  const validProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p && (p._id || p.id));
  }, [products]);

  // Derive per-count geometric preset
  const preset = useMemo(() => {
    return getPresetForCount(validProducts.length);
  }, [validProducts.length]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <section 
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
        aria-label="Loading featured products"
      >
        <div className="mb-6 md:mb-8 text-center sm:text-left">
          <div className="h-8 w-48 bg-neutral-200 rounded-md animate-pulse mb-2" />
          <div className="h-4 w-72 bg-neutral-100 rounded-md animate-pulse" />
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] sm:auto-rows-[190px] md:auto-rows-[220px] ${BENTO_TOKENS.gap.mobile} ${BENTO_TOKENS.gap.tablet} ${BENTO_TOKENS.gap.desktop}`}>
          <div className="col-span-2 row-span-2 rounded-2xl md:rounded-3xl bg-neutral-200/70 animate-pulse" />
          <div className="col-span-1 row-span-2 rounded-2xl md:rounded-3xl bg-neutral-200/60 animate-pulse" />
          <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-neutral-200/50 animate-pulse" />
          <div className="col-span-1 row-span-1 rounded-2xl md:rounded-3xl bg-neutral-200/50 animate-pulse" />
        </div>
      </section>
    );
  }

  // 0 products state: render nothing per quality bar
  if (validProducts.length === 0) {
    return null;
  }

  return (
    <section 
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
      aria-labelledby="featured-bento-heading"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-8 gap-2">
        <div>
          <h2 
            id="featured-bento-heading"
            className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-neutral-500 mt-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Bento Grid Canvas */}
      <div 
        className={`
          grid grid-cols-2 md:grid-cols-4
          auto-rows-[160px] sm:auto-rows-[190px] md:auto-rows-[220px]
          ${BENTO_TOKENS.gap.mobile} ${BENTO_TOKENS.gap.tablet} ${BENTO_TOKENS.gap.desktop}
        `}
      >
        {validProducts.map((product, index) => {
          // Resolved slotSize: Admin explicit setting takes precedence, falls back to geometric preset
          const slotSize = product.slotSize || preset[index] || 'small';
          const isPriority = index < 2; // Eager load first 2 items (hero + top companion)

          return (
            <BentoImageTile
              key={product._id || product.id || index}
              product={product}
              slotSize={slotSize}
              isPriority={isPriority}
            />
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedBentoGrid;
