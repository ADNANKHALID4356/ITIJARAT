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

    // Ensure at least 6 base items so loop is seamless across wide screens
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

  const trackRef = useRef(null);
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
    // Since displayItems has 3 duplicates of baseItems:
    singleSetWidthRef.current = totalScrollWidth / 3;

    // Initialize position centered on the middle set so it can scroll in either direction seamlessly
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

  // 60FPS Silky Continuous Ticker Loop
  useEffect(() => {
    const speed = 0.85; // Elegant, steady luxury glide speed (pixels per frame)

    const tick = () => {
      if (trackRef.current && singleSetWidthRef.current > 0) {
        if (isPlayingRef.current && !isHoveredRef.current) {
          // Move smoothly by speed * direction
          // direction = 1 means moving from left to right (translate3d increases)
          // direction = -1 means moving from right to left (translate3d decreases)
          posRef.current += speed * directionRef.current;

          const setWidth = singleSetWidthRef.current;

          // Seamless infinite wrap-around
          if (directionRef.current > 0 && posRef.current >= 0) {
            // Reached right boundary -> seamlessly shift back by one set width
            posRef.current -= setWidth;
          } else if (directionRef.current < 0 && posRef.current <= -setWidth * 2) {
            // Reached left boundary -> seamlessly shift forward by one set width
            posRef.current += setWidth;
          }

          trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
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
      className="relative w-full overflow-hidden select-none bg-white py-2 sm:py-3 my-0"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
      onTouchStart={() => { isHoveredRef.current = true; }}
      onTouchEnd={() => { isHoveredRef.current = false; }}
      aria-label="Continuous Category Carousel"
    >
      {/* Moving Ribbon Track Wrapper */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex items-center gap-3 sm:gap-4 md:gap-5 will-change-transform py-1"
          style={{ width: 'max-content' }}
        >
          {displayItems.map((category, idx) => {
            const imgSrc = resolveImageUrl(category);

            return (
              <div
                key={`${category._id || category.id || idx}-${idx}`}
                onClick={() => handleCardClick(category)}
                className="flex-shrink-0 cursor-pointer group"
              >
                {/* 
                  Card Container:
                  - Exact match to reference screenshot: rounded-2xl, crisp border, pure image
                  - Zero text, zero labels, zero overlays
                */}
                <div 
                  className="
                    relative overflow-hidden rounded-2xl
                    w-[160px] h-[160px]
                    xs:w-[185px] xs:h-[185px]
                    sm:w-[210px] sm:h-[210px]
                    md:w-[235px] md:h-[235px]
                    lg:w-[250px] lg:h-[250px]
                    bg-gray-100 border border-black/10 shadow-sm
                    hover:shadow-md hover:border-black/25
                    transition-all duration-300
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
                    className="w-full h-full object-cover select-none pointer-events-none rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 
          Floating Controls (Exact match to reference screenshot):
          - Play/Pause circular toggle button (|| / ▶)
          - Subtle Direction toggle arrows (Left <-> Right)
        */}
        <div className="absolute left-4 sm:left-6 bottom-4 sm:bottom-6 z-30 flex items-center gap-2">
          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((prev) => !prev);
            }}
            aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-gray-800 shadow-lg border border-black/15 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 fill-current" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 fill-current translate-x-0.5" />
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
            className="h-10 sm:h-11 px-3 rounded-full bg-white/95 text-gray-700 shadow-lg border border-black/15 flex items-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all duration-200 cursor-pointer text-xs font-semibold"
          >
            {direction === 1 ? (
              <>
                <ChevronRight className="w-4 h-4 text-orange-600 animate-pulse" />
                <span className="hidden sm:inline text-gray-600 font-medium text-[11px]">Left → Right</span>
              </>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-orange-600 animate-pulse" />
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
