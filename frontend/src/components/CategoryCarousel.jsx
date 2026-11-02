import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

// Fallback high quality category images if none configured in admin
const DEFAULT_FALLBACK_CATEGORIES = [
  { id: 'fb-1', name: 'Electronics', src: '/IT Images/1.jpeg' },
  { id: 'fb-2', name: 'Fashion', src: '/IT Images/2.jpeg' },
  { id: 'fb-3', name: 'Home & Living', src: '/IT Images/3.jpeg' },
  { id: 'fb-4', name: 'Beauty & Care', src: '/IT Images/4.jpeg' },
  { id: 'fb-5', name: 'Sports & Fitness', src: '/IT Images/5.jpeg' },
  { id: 'fb-6', name: 'Luxury Watches', src: '/IT Images/6.jpeg' },
  { id: 'fb-7', name: 'Perfumery', src: '/IT Images/7.jpeg' }
];

const CategoryCarousel = ({ categories: homepageCategoriesProp = [] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Touch gesture refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resolve image source cleanly
  const resolveImageUrl = useCallback((category) => {
    if (!category) return '/placeholder-image.jpg';
    
    // Check optimized image formats first
    const opt = category.optimizedImage || category.optimizedMainImage;
    if (opt) {
      if (opt.webp?.large) return `${config.BASE_URL}${opt.webp.large}`;
      if (opt.webp?.medium) return `${config.BASE_URL}${opt.webp.medium}`;
      if (opt.original) {
        return opt.original.startsWith('http') ? opt.original : `${config.BASE_URL}${opt.original}`;
      }
    }

    const raw = category.imageUrl || category.src;
    if (!raw) return '/placeholder-image.jpg';

    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
      return raw;
    }
    if (raw.startsWith('/uploads/')) {
      return `${config.BASE_URL}${raw}`;
    }
    if (raw.startsWith('/')) {
      return raw;
    }
    return `${config.BASE_URL}/${raw}`;
  }, []);

  // Prepare categories list (ensure at least 5 items for the 5 visual positions)
  const items = React.useMemo(() => {
    const validProps = Array.isArray(homepageCategoriesProp) && homepageCategoriesProp.length > 0
      ? homepageCategoriesProp
      : DEFAULT_FALLBACK_CATEGORIES;

    // If fewer than 5 items, repeat to fill the 5 perspective cascade slots
    let list = [...validProps];
    if (list.length > 0 && list.length < 5) {
      while (list.length < 5) {
        list = [...list, ...validProps];
      }
    }
    return list;
  }, [homepageCategoriesProp]);

  const total = items.length;

  // Auto-play interval
  useEffect(() => {
    if (total === 0 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3800);

    return () => clearInterval(timer);
  }, [total, isPaused]);

  // Keep index in valid bounds if items count changes
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Card click: center card navigates, side card rotates to center
  const handleCardClick = (e, offset, category) => {
    e.preventDefault();
    e.stopPropagation();

    if (offset === 0) {
      // Center card clicked -> Navigate to category page
      const rawName = category.name || category.categoryId?.name || '';
      const slug = rawName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (slug) {
        navigate(`/category-group/${slug}`);
      } else {
        navigate('/shop');
      }
    } else {
      // Side card clicked -> smoothly move it to center
      setCurrentIndex((prev) => (prev + offset + total) % total);
    }
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = true;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    // Resume auto-play after short delay
    setTimeout(() => setIsPaused(false), 2000);
  };

  if (total === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden select-none py-6 sm:py-10 md:py-12 bg-gradient-to-b from-[#7C69EF]/15 via-[#8F82F8]/10 to-slate-50/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Category Carousel"
    >
      {/* Ambient background soft glow */}
      <div 
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-400/20 rounded-full blur-3xl opacity-70"
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none absolute -bottom-10 left-1/4 w-[400px] h-[250px] bg-purple-400/15 rounded-full blur-3xl opacity-60"
        aria-hidden="true" 
      />

      {/* 3D Stepped Cascade Container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 h-[280px] sm:h-[350px] md:h-[410px] lg:h-[450px] flex items-center justify-center">
        {items.map((category, idx) => {
          // Calculate relative circular offset: -floor(total/2) to floor((total-1)/2)
          let offset = idx - currentIndex;
          while (offset > total / 2) offset -= total;
          while (offset < -total / 2) offset += total;

          // Determine position, scale, elevation and opacity based on offset
          let transform = '';
          let zIndex = 0;
          let opacity = 0;
          let pointerEvents = 'none';
          let cursor = 'default';

          if (offset === 0) {
            // CENTER CARD (Front, lowest top edge, highest z-index)
            transform = isMobile 
              ? 'translate(-50%, 0) translateY(24px) scale(1.0)' 
              : 'translate(-50%, 0) translateY(48px) scale(1.0)';
            zIndex = 30;
            opacity = 1;
            pointerEvents = 'auto';
            cursor = 'pointer';
          } else if (offset === -1) {
            // MID LEFT CARD (Stepped behind center, higher top edge)
            transform = isMobile
              ? 'translate(calc(-50% - 38%), 0) translateY(0px) scale(0.86)'
              : 'translate(calc(-50% - 46%), 0) translateY(0px) scale(0.90)';
            zIndex = 20;
            opacity = 0.88;
            pointerEvents = 'auto';
            cursor = 'pointer';
          } else if (offset === 1) {
            // MID RIGHT CARD (Stepped behind center, higher top edge)
            transform = isMobile
              ? 'translate(calc(-50% + 38%), 0) translateY(0px) scale(0.86)'
              : 'translate(calc(-50% + 46%), 0) translateY(0px) scale(0.90)';
            zIndex = 20;
            opacity = 0.88;
            pointerEvents = 'auto';
            cursor = 'pointer';
          } else if (offset === -2) {
            // OUTER LEFT CARD (Furthest back, highest top edge)
            transform = isMobile
              ? 'translate(calc(-50% - 68%), 0) translateY(-18px) scale(0.72)'
              : 'translate(calc(-50% - 90%), 0) translateY(-46px) scale(0.80)';
            zIndex = 10;
            opacity = isMobile ? 0 : 0.65;
            pointerEvents = isMobile ? 'none' : 'auto';
            cursor = isMobile ? 'default' : 'pointer';
          } else if (offset === 2) {
            // OUTER RIGHT CARD (Furthest back, highest top edge)
            transform = isMobile
              ? 'translate(calc(-50% + 68%), 0) translateY(-18px) scale(0.72)'
              : 'translate(calc(-50% + 90%), 0) translateY(-46px) scale(0.80)';
            zIndex = 10;
            opacity = isMobile ? 0 : 0.65;
            pointerEvents = isMobile ? 'none' : 'auto';
            cursor = isMobile ? 'default' : 'pointer';
          } else {
            // Off-screen hidden cards
            transform = 'translate(-50%, 0) translateY(0px) scale(0.6)';
            zIndex = 0;
            opacity = 0;
            pointerEvents = 'none';
          }

          const imgSrc = resolveImageUrl(category);

          return (
            <div
              key={`${category._id || category.id || idx}-${idx}`}
              onClick={(e) => handleCardClick(e, offset, category)}
              className="absolute left-1/2 top-4 sm:top-6 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
              style={{
                transform,
                zIndex,
                opacity,
                pointerEvents
              }}
            >
              {/* Card Container - Strict Image Only, rounded corners, glass border & reflection */}
              <div
                className={`
                  relative overflow-hidden rounded-2xl sm:rounded-3xl
                  w-[240px] h-[155px]
                  xs:w-[270px] xs:h-[175px]
                  sm:w-[330px] sm:h-[215px]
                  md:w-[410px] md:h-[265px]
                  lg:w-[460px] lg:h-[295px]
                  xl:w-[500px] xl:h-[320px]
                  border border-white/60 dark:border-white/20
                  ${offset === 0 
                    ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] ring-2 ring-white/50' 
                    : 'shadow-[0_15px_30px_-8px_rgba(0,0,0,0.22)]'
                  }
                  bg-gradient-to-b from-white/90 to-white/40 backdrop-blur-sm
                  transition-shadow duration-300
                  ${cursor === 'pointer' ? 'cursor-pointer hover:shadow-2xl' : ''}
                `}
              >
                {/* Pure Image - Absolutely NO Text */}
                <img
                  src={imgSrc}
                  alt=""
                  loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                  className="w-full h-full object-cover select-none pointer-events-none rounded-2xl sm:rounded-3xl transition-transform duration-700 ease-out hover:scale-105"
                  draggable={false}
                />

                {/* Subtle glass reflection highlight on top edge */}
                <div 
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl sm:rounded-t-3xl" 
                  aria-hidden="true" 
                />

                {/* Subtle bottom gradient tint */}
                <div 
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/15 to-transparent rounded-b-2xl sm:rounded-b-3xl" 
                  aria-hidden="true" 
                />
              </div>
            </div>
          );
        })}

        {/* Floating Left Chevron Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous category"
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3.5 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-xl border border-white/60 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Floating Right Chevron Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next category"
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3.5 rounded-full bg-white/85 hover:bg-white text-gray-800 shadow-xl border border-white/60 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Dot Indicators */}
        <div 
          className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/20 shadow-md"
        >
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`
                h-2 rounded-full transition-all duration-300 focus:outline-none
                ${i === currentIndex 
                  ? 'w-6 sm:w-7 bg-white shadow-sm' 
                  : 'w-2 bg-white/50 hover:bg-white/80'
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
