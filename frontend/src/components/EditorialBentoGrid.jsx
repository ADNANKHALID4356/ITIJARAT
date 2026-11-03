import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  TrendingUp, 
  Star, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Flame, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getImageUrl } from '../config';

// Image helper function
const resolveImg = (product) => {
  if (!product) return null;
  const raw = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
  if (!raw) return null;
  return getImageUrl('products', raw);
};

// Fallback placeholder SVG
const NeutralPlaceholder = () => (
  <div className="w-full h-full min-h-[140px] flex items-center justify-center bg-neutral-200/50">
    <svg className="w-10 h-10 text-neutral-400 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  </div>
);

/**
 * 1. THE DOMINANT CENTERPIECE HERO (2 Cols x 2 Rows)
 * Replicates the central focal person/lifestyle composition with floating glassmorphic micro-cards.
 */
const CenterHeroTile = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  if (!product) return null;

  const imgSrc = resolveImg(product);
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
  const price = product.price ? `PKR ${product.price.toLocaleString()}` : 'PKR 122';

  return (
    <Link
      to={productUrl}
      className="group relative col-span-2 row-span-2 rounded-[28px] overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] block"
      aria-label={`Featured Flagship: ${product.title || 'Product'}`}
    >
      {/* Full-bleed background product photo */}
      <div className="absolute inset-0 w-full h-full bg-neutral-950">
        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={product.title || 'Featured Product'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <NeutralPlaceholder />
        )}
        {/* Subtle gradient vignette so overlays pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />
      </div>

      {/* Floating Glassmorphic Pill 1: Top-Left Flame / Views badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/90 border border-white/60 shadow-lg text-neutral-900 text-xs font-semibold">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white">
          <Flame size={12} fill="currentColor" />
        </span>
        <span>26.8K Views</span>
      </div>

      {/* Floating Glassmorphic Pill 2: Top-Right Engagement / Rating badge */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md bg-white/90 border border-white/60 shadow-lg text-neutral-900 text-xs font-semibold">
        <Star size={13} className="text-amber-500 fill-amber-500" />
        <span>4.9 ★ Rating</span>
      </div>

      {/* Floating Glassmorphic Pill 3: Mid-Left Trend Activity Card */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl backdrop-blur-md bg-white/90 border border-white/50 shadow-xl">
        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <Activity size={15} />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Demand</p>
          <p className="text-xs font-bold text-neutral-900">+102.48%</p>
        </div>
      </div>

      {/* Floating Glassmorphic Pill 4: Bottom Main Interactive CTA Card */}
      <div className="absolute bottom-4 inset-x-4 z-10 p-3.5 sm:p-4 rounded-2xl backdrop-blur-md bg-white/95 border border-white/70 shadow-2xl flex items-center justify-between transition-transform duration-300 group-hover:translate-y-[-2px]">
        <div className="min-w-0 pr-3">
          <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            Flagship Selection
          </span>
          <h3 className="text-sm sm:text-base font-serif font-bold text-neutral-950 truncate">
            {product.title || product.name || 'Artisan Masterpiece'}
          </h3>
          <p className="text-xs sm:text-sm font-sans font-bold text-neutral-800">
            {price}
          </p>
        </div>

        <span className="shrink-0 w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-rose-600">
          <ArrowUpRight size={18} />
        </span>
      </div>
    </Link>
  );
};

/**
 * 2. TOP-LEFT TALL CARD (1 Col x 2 Rows, Blush Rose #fde3e5)
 * Circular progress ring (75% / 98% quality guarantee) + product showcase photo.
 */
