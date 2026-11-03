import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../config';

// Helper to resolve product image URL
const resolveImg = (product) => {
  if (!product) return null;
  const raw = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
  if (!raw) return null;
  return getImageUrl('products', raw);
};

/**
 * Pure Image Bento Tile for Premium Bento Grid
 * - Strictly image-only (NO text, NO badges, NO prices, NO buttons)
 * - Accessible link with aria-label
 * - Smooth hover scale
 * - Out-of-stock desaturation + sr-only text
 * - Fallback placeholder on image error
 */
const PremiumBentoImageCard = ({ product, spanClass = '', priority = false }) => {
  const [imgError, setImgError] = useState(false);
  if (!product) return null;

  const imgSrc = resolveImg(product);
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
  const accessibleLabel = product.title || product.name || 'Premium Product';
  const isOutOfStock = product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;

  return (
    <Link
      to={productUrl}
      aria-label={accessibleLabel}
      className={`
        group relative block overflow-hidden
        rounded-[20px] sm:rounded-[24px] md:rounded-[28px]
        bg-neutral-900/60 border border-neutral-800/80
        shadow-sm hover:shadow-2xl
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:scale-[1.01]
        focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none focus-visible:ring-offset-2
        ${spanClass}
      `}
    >
      <div className="w-full h-full relative">
        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={accessibleLabel}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setImgError(true)}
            className={`
              w-full h-full object-cover object-center
              transition-transform duration-700 ease-out
              group-hover:scale-105
              ${isOutOfStock ? 'grayscale-[45%] opacity-85 contrast-[0.92]' : ''}
            `}
          />
        ) : (
          <div className="w-full h-full min-h-[140px] flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-600">
            <svg
              className="w-10 h-10 opacity-30 transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        )}

        {isOutOfStock && (
          <span className="sr-only">Out of stock</span>
        )}
      </div>
    </Link>
  );
};

/**
 * PremiumBentoGrid
 * 
 * Replicates the exact 4-column x 3-row Bento Grid layout from the reference design:
 * 
 * Row 1:
 * - Card 1 (Col 1, Row 1): 1x1 Small Square ("nue")
 * - Card 2 (Cols 2-3, Row 1): 2x1 Wide Banner ("App icon" / iPhone)
 * - Card 3 (Col 4, Rows 1-2): 1x2 Tall Vertical ("Girl" card)
 * 
 * Row 2:
 * - Card 4 (Col 1, Row 2): 1x1 Small Square ("78K New Users")
 * - Card 5 (Col 2, Row 2): 1x1 Small Square ("4.9 Rating")
 * - Card 6 (Col 3, Rows 2-3): 1x2 Tall Vertical ("Revenue Lifecycle" card)
 * - (Card 3 continues in Col 4, Row 2)
 * 
 * Row 3:
 * - Card 7 (Cols 1-2, Row 3): 2x1 Wide Banner ("MRR $24k" wave card)
 * - (Card 6 continues in Col 3, Row 3)
 * - Card 8 (Col 4, Row 3): 1x1 Small Square ("$230k Revenue" pie card)
 * 
 * Total: 12 cells occupied across a 4x3 matrix = 100% full, ZERO GAPS.
 * Strictly image-only (decorated image posts uploaded by the admin).
 * Full width, adhering to upper section padding.
 */
