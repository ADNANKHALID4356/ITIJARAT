import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  // Prepare categories list (ensure at least 7 items for seamless circular buffer slots)
  const items = useMemo(() => {
    const validProps = Array.isArray(homepageCategoriesProp) && homepageCategoriesProp.length > 0
      ? homepageCategoriesProp
      : DEFAULT_FALLBACK_CATEGORIES;

    let list = [...validProps];
    if (list.length > 0 && list.length < 7) {
      while (list.length < 7) {
        list = [...list, ...validProps];
      }
    }
    return list;
  }, [homepageCategoriesProp]);

  const total = items.length;

  // Initialize slots: [0, 1, 2, 3, -3, -2, -1] for N=7
  const initSlots = useCallback((count) => {
    const half = Math.floor(count / 2);
    return Array.from({ length: count }, (_, i) => (i <= half ? i : i - count));
  }, []);

  const [slots, setSlots] = useState(() => initSlots(total));
  const [instantCard, setInstantCard] = useState(null);

  const isAnimatingRef = useRef(false);
  const isPausedRef = useRef(false);
  const autoplayTimerRef = useRef(null);

  // Touch gesture refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);

  // Sync slots if total items count changes
  useEffect(() => {
    setSlots(initSlots(total));
    setInstantCard(null);
    isAnimatingRef.current = false;
  }, [total, initSlots]);

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

  // Smooth forward step: all cards glide left simultaneously
  const stepForward = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setInstantCard(null);

    // 1. Shift all cards left by 1 position (monotonic, parallel 700ms glide)
    setSlots((prev) => prev.map((s) => s - 1));

    // 2. Once animation completes, quietly wrap the off-screen exit card to the entry buffer
    setTimeout(() => {
      setSlots((prev) => {
        const next = [...prev];
        const half = Math.floor(next.length / 2);
        const wrappedIdx = next.indexOf(-half - 1);
        if (wrappedIdx !== -1) {
          next[wrappedIdx] = half;
          setInstantCard(wrappedIdx);
        }
        return next;
      });
      isAnimatingRef.current = false;
    }, 710);
  }, []);

  // Smooth backward step: all cards glide right simultaneously
  const stepBackward = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setInstantCard(null);

    // 1. Shift all cards right by 1 position (monotonic, parallel 700ms glide)
    setSlots((prev) => prev.map((s) => s + 1));

    // 2. Once animation completes, quietly wrap the off-screen exit card to the entry buffer
    setTimeout(() => {
      setSlots((prev) => {
        const next = [...prev];
        const half = Math.floor(next.length / 2);
        const wrappedIdx = next.indexOf(half + 1);
        if (wrappedIdx !== -1) {
          next[wrappedIdx] = -half;
          setInstantCard(wrappedIdx);
        }
        return next;
      });
      isAnimatingRef.current = false;
    }, 710);
  }, []);

  // Periodic auto-rotation
  useEffect(() => {
    if (total === 0) return;

    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);

    autoplayTimerRef.current = setInterval(() => {
      if (!isPausedRef.current && !isAnimatingRef.current) {
        stepForward();
      }
    }, 3800);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [total, stepForward]);

  // Card click: center card navigates, side cards smoothly glide to center
  const handleCardClick = (e, idx, category) => {
    e.preventDefault();
    e.stopPropagation();

    const currentSlot = slots[idx];

    if (currentSlot === 0) {
      // Center card clicked -> Navigate to category products collection
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
    } else if (currentSlot === 1) {
      stepForward();
    } else if (currentSlot === -1) {
      stepBackward();
    } else if (currentSlot === 2) {
      stepForward();
      setTimeout(() => stepForward(), 730);
    } else if (currentSlot === -2) {
      stepBackward();
      setTimeout(() => stepBackward(), 730);
    }
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = true;
    isPausedRef.current = true;
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
        stepForward();
      } else {
        stepBackward();
      }
    }
    setTimeout(() => {
      isPausedRef.current = false;
    }, 2000);
  };

  // Helper to compute CSS style for each slot
  const getSlotStyle = (slot, isInstant) => {
    const step1X = isMobile ? 38 : 46;
    const step2X = isMobile ? 68 : 90;
    const step3X = isMobile ? 98 : 130;
    const centerDown = isMobile ? 12 : 22;
    const stepUp = isMobile ? 12 : 26;

    // Use transition for visible/entering/exiting cards; disable for instant buffer wraps
    const transition = isInstant
      ? 'none'
      : 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1), opacity 700ms ease';

    if (slot === 0) {
      // CENTER CARD (Front, lowest top edge, highest z-index)
      return {
        transform: `translate(-50%, ${centerDown}px) scale(1.0)`,
        opacity: 1.0,
        zIndex: 30,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition
      };
    }

    if (slot === -1) {
      // MID LEFT CARD
      return {
        transform: `translate(calc(-50% - ${step1X}%), 0px) scale(0.90)`,
        opacity: 0.88,
        zIndex: 20,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition
      };
    }

    if (slot === 1) {
      // MID RIGHT CARD
      return {
        transform: `translate(calc(-50% + ${step1X}%), 0px) scale(0.90)`,
        opacity: 0.88,
        zIndex: 20,
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition
      };
    }

    if (slot === -2) {
      // OUTER LEFT CARD
      return {
        transform: `translate(calc(-50% - ${step2X}%), ${-stepUp}px) scale(0.80)`,
        opacity: isMobile ? 0 : 0.65,
        zIndex: 10,
        pointerEvents: isMobile ? 'none' : 'auto',
        cursor: isMobile ? 'default' : 'pointer',
        transition
      };
    }

    if (slot === 2) {
      // OUTER RIGHT CARD
      return {
        transform: `translate(calc(-50% + ${step2X}%), ${-stepUp}px) scale(0.80)`,
        opacity: isMobile ? 0 : 0.65,
        zIndex: 10,
        pointerEvents: isMobile ? 'none' : 'auto',
        cursor: isMobile ? 'default' : 'pointer',
        transition
      };
    }

    if (slot <= -3) {
      // OFF-SCREEN LEFT BUFFER
      return {
        transform: `translate(calc(-50% - ${step3X}%), ${-stepUp - 6}px) scale(0.70)`,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none',
        cursor: 'default',
        transition
      };
    }

    // OFF-SCREEN RIGHT BUFFER (slot >= 3)
    return {
      transform: `translate(calc(-50% + ${step3X}%), ${-stepUp - 6}px) scale(0.70)`,
      opacity: 0,
      zIndex: 0,
      pointerEvents: 'none',
      cursor: 'default',
      transition
    };
  };

  if (total === 0) return null;

  return (
    <section 
      className="relative w-full overflow-hidden select-none bg-white py-0 my-0"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Category Carousel"
    >
      {/* 3D Stepped Cascade Container - Snug, seamlessly attached to upper cards */}
      <div className="relative w-full max-w-7xl mx-auto px-4 h-[190px] xs:h-[220px] sm:h-[270px] md:h-[320px] lg:h-[360px] xl:h-[385px] flex items-center justify-center">
        {items.map((category, idx) => {
          const imgSrc = resolveImageUrl(category);
          const currentSlot = slots[idx];
          const isInstant = instantCard === idx;
          const slotStyle = getSlotStyle(currentSlot, isInstant);

          return (
            <div
              key={`${category._id || category.id || idx}-${idx}`}
              onClick={(e) => handleCardClick(e, idx, category)}
              style={slotStyle}
              className="absolute left-1/2 top-0 sm:top-1 will-change-transform"
            >
              {/* Card Container - Strict Image Only, rounded corners, glass border & subtle reflection */}
              <div
                className={`
                  relative overflow-hidden rounded-2xl sm:rounded-3xl
                  w-[230px] h-[145px]
                  xs:w-[260px] xs:h-[165px]
                  sm:w-[310px] sm:h-[195px]
                  md:w-[370px] md:h-[235px]
                  lg:w-[430px] lg:h-[270px]
                  xl:w-[470px] xl:h-[295px]
                  border border-black/15 sm:border-white/60
                  shadow-[0_18px_36px_-10px_rgba(0,0,0,0.22)]
                  bg-white
                  transition-shadow duration-300 hover:shadow-2xl
                `}
              >
                {/* Pure Image - Absolutely NO Text */}
                <img
                  src={imgSrc}
                  alt=""
                  loading={Math.abs(currentSlot) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                  className="w-full h-full object-cover select-none pointer-events-none rounded-2xl sm:rounded-3xl transition-transform duration-500 ease-out hover:scale-105"
                  draggable={false}
                />

                {/* Subtle glass reflection highlight on top edge */}
                <div 
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl sm:rounded-t-3xl" 
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
            stepBackward();
          }}
          aria-label="Previous category"
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-xl border border-gray-200/80 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Floating Right Chevron Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            stepForward();
          }}
          aria-label="Next category"
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-xl border border-gray-200/80 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </section>
  );
};

export default CategoryCarousel;