const TallCraftTile = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  if (!product) return null;

  const imgSrc = resolveImg(product);
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;

  return (
    <Link
      to={productUrl}
      className="group relative col-span-1 row-span-2 rounded-[28px] overflow-hidden bg-[#fee4e7] p-5 flex flex-col justify-between border border-[#f8c9cf] shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
      aria-label={`Craftsmanship: ${product.title || 'Product'}`}
    >
      {/* Top Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Quality Guarantee
        </p>
        <h4 className="text-sm font-serif font-bold text-neutral-900 mt-1 line-clamp-1">
          {product.title || 'Artisan Standard'}
        </h4>
      </div>

      {/* Center Circular Progress Ring (like the 75% ring in the screenshot) */}
      <div className="my-auto py-2 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-white"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-rose-500 transition-all duration-1000 ease-out"
              strokeDasharray="92, 100"
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold font-sans text-neutral-900">92%</span>
            <span className="text-[9px] uppercase font-bold text-neutral-500">Purity</span>
          </div>
        </div>

        {/* Product preview photo floating below circle */}
        <div className="w-20 h-20 rounded-2xl overflow-hidden mt-3 shadow-md border border-white/80 bg-white">
          {!imgError && imgSrc ? (
            <img 
              src={imgSrc} 
              alt="" 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <NeutralPlaceholder />
          )}
        </div>
      </div>

      {/* Bottom Stat Footer */}
      <div className="pt-2 border-t border-[#f7ccd2] flex items-center justify-between">
        <div>
          <span className="text-lg font-bold font-sans text-neutral-900">2.5K</span>
          <p className="text-[10px] text-neutral-500 font-medium">Verified Reviews</p>
        </div>
        <span className="w-8 h-8 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
};

/**
 * 3. BOTTOM-LEFT TALL CARD (1 Col x 2 Rows, Blush Rose #fde3e5)
 * "Smart Digital Agency" / "Curated Artisan Heritage" with dual oval product thumbnails.
 */