const PremiumBentoGrid = ({ products = [], isLoading = false }) => {
  // Validate products list
  const validProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p && (p._id || p.id));
  }, [products]);

  if (isLoading) {
    return (
      <div className="w-full py-2">
        <div className="w-full bg-[#090a0d] rounded-[24px] sm:rounded-[28px] p-3 sm:p-4 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[160px] lg:auto-rows-[200px]">
            <div className="col-span-1 row-span-1 rounded-[22px] bg-neutral-800/40" />
            <div className="col-span-2 row-span-1 rounded-[22px] bg-neutral-800/60" />
            <div className="col-span-1 row-span-2 rounded-[22px] bg-neutral-800/60" />
            <div className="col-span-1 row-span-1 rounded-[22px] bg-neutral-800/40" />
            <div className="col-span-1 row-span-1 rounded-[22px] bg-neutral-800/40" />
            <div className="col-span-1 row-span-2 rounded-[22px] bg-neutral-800/60" />
            <div className="col-span-2 row-span-1 rounded-[22px] bg-neutral-800/60" />
            <div className="col-span-1 row-span-1 rounded-[22px] bg-neutral-800/40" />
          </div>
        </div>
      </div>
    );
  }

  if (validProducts.length === 0) {
    return null;
  }

  // Distribute the first 8 products into the 8 layout slots
  const p1 = validProducts[0];
  const p2 = validProducts[1] || validProducts[0];
  const p3 = validProducts[2] || validProducts[0];
  const p4 = validProducts[3] || validProducts[0];
  const p5 = validProducts[4] || validProducts[0];
  const p6 = validProducts[5] || validProducts[0];
  const p7 = validProducts[6] || validProducts[0];
  const p8 = validProducts[7] || validProducts[0];

  // Overflow products (items 9+)
  const extraProducts = validProducts.length > 8 ? validProducts.slice(8) : [];

  return (
    <div className="w-full my-2">
      {/* Luxury Obsidian Canvas, full width matching section margins */}
      <div className="w-full bg-[#090a0d] rounded-[24px] sm:rounded-[28px] p-2.5 sm:p-3.5 md:p-4 lg:p-5 border border-neutral-800/80 shadow-2xl">
        
        {/* 4-Column x 3-Row Interlocking Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 auto-rows-[150px] sm:auto-rows-[175px] md:auto-rows-[200px] lg:auto-rows-[225px]">
          
          {/* Card 1: Top-Left (1x1 Square: Col 1, Row 1) */}
          <PremiumBentoImageCard
            product={p1}
            spanClass="col-span-1 row-span-1 lg:col-start-1 lg:row-start-1 lg:col-span-1 lg:row-span-1"
            priority
          />

          {/* Card 2: Top-Middle Wide Banner (2x1 Wide: Cols 2-3, Row 1) */}
          <PremiumBentoImageCard
            product={p2}
            spanClass="col-span-1 sm:col-span-2 row-span-1 lg:col-start-2 lg:row-start-1 lg:col-span-2 lg:row-span-1"
            priority
          />

          {/* Card 3: Top-Right Tall Portrait (1x2 Tall: Col 4, Rows 1-2) */}
          <PremiumBentoImageCard
            product={p3}
            spanClass="col-span-1 sm:col-span-1 row-span-2 lg:col-start-4 lg:row-start-1 lg:col-span-1 lg:row-span-2"
            priority
          />

          {/* Card 4: Middle-Left Square (1x1 Square: Col 1, Row 2) */}
          <PremiumBentoImageCard
            product={p4}
            spanClass="col-span-1 row-span-1 lg:col-start-1 lg:row-start-2 lg:col-span-1 lg:row-span-1"
          />

          {/* Card 5: Middle-Center Square (1x1 Square: Col 2, Row 2) */}
          <PremiumBentoImageCard
            product={p5}
            spanClass="col-span-1 row-span-1 lg:col-start-2 lg:row-start-2 lg:col-span-1 lg:row-span-1"
          />

          {/* Card 6: Middle-Right Tall Portrait (1x2 Tall: Col 3, Rows 2-3) */}
          <PremiumBentoImageCard
            product={p6}
            spanClass="col-span-1 sm:col-span-1 row-span-2 lg:col-start-3 lg:row-start-2 lg:col-span-1 lg:row-span-2"
          />

          {/* Card 7: Bottom-Left Wide Banner (2x1 Wide: Cols 1-2, Row 3) */}
          <PremiumBentoImageCard
            product={p7}
            spanClass="col-span-1 sm:col-span-2 row-span-1 lg:col-start-1 lg:row-start-3 lg:col-span-2 lg:row-span-1"
          />

          {/* Card 8: Bottom-Right Square (1x1 Square: Col 4, Row 3) */}
          <PremiumBentoImageCard
            product={p8}
            spanClass="col-span-1 row-span-1 lg:col-start-4 lg:row-start-3 lg:col-span-1 lg:row-span-1"
          />

        </div>

        {/* If more than 8 products exist, display them in an interlocking balanced row underneath */}
        {extraProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 mt-3 sm:mt-4 auto-rows-[150px] sm:auto-rows-[175px] md:auto-rows-[200px]">
            {extraProducts.map((extraProd, idx) => (
              <PremiumBentoImageCard
                key={extraProd._id || extraProd.id || idx}
                product={extraProd}
                spanClass="col-span-1 row-span-1"
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PremiumBentoGrid;
