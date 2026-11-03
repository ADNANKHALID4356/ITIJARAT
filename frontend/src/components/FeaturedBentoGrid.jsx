import React, { useMemo } from 'react';
import EditorialBentoGrid from './EditorialBentoGrid';

/**
 * FeaturedBentoGrid — Editorial, Interlocking Bento Grid for Homepage Featured Products
 * 
 * Replicates the high-end editorial Bento UI matching the reference design:
 * - Dark Obsidian luxury framing canvas.
 * - Dominant 2x2 central focal card with floating glassmorphic micro-cards.
 * - Alternating blush rose (#fee4e7) and crisp white interlocking companion cards.
 * - Real product data dynamic slotting.
 */
const FeaturedBentoGrid = ({
  products = [],
  isLoading = false,
  title = "Featured Products",
  subtitle = "Handpicked marketplace highlights",
  showHeader = true,
  className = ""
}) => {
  // Validate and sanitize products list
  const validProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p && (p._id || p.id));
  }, [products]);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className={`w-full py-2 ${className}`}>
        <div className="w-full bg-[#090a0d] rounded-[24px] sm:rounded-[28px] p-3 sm:p-4 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[160px] lg:auto-rows-[200px]">
            <div className="col-span-1 row-span-2 rounded-[22px] bg-neutral-800/60" />
            <div className="col-span-1 row-span-1 rounded-[22px] bg-neutral-800/40" />
            <div className="col-span-1 row-span-1 rounded-[22px] bg-neutral-800/40" />
            <div className="col-span-1 row-span-2 rounded-[22px] bg-neutral-800/60" />
            <div className="col-span-2 row-span-2 rounded-[22px] bg-neutral-800/70" />
          </div>
        </div>
      </div>
    );
  }

  // 0 products state: render nothing cleanly
  if (validProducts.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {showHeader && (
        <div className="mb-4 text-center sm:text-left px-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-neutral-500 mt-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Render the high-production editorial bento grid */}
      <EditorialBentoGrid products={validProducts} />
    </div>
  );
};

export default FeaturedBentoGrid;