const TallArtisanTile = ({ product, companionProduct }) => {
  const [imgError1, setImgError1] = useState(false);
  const [imgError2, setImgError2] = useState(false);
  if (!product) return null;

  const imgSrc1 = resolveImg(product);
  const imgSrc2 = resolveImg(companionProduct) || imgSrc1;
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;

  return (
    <Link
      to={productUrl}
      className="group relative col-span-1 row-span-2 rounded-[28px] overflow-hidden bg-[#fee4e7] p-5 flex flex-col justify-between border border-[#f8c9cf] shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
      aria-label={`Heritage: ${product.title || 'Product'}`}
    >
      <div>
        <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-bold tracking-wider mb-2">
          HERITAGE
        </span>
        <h4 className="text-base font-serif font-bold text-neutral-900 leading-snug">
          Authentic Regional Craftsmanship
        </h4>
      </div>

      {/* Dual pill avatars / product previews (matching the two oval pills in screenshot!) */}
      <div className="my-auto py-3 flex items-center justify-center gap-2">
        <div className="w-16 h-28 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
          {!imgError1 && imgSrc1 ? (
            <img 
              src={imgSrc1} 
              alt="" 
              onError={() => setImgError1(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <NeutralPlaceholder />
          )}
        </div>
        <div className="w-16 h-28 rounded-full overflow-hidden border-2 border-white shadow-md bg-white mt-4">
          {!imgError2 && imgSrc2 ? (
            <img 
              src={imgSrc2} 
              alt="" 
              onError={() => setImgError2(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <NeutralPlaceholder />
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-[#f7ccd2] flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-800">
          Explore Lineage
        </span>
        <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
};

/**
 * 4. STAT SPOTLIGHT TILE (1 Col x 1 Row, Crisp White)
 * Top row metric card (like the 4.875 Project Views or 57K New Users cards).
 */
const StatSpotlightTile = ({ product, metric = "4.875", label = "Curated Selection", trend = "+10%" }) => {
  const [imgError, setImgError] = useState(false);
  if (!product) return null;

  const imgSrc = resolveImg(product);
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;

  return (
    <Link
      to={productUrl}
      className="group relative col-span-1 row-span-1 rounded-[26px] overflow-hidden bg-white p-4 flex flex-col justify-between border border-neutral-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
      aria-label={`${label}: ${product.title || 'Product'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold font-sans text-neutral-900 tracking-tight">
          {metric}
        </span>
        {trend ? (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        ) : (
          <Heart size={16} className="text-rose-500 fill-rose-500" />
        )}
      </div>

      <div className="flex items-end justify-between mt-2">
        <div className="pr-2 min-w-0">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            {label}
          </p>
          <h5 className="text-xs font-serif font-bold text-neutral-800 truncate mt-0.5">
            {product.title || 'Exclusive'}
          </h5>
        </div>

        <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-neutral-100 shadow-xs bg-neutral-50">
          {!imgError && imgSrc ? (
            <img 
              src={imgSrc} 
              alt="" 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <NeutralPlaceholder />
          )}
        </div>
      </div>
    </Link>
  );
};

/**
 * 5. RIGHT-TOP TALL CARD (1 Col x 2 Rows, Crisp White)
 * "Team of passionate designers" / "Artisan Guild" with avatar stack + daily orders stat.
 */
const TallCommunityTile = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  if (!product) return null;

  const imgSrc = resolveImg(product);
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;

  return (
    <Link
      to={productUrl}
      className="group relative col-span-1 row-span-2 rounded-[28px] overflow-hidden bg-white p-5 flex flex-col justify-between border border-neutral-200 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
      aria-label={`Guild Selection: ${product.title || 'Product'}`}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Master Guild
        </p>
        <h4 className="text-sm font-serif font-bold text-neutral-900 mt-1 leading-snug">
          Verified Master Craftsmen & Guilds
        </h4>

        {/* Avatar Stack (mimicking the avatars in the screenshot) */}
        <div className="flex items-center -space-x-2 mt-3">
          <div className="w-7 h-7 rounded-full border-2 border-white bg-neutral-200 overflow-hidden shadow-xs">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="w-7 h-7 rounded-full border-2 border-white bg-neutral-300 overflow-hidden shadow-xs">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="w-7 h-7 rounded-full border-2 border-white bg-neutral-400 overflow-hidden shadow-xs">
            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <span className="w-7 h-7 rounded-full border-2 border-white bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">
            +18
          </span>
        </div>
      </div>

      {/* Featured product imagery */}
      <div className="my-auto py-3">
        <div className="w-full h-28 rounded-2xl overflow-hidden border border-neutral-100 shadow-sm bg-neutral-50">
          {!imgError && imgSrc ? (
            <img 
              src={imgSrc} 
              alt="" 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <NeutralPlaceholder />
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold font-sans text-neutral-900">54</span>
          <span className="ml-1 text-xs font-bold text-rose-500">+40%</span>
          <p className="text-[10px] text-neutral-400 font-medium">Daily New Orders</p>
        </div>
        <span className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
};

/**
 * 6. BRAND SEAL TILE (1 Col x 1 Row, Crisp White)
 * Official Quality Seal (replicates the CUBO tile in the screenshot).
 */
const BrandSealTile = () => {
  return (
    <div className="col-span-1 row-span-1 rounded-[26px] bg-white p-4 flex flex-col items-center justify-center border border-neutral-200 shadow-sm text-center">
      <div className="relative mb-2">
        {/* Venn-diagram geometric emblem like in screenshot */}
        <div className="w-10 h-10 relative flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-neutral-900 absolute -top-1" />
          <div className="w-6 h-6 rounded-full border-2 border-rose-500 absolute -left-1 bottom-0" />
          <div className="w-6 h-6 rounded-full border-2 border-amber-500 absolute -right-1 bottom-0" />
        </div>
      </div>
      <span className="text-sm font-bold tracking-widest uppercase font-serif text-neutral-900">
        TIJARAT
      </span>
      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold mt-0.5">
        Official Seal
      </span>
    </div>
  );
};

/**
 * 7. MATERIAL PALETTE TILE (1 Col x 1 Row, Crisp White)
 * Tactile Material swatches (replicates the Font Sk-Modernist color palette tile).
 */
const MaterialPaletteTile = () => {
  return (
    <div className="col-span-1 row-span-1 rounded-[26px] bg-white p-4 flex flex-col justify-between border border-neutral-200 shadow-sm">
      <div>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          Materials
        </span>
        <h5 className="text-xs font-bold text-neutral-900 font-serif mt-0.5">
          Pure & Natural
        </h5>
      </div>

      {/* 4 Tactile Rounded Swatches matching screenshot */}
      <div className="flex items-center gap-1.5 my-1">
        <span className="w-6 h-5 rounded-md bg-[#1e2024] shadow-xs" title="Obsidian Stone" />
        <span className="w-6 h-5 rounded-md bg-[#d2d5dc] shadow-xs" title="Cashmere Wool" />
        <span className="w-6 h-5 rounded-md bg-[#f77f88] shadow-xs" title="Raw Coral" />
        <span className="w-6 h-5 rounded-md bg-[#fedee1] shadow-xs" title="Blush Silk" />
      </div>

      <p className="text-[10px] text-neutral-500 font-medium">
        Handpicked luxury grades
      </p>
    </div>
  );
};

/**
 * 8. WIDE EDITORIAL CARD (2 Cols x 1 Row, Blush Rose #fde3e5)
 * Spans columns 3 & 4: "We Build Future of Design Industry" + 3D sculpture icon.
 */
const WideEditorialTile = ({ product }) => {
  if (!product) return null;
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;

  return (
    <Link
      to={productUrl}
      className="group relative col-span-2 row-span-1 rounded-[28px] overflow-hidden bg-[#fee4e7] p-5 flex items-center justify-between border border-[#f8c9cf] shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
      aria-label={`Editorial: ${product.title || 'Product'}`}
    >
      <div className="max-w-[70%] z-10">
        <h4 className="text-base sm:text-lg font-serif font-bold text-neutral-900 leading-snug">
          Crafting the Future of Ethical Luxury
        </h4>
        <p className="text-xs text-neutral-600 mt-1 line-clamp-1 font-sans">
          {product.title || 'Direct from certified heritage artisans across Pakistan'}
        </p>
      </div>

      {/* 3D Sculpture Asterisk element (replicates the black glossy 3D star from screenshot) */}
      <div className="relative shrink-0 w-16 h-16 flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-45">
          <Sparkles size={26} className="text-rose-300 fill-rose-300" />
        </div>
      </div>
    </Link>
  );
};

/**
 * MAIN EDITORIAL BENTO GRID CONTAINER
 * Deep obsidian frame holding the alternating blush rose and crisp white mosaic.
 */
const EditorialBentoGrid = ({ products = [] }) => {
  if (!Array.isArray(products) || products.length === 0) return null;

  // Distribute products into slots
  const heroProduct = products[0];
  const p1 = products[1] || products[0];
  const p2 = products[2] || products[0];
  const p3 = products[3] || products[0];
  const p4 = products[4] || products[0];
  const p5 = products[5] || products[0];
  const p8 = products[6] || products[0];
  const companion = products[7] || products[1];

  return (
    <div className="w-full my-2">
      {/* Dark Obsidian Luxury Canvas (matching the contrast frame in Screenshot 2) */}
      <div className="w-full bg-[#090a0d] rounded-[32px] p-3 sm:p-5 md:p-6 lg:p-7 border border-neutral-800/80 shadow-2xl">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-5 px-2 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
              Featured Bento Showcase
            </h3>
          </div>
          <span className="text-xs font-sans text-neutral-400">
            Handcrafted luxury curation
          </span>
        </div>

        {/* 4-Column Interlocking Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[180px]">
          
          {/* Column 1 (Left): Tall Craft Tile (Rows 1-2) */}
          <TallCraftTile product={p1} />

          {/* Column 2 & 3: Top Stat Tiles (Row 1) */}
          <StatSpotlightTile 
            product={p3} 
            metric="4.875" 
            label="Curated Views" 
            trend={null} 
          />
          <StatSpotlightTile 
            product={p4} 
            metric="57K" 
            label="Verified Orders" 
            trend="+10%" 
          />

          {/* Column 4 (Right): Tall Community Tile (Rows 1-2) */}
          <TallCommunityTile product={p5} />

          {/* Columns 2 & 3: THE DOMINANT CENTERPIECE HERO (Rows 2-3) */}
          <CenterHeroTile product={heroProduct} />

          {/* Column 1 (Left): Tall Artisan Tile (Rows 3-4) */}
          <TallArtisanTile product={p2} companionProduct={companion} />

          {/* Column 4 (Right): Brand Quality Seal Tile (Row 3) */}
          <BrandSealTile />

          {/* Column 2: Material Palette Tile (Row 4) */}
          <MaterialPaletteTile />

          {/* Columns 3 & 4: Wide Editorial Tile (Row 4) */}
          <WideEditorialTile product={p8} />

        </div>
      </div>
    </div>
  );
};

export default EditorialBentoGrid;
