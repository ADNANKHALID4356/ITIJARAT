import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { getImageUrl } from '../config';

/**
 * ShopProductCard
 * 
 * High-end commercial product card inspired by luxury & athletic brands (Nike, Zodiac, Bata):
 * 1. Top Image Tile:
 *    - Standalone, distinct visual frame with rounded-2xl corners & neutral studio backdrop.
 *    - Full-bleed image with smooth scale on hover.
 *    - Floating badges (Discount %, Featured, New).
 *    - Interactive hover action overlays (Wishlist toggle, Quick View, Fast Add-to-Bag).
 * 2. Bottom Details Section (Separate from the image card):
 *    - Category / Brand micro-tag.
 *    - Bold, readable product title.
 *    - SEO Meta description / snippet.
 *    - Star ratings & review count.
 *    - Price, strike-through original price, and stock status.
 */
const ShopProductCard = ({
  product,
  onAddToCart,
  onBuyNow,
  isAddingToCart = false,
  isInCart = false,
  cartQuantity = 0,
  isFavorite = false,
  onFavoriteToggle
}) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);

  if (!product) return null;

  // Resolve image source
  const rawImage = product.image || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
  const imageSrc = rawImage ? getImageUrl('products', rawImage) : null;
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product._id || product.id}`;
  
  // Format prices
  const price = Number(product.price || 0);
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = product.discount || (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  
  // SEO description snippet (from metaDescription or description)
  const metaSnippet = product.metaDescription || product.description || '';
  const cleanSnippet = metaSnippet.replace(/<[^>]*>?/gm, '').trim();

  // Ratings
  const ratingValue = Number(product.rating || product.averageRating || 4.8);
  const reviewCount = product.reviewCount || product.numReviews || 0;

  // Stock
  const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 10;
  const isOutOfStock = stock <= 0;

  // Category / Brand label
  const categoryLabel = (product.category && typeof product.category === 'object' && product.category.name)
    ? product.category.name
    : (typeof product.category === 'string' ? product.category : (product.brand || 'Collection'));

  const handleCardClick = () => {
    navigate(productUrl);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    const nextState = !favorite;
    setFavorite(nextState);
    if (onFavoriteToggle) {
      onFavoriteToggle(product._id || product.id, nextState);
    }
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, 1);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group flex flex-col h-full cursor-pointer transition-all duration-300"
    >
      {/* 1. SEPARATE PRODUCT IMAGE CARD */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#F7F7F9] border border-neutral-200/80 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-neutral-300">
        
        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-[#F4EA00] text-[#17151D] font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="bg-neutral-900 text-white font-semibold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button (Top-Right) */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm text-neutral-600 hover:text-[#EF168A] hover:bg-white shadow-sm transition-all duration-200"
        >
          <Heart 
            className={`w-4 h-4 transition-transform active:scale-125 ${favorite ? 'fill-[#EF168A] text-[#EF168A]' : 'text-neutral-600'}`} 
          />
        </button>

        {/* Primary Product Image */}
        {!imgError && imageSrc ? (
          <img
            src={imageSrc}
            alt={product.altText || product.title || 'Product'}
            loading="lazy"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${isOutOfStock ? 'grayscale-[40%] opacity-85' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400">
            <ShoppingBag className="w-10 h-10 stroke-[1.25] mb-1 opacity-40" />
            <span className="text-[11px] font-medium tracking-wider uppercase opacity-60">No Image</span>
          </div>
        )}

        {/* Quick Add To Bag Bar (Slide up on hover) */}
        <div className="absolute inset-x-3 bottom-3 z-10 transition-all duration-300 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleAddClick}
            disabled={isAddingToCart || isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-all ${
              isOutOfStock 
                ? 'bg-neutral-400 text-white cursor-not-allowed'
                : 'bg-[#17151D] hover:bg-[#0F0A87] text-white active:scale-[0.98]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {isAddingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : isInCart ? `In Cart (${cartQuantity})` : 'Quick Add'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. PRODUCT DETAILS SECTION (Separated below the image card) */}
      <div className="pt-3 px-1 flex flex-col flex-grow">
        
        {/* Brand / Category Micro-Tag */}
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
          <span className="truncate max-w-[70%]">{categoryLabel}</span>
          {isOutOfStock ? (
            <span className="text-red-500 font-medium normal-case">Out of Stock</span>
          ) : (
            <span className="text-emerald-600 font-medium normal-case flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              In Stock
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-sm sm:text-base text-neutral-900 group-hover:text-[#0F0A87] transition-colors line-clamp-1 leading-snug">
          {product.title || 'Untitled Product'}
        </h3>

        {/* SEO Meta Description / Snippet */}
        {cleanSnippet && (
          <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed font-normal">
            {cleanSnippet}
          </p>
        )}

        {/* Star Rating Section */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center text-[#F4EA00]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(ratingValue) ? 'fill-[#F4EA00] text-[#F4EA00]' : 'text-neutral-300'}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-neutral-600">
            {ratingValue.toFixed(1)}
            {reviewCount > 0 && <span className="text-neutral-400 ml-0.5">({reviewCount})</span>}
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mt-2 pt-1 border-t border-neutral-100">
          <span className="text-base sm:text-lg font-bold text-[#17151D] tracking-tight">
            PKR {price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-neutral-400 line-through">
              PKR {originalPrice.toLocaleString()}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ShopProductCard;
