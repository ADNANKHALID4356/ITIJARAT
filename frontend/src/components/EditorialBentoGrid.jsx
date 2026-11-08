import React, { useState } from 'react';
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
 * Pure Image Bento Tile
 * Strictly image-only as mandated:
 * - NO text overlay
 * - NO badges
 * - NO prices or buttons
 * - Image fills the card with object-fit: cover
 * - Whole card is an accessible link
 */
const BentoImageCard = ({ product, spanClass = '', isHero = false, priority = false }) => {
  const [imgError, setImgError] = useState(false);
  if (!product) return null;

  const imgSrc = resolveImg(product);
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
  const accessibleLabel = product.title || product.name || 'Featured Product';
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
          /* Neutral geometric placeholder with zero text */
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

        {/* Visually hidden screen-reader out-of-stock announcement */}
        {isOutOfStock && (
          <span className="sr-only">Out of stock</span>
        )}
      </div>
    </Link>
  );
};

/**
 * EditorialBentoGrid
 * 
 * Replicates the exact 4-column interlocking Bento mosaic from the reference layout:
 * - Center: Dominant 2x2 Hero Tile (occupies Columns 2 & 3, Rows 2 & 3)
 * - Top-Left: Tall 1x2 Tile (Column 1, Rows 1 & 2)
 * - Top-Center: Two 1x1 Tiles (Columns 2 & 3, Row 1)
 * - Top-Right: Tall 1x2 Tile (Column 4, Rows 1 & 2)
 * - Left-Bottom: Tall 1x2 Tile (Column 1, Rows 3 & 4)
 * - Right-Middle: Small 1x1 Tile (Column 4, Row 3)
 * - Bottom-Center: Small 1x1 Tile (Column 2, Row 4)
 * - Bottom-Right: Wide 2x1 Tile (Columns 3 & 4, Row 4)
 * 
 * Total: 16 cells occupied = 100% full, ZERO GAPS.
 * Strictly image-only (no visible text overlays).
 * Full width, matching the upper section padding.
 */
const EditorialBentoGrid = ({ products = [] }) => {
  if (!Array.isArray(products) || products.length === 0) return null;

  // Distribute products across slots
  const heroProduct = products[0];
  const p1 = products[1] || products[0];
  const p2 = products[2] || products[0];
  const p3 = products[3] || products[0];
  const p4 = products[4] || products[0];
  const p5 = products[5] || products[0];
  const p6 = products[6] || products[0];
  const p7 = products[7] || products[0];
  const p8 = products[8] || products[0];

  // Any remaining products (items 9+)
  const extraProducts = products.length > 9 ? products.slice(9) : [];

  return (
    <div className="w-full my-2">
      {/* Dark Obsidian Luxury Canvas matching reference frame, full width without restrictive max-w-7xl */}
      <div className="w-full bg-[#090a0d] rounded-[28px] sm:rounded-[32px] p-2.5 sm:p-3.5 md:p-4 lg:p-5 border border-neutral-800/80 shadow-2xl">
        
        {/* 4-Column Interlocking Responsive Grid (Zero gaps) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[185px] lg:auto-rows-[210px]">
          
          {/* Card 1: Top-Left (Tall 1x2: Col 1, Rows 1 & 2) */}
          <BentoImageCard
            product={p1}
            spanClass="col-span-1 row-span-2 lg:col-start-1 lg:row-start-1 lg:row-span-2"
            priority
          />

          {/* Card 2: Top-Center Left (Small 1x1: Col 2, Row 1) */}
          <BentoImageCard
            product={p2}
            spanClass="col-span-1 row-span-1 lg:col-start-2 lg:row-start-1 lg:row-span-1"
          />

          {/* Card 3: Top-Center Right (Small 1x1: Col 3, Row 1) */}
          <BentoImageCard
            product={p3}
            spanClass="col-span-1 row-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-1"
          />

          {/* Card 4: Top-Right (Tall 1x2: Col 4, Rows 1 & 2) */}
          <BentoImageCard
            product={p4}
            spanClass="col-span-1 row-span-2 lg:col-start-4 lg:row-start-1 lg:row-span-2"
            priority
          />

          {/* Card 5: THE DOMINANT CENTERPIECE HERO (2x2: Center on desktop, First on mobile/tablet) */}
          <BentoImageCard
            product={heroProduct}
            spanClass="col-span-2 row-span-2 order-first lg:order-none lg:col-start-2 lg:row-start-2 lg:col-span-2 lg:row-span-2"
            isHero
            priority
          />

          {/* Card 6: Left-Bottom (Tall 1x2: Col 1, Rows 3 & 4) */}
          <BentoImageCard
            product={p5}
            spanClass="col-span-1 row-span-2 lg:col-start-1 lg:row-start-3 lg:row-span-2"
          />

          {/* Card 7: Right-Middle (Small 1x1: Col 4, Row 3) */}
          <BentoImageCard
            product={p6}
            spanClass="col-span-1 row-span-1 lg:col-start-4 lg:row-start-3 lg:row-span-1"
          />

          {/* Card 8: Bottom-Center (Small 1x1: Col 2, Row 4) */}
          <BentoImageCard
            product={p7}
            spanClass="col-span-1 row-span-1 lg:col-start-2 lg:row-start-4 lg:row-span-1"
          />

          {/* Card 9: Bottom-Right (Wide 2x1: Cols 3 & 4, Row 4) */}
          <BentoImageCard
            product={p8}
            spanClass="col-span-2 row-span-1 lg:col-start-3 lg:row-start-4 lg:col-span-2 lg:row-span-1"
          />

        </div>

        {/* If more than 9 products exist, render subsequent items in a balanced 4-column flow */}
        {extraProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 mt-3 sm:mt-4 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[185px]">
            {extraProducts.map((extraProd, idx) => (
              <BentoImageCard
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

export default EditorialBentoGrid;
