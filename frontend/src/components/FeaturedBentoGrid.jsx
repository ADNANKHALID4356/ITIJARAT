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
      <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 ${className}`}>
        <div className="w-full bg-[#090a0d] rounded-[32px] p-6 animate-pulse">
          <div className="h-6 w-48 bg-neutral-800 rounded-md mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]">
            <div className="col-span-1 row-span-2 rounded-[28px] bg-neutral-800/60" />
            <div className="col-span-1 row-span-1 rounded-[26px] bg-neutral-800/40" />
            <div className="col-span-1 row-span-1 rounded-[26px] bg-neutral-800/40" />
            <div className="col-span-1 row-span-2 rounded-[28px] bg-neutral-800/60" />
            <div className="col-span-2 row-span-2 rounded-[28px] bg-neutral-800/70" />
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
    <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4 ${className}`}>
      {showHeader && (
        <div className="mb-4 text-center sm:text-left">
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
