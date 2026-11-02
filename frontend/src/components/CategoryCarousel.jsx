import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

// Fallback high quality category images if none configured in admin
const DEFAULT_FALLBACK_CATEGORIES = [
  { id: 'fb-1', name: 'Shawls & Apparel', src: '/IT Images/1.jpeg' },
  { id: 'fb-2', name: 'Leather Goods', src: '/IT Images/2.jpeg' },
  { id: 'fb-3', name: '48 Hours Plus', src: '/IT Images/3.jpeg' },
  { id: 'fb-4', name: 'Luxury Watches', src: '/IT Images/4.jpeg' },
  { id: 'fb-5', name: 'Designer Belts', src: '/IT Images/5.jpeg' },
  { id: 'fb-6', name: 'Fragrances & Perfumery', src: '/IT Images/6.jpeg' },
  { id: 'fb-7', name: 'Traditional Wear', src: '/IT Images/7.jpeg' }
];

const CategoryCarousel = ({ categories: homepageCategoriesProp = [] }) => {
  const navigate = useNavigate();

  // Primary categories list
  const baseItems = useMemo(() => {
    const valid = Array.isArray(homepageCategoriesProp) && homepageCategoriesProp.length > 0
      ? homepageCategoriesProp
      : DEFAULT_FALLBACK_CATEGORIES;

    // Ensure at least 6 base items so loop is seamless across all screen sizes
    let list = [...valid];
    while (list.length < 6) {
      list = [...list, ...valid];
    }
    return list;
  }, [homepageCategoriesProp]);

  // Triple items for continuous infinite seamless wrap
  const displayItems = useMemo(() => {
    return [...baseItems, ...baseItems, ...baseItems];
  }, [baseItems]);

  // Animation & control state
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = Left-to-Right (as requested), -1 = Right-to-Left

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const posRef = useRef(0);
  const rafIdRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isPlayingRef = useRef(true);
  const directionRef = useRef(1);
  const singleSetWidthRef = useRef(0);

  // Sync refs with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Measure single-set width for seamless pixel-perfect wrapping
  const measureWidth = useCallback(() => {
    if (!trackRef.current) return;
    const totalScrollWidth = trackRef.current.scrollWidth;
    singleSetWidthRef.current = totalScrollWidth / 3;

    // Initialize position centered on middle set so it can scroll in either direction seamlessly
    if (posRef.current === 0) {
      posRef.current = -singleSetWidthRef.current;
      trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
    }
  }, []);

  useEffect(() => {
    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, [measureWidth, displayItems]);

  // 60FPS Silky Continuous Ticker with V-Shaped Stepped Layering Arrangement
  useEffect(() => {
    const speed = 0.85; // Steady, elegant luxury glide speed (pixels per frame)

    const tick = () => {
      if (trackRef.current && containerRef.current && singleSetWidthRef.current > 0) {
        if (isPlayingRef.current && !isHoveredRef.current) {
          // Continuous smooth motion
          posRef.current += speed * directionRef.current;

          const setWidth = singleSetWidthRef.current;

          // Seamless infinite wrap-around
          if (directionRef.current > 0 && posRef.current >= 0) {
            posRef.current -= setWidth;
          } else if (directionRef.current < 0 && posRef.current <= -setWidth * 2) {
            posRef.current += setWidth;
          }

          trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
        }

        // Apply V-shaped stepped height & layering arrangement from the screenshot:
        // - Center card: in front, lowest top edge, highest z-index (z-30)
        // - Mid cards: stepped behind center, slightly higher (z-20)
        // - Outer cards: stepped behind mid cards, highest (z-10)
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerCenterX = containerRect.left + containerRect.width / 2;
        const isMobile = window.innerWidth < 640;
        const centerDown = isMobile ? 16 : 28;
        const stepRate = isMobile ? 12 : 22;

        const count = cardRefs.current.length;
        for (let i = 0; i < count; i++) {
          const cardEl = cardRefs.current[i];
          if (!cardEl) continue;

          const cardRect = cardEl.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const distFromCenter = Math.abs(cardCenterX - containerCenterX);
          const normalizedDist = distFromCenter / (cardRect.width * 0.75 || 200);

          // Calculate V-shaped vertical offset & z-index
          const y = Math.max(0, centerDown - Math.min(normalizedDist, 2.2) * (stepRate * 0.7));
          const zIndex = normalizedDist < 0.6 ? 30 : (normalizedDist < 1.5 ? 20 : 10);
          const opacity = normalizedDist < 0.6 ? 1.0 : (normalizedDist < 1.5 ? 0.92 : 0.82);

          cardEl.style.transform = `translate3d(0, ${y}px, 0)`;
          cardEl.style.zIndex = String(zIndex);
          cardEl.style.opacity = String(opacity);
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Image URL Resolver
  const resolveImageUrl = useCallback((category) => {
    if (!category) return '/placeholder-image.jpg';

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

  // Card click navigates to category group
  const handleCardClick = (category) => {
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
  };

  // Toggle Direction (Left-to-Right <-> Right-to-Left)
  const toggleDirection = () => {
    setDirection((prev) => (prev === 1 ? -1 : 1));
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full overflow-hidden select-none bg-white py-1 sm:py-2 my-0"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
      onTouchStart={() => { isHoveredRef.current = true; }}
      onTouchEnd={() => { isHoveredRef.current = false; }}
      aria-label="Continuous Category Carousel"
    >
      {/* 
        Moving Ribbon Track Wrapper:
        - Snug height matching existing carousel
        - Flush attachment to upper category cards
      */}
      <div className="relative w-full overflow-hidden h-[190px] xs:h-[220px] sm:h-[250px] md:h-[285px] lg:h-[310px] flex items-center">
        <div
          ref={trackRef}
          className="flex items-start will-change-transform"
          style={{ width: 'max-content' }}
        >
          {displayItems.map((category, idx) => {
            const imgSrc = resolveImageUrl(category);

            return (
              <div
                key={`${category._id || category.id || idx}-${idx}`}
                ref={(el) => { cardRefs.current[idx] = el; }}
                onClick={() => handleCardClick(category)}
                className="
                  flex-shrink-0 cursor-pointer group will-change-transform
                  -mr-5 xs:-mr-6 sm:-mr-8 md:-mr-10 lg:-mr-12
                "
              >
                {/* 
                  Card Container (Arrangement & Look matching screenshot):
                  - Rounded rectangle with subtle border and layered overlap
                  - Strictly image-only, zero text
                */}
                <div 
                  className="
                    relative overflow-hidden rounded-2xl sm:rounded-3xl
                    w-[170px] h-[150px]
                    xs:w-[200px] xs:h-[175px]
                    sm:w-[240px] sm:h-[200px]
                    md:w-[280px] md:h-[230px]
                    lg:w-[320px] lg:h-[260px]
                    bg-white border-2 border-white/90 shadow-[0_12px_28px_-6px_rgba(0,0,0,0.22)]
                    hover:shadow-2xl transition-all duration-300
                  "
                >
                  <img
                    src={imgSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                    className="w-full h-full object-cover select-none pointer-events-none rounded-2xl sm:rounded-3xl transition-transform duration-500 ease-out group-hover:scale-105"
                    draggable={false}
                  />

                  {/* Top glass reflection highlight */}
                  <div 
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl sm:rounded-t-3xl" 
                    aria-hidden="true" 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 
          Floating Controls:
          - Play/Pause circular toggle button (|| / ▶)
          - Subtle Direction toggle pill (Left <-> Right)
        */}
        <div className="absolute left-4 sm:left-6 bottom-3 sm:bottom-4 z-40 flex items-center gap-2">
          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((prev) => !prev);
            }}
            aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-gray-800 shadow-lg border border-black/15 flex items-center justify-center hover:bg-white active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-gray-800 fill-current" />
            ) : (
              <Play className="w-4 h-4 text-gray-800 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Direction Toggle Pill */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleDirection();
            }}
            title={direction === 1 ? 'Moving Left to Right (Click to reverse)' : 'Moving Right to Left (Click to reverse)'}
            aria-label="Toggle carousel direction"
            className="h-9 sm:h-10 px-3 rounded-full bg-white/95 text-gray-700 shadow-lg border border-black/15 flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all duration-200 cursor-pointer text-xs font-semibold"
          >
            {direction === 1 ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="hidden sm:inline text-gray-600 font-medium text-[11px]">Left → Right</span>
              </>
            ) : (
              <>
                <ChevronLeft className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                <span className="hidden sm:inline text-gray-600 font-medium text-[11px]">Right → Left</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
