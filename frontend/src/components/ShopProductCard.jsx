import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { getImageUrl } from '../config';

/**
 * ShopProductCard
 * 
 * High-end commercial product card for International Tijarat:
 * 1. Top Image Tile:
 *    - Standalone distinct visual frame with rounded-2xl corners & Warm Ivory / neutral studio backdrop.
 *    - Full-bleed image with smooth scale on hover.
 *    - Floating badges (Discount % in Soft Burgundy #F4E9ED, Featured in Deep Burgundy #350A1B).
 *    - Interactive hover action overlays (Wishlist toggle, Fast Quick Add in Royal Burgundy #5B1830).
 * 2. Bottom Details Section:
 *    - Category / Brand micro-tag (#746B6C).
 *    - Product title in Primary Charcoal #241A1D, hover #5B1830.
 *    - Price in Royal Burgundy #5B1830 (Manrope 700).
 *    - Stock status in Semantic Green #23845B.
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
      className="group flex flex-col h-full cursor-pointer transition-all duration-300 font-body"
    >
      {/* 1. SEPARATE PRODUCT IMAGE CARD */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF7F3] border border-[#E8DED8] shadow-2xs transition-all duration-300 group-hover:shadow-md group-hover:border-[#D8C9C0]">
        
        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-[#F4E9ED] text-[#5B1830] font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-2xs border border-[#5B1830]/20 font-body">
              -{discountPercent}%
            </span>
          )}
          {product.featured && (
            <span className="bg-[#350A1B] text-white font-semibold text-[10px] sm:text-xs px-2 py-0.5 rounded-md shadow-2xs font-body">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button (Top-Right) */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#746B6C] hover:text-[#5B1830] hover:bg-white shadow-2xs border border-[#E8DED8]/60 transition-all duration-200"
        >
          <Heart 
            className={`w-4 h-4 transition-transform active:scale-125 ${favorite ? 'fill-[#5B1830] text-[#5B1830]' : 'text-[#746B6C]'}`} 
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
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F3] text-[#8B8080]">
            <ShoppingBag className="w-10 h-10 stroke-[1.25] mb-1 opacity-40 text-[#5B1830]" />
            <span className="text-[11px] font-medium tracking-wider uppercase opacity-60 font-body">No Image</span>
          </div>
        )}

        {/* Quick Add To Bag Bar (Slide up on hover) */}
        <div className="absolute inset-x-3 bottom-3 z-10 transition-all duration-300 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleAddClick}
            disabled={isAddingToCart || isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all font-body cursor-pointer ${
              isOutOfStock 
                ? 'bg-[#F0ECE9] text-[#8B8080] cursor-not-allowed border border-[#E8DED8]'
                : 'bg-[#5B1830] hover:bg-[#350A1B] text-white active:scale-[0.98]'
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
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#746B6C] mb-1 font-body">
          <span className="truncate max-w-[70%]">{categoryLabel}</span>
          {isOutOfStock ? (
            <span className="text-[#C43D43] font-medium normal-case font-body">Out of Stock</span>
          ) : (
            <span className="text-[#23845B] font-medium normal-case flex items-center gap-1 font-body">
              <span className="w-1.5 h-1.5 rounded-full bg-[#23845B] inline-block"></span>
              In Stock
            </span>
          )}
        </div>

        {/* Product Title */}
        <h3 className="font-semibold text-sm sm:text-base text-[#241A1D] group-hover:text-[#5B1830] transition-colors line-clamp-1 leading-snug font-body">
          {product.title || 'Untitled Product'}
        </h3>

        {/* SEO Meta Description / Snippet */}
        {cleanSnippet && (
          <p className="text-xs text-[#746B6C] line-clamp-2 mt-1 leading-relaxed font-normal font-body">
            {cleanSnippet}
          </p>
        )}

        {/* Star Rating Section */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center text-[#A66A12]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(ratingValue) ? 'fill-[#A66A12] text-[#A66A12]' : 'text-[#E8DED8]'}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-[#746B6C] font-body">
            {ratingValue.toFixed(1)}
            {reviewCount > 0 && <span className="text-[#8B8080] ml-0.5">({reviewCount})</span>}
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mt-2 pt-1 border-t border-[#E8DED8]">
          <span className="text-base sm:text-lg font-bold text-[#5B1830] tracking-tight font-body">
            PKR {price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs sm:text-sm text-[#8B8080] line-through font-body">
              PKR {originalPrice.toLocaleString()}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default ShopProductCard;
