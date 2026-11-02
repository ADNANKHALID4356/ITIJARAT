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
  const [isMobile, setIsMobile] = useState(false);

  // Animation controller refs
  const currentStepRef = useRef(0);
  const targetStepRef = useRef(0);
  const isPausedRef = useRef(false);
  const cardRefs = useRef([]);
  const rafIdRef = useRef(null);
  const autoplayTimerRef = useRef(null);

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

  // Prepare categories list (ensure at least 7 items for seamless circular cascade)
  const items = React.useMemo(() => {
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

  // Direct DOM style updater for 60fps smooth interpolation without React render overhead
  const renderCardPositions = useCallback((stepVal) => {
    if (total === 0) return;

    const mobile = window.innerWidth < 640;
    const step1X = mobile ? 38 : 46;
    const step2X = mobile ? 68 : 90;
    const centerDown = mobile ? 12 : 22;
    const stepUp = mobile ? 12 : 26;

    for (let i = 0; i < total; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      // Calculate relative circular step
      let relStep = ((i - stepVal) % total + total) % total;
      if (relStep > total / 2) relStep -= total;

      const absStep = Math.abs(relStep);
      const sign = relStep >= 0 ? 1 : -1;

      // 1. Horizontal offset percentage
      let xPercent = 0;
      if (absStep <= 1) {
        xPercent = sign * absStep * step1X;
      } else if (absStep <= 2) {
        xPercent = sign * (step1X + (absStep - 1) * (step2X - step1X));
      } else {
        xPercent = sign * (step2X + (absStep - 2) * 20);
      }

      // 2. Vertical offset (V-shape cascade: center card is lowest, outer cards are highest)
      const yOffset = centerDown - absStep * stepUp;

      // 3. Scale: center card is 1.0, mid cards 0.90, outer cards 0.80
      const scale = Math.max(0.55, 1.0 - absStep * (mobile ? 0.12 : 0.10));

      // 4. Opacity: smoothly fades to 0 before wrapping, preventing any crossing jump
      let opacity = 1.0;
      if (absStep <= 1) {
        opacity = 1.0 - absStep * 0.12;
      } else if (absStep <= 2) {
        opacity = 0.88 - (absStep - 1) * 0.23;
      } else {
        opacity = Math.max(0, 0.65 - (absStep - 2) * 2.0);
      }

      if (mobile && absStep > 1.15) {
        // Hide outer cards on mobile to prevent horizontal viewport clipping
        opacity = Math.max(0, 0.85 - (absStep - 1.0) * 4.0);
      }

      // 5. Elevation z-index
      const zIndex = absStep < 0.5 ? 30 : (absStep < 1.5 ? 20 : (absStep < 2.5 ? 10 : 0));
      const pointerEvents = absStep <= (mobile ? 1.2 : 2.2) && opacity > 0.1 ? 'auto' : 'none';

      el.style.transform = `translate(calc(-50% + ${xPercent}%), ${yOffset}px) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(zIndex);
      el.style.pointerEvents = pointerEvents;
    }
  }, [total]);

  // Smooth continuous animation frame loop
  const startAnimationLoop = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    const animate = () => {
      const diff = targetStepRef.current - currentStepRef.current;
      if (Math.abs(diff) > 0.0005) {
        // Continuous smooth easing towards target step without jerk
        currentStepRef.current += diff * 0.07;
        renderCardPositions(currentStepRef.current);
        rafIdRef.current = requestAnimationFrame(animate);
      } else {
        currentStepRef.current = targetStepRef.current;
        renderCardPositions(currentStepRef.current);
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [renderCardPositions]);

  // Initial placement and window resize listener
  useEffect(() => {
    renderCardPositions(currentStepRef.current);
    const handleResize = () => renderCardPositions(currentStepRef.current);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCardPositions]);

  // Step-by-step smooth auto-rotation with continuity
  useEffect(() => {
    if (total === 0) return;

    if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);

    autoplayTimerRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        targetStepRef.current += 1;
        startAnimationLoop();
      }
    }, 3600);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [total, startAnimationLoop]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handlePrev = useCallback(() => {
    targetStepRef.current -= 1;
    startAnimationLoop();
  }, [startAnimationLoop]);

  const handleNext = useCallback(() => {
    targetStepRef.current += 1;
    startAnimationLoop();
  }, [startAnimationLoop]);

  // Card click: center card navigates, side cards smoothly rotate to center
  const handleCardClick = (e, cardIndex, category) => {
    e.preventDefault();
    e.stopPropagation();

    // Calculate card's offset relative to current target
    let relStep = ((cardIndex - Math.round(targetStepRef.current)) % total + total) % total;
    if (relStep > total / 2) relStep -= total;

    if (Math.abs(relStep) < 0.4) {
      // Center card clicked -> Navigate to category collection
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
      // Side card clicked -> smoothly glide to make it active center
      targetStepRef.current += relStep;
      startAnimationLoop();
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
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTimeout(() => {
      isPausedRef.current = false;
    }, 2000);
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
      {/* 3D Stepped Cascade Container - Snug, tightly attached to upper cards */}
      <div className="relative w-full max-w-7xl mx-auto px-4 h-[190px] xs:h-[220px] sm:h-[270px] md:h-[320px] lg:h-[360px] xl:h-[385px] flex items-center justify-center">
        {items.map((category, idx) => {
          const imgSrc = resolveImageUrl(category);

          return (
            <div
              key={`${category._id || category.id || idx}-${idx}`}
              ref={(el) => { cardRefs.current[idx] = el; }}
              onClick={(e) => handleCardClick(e, idx, category)}
              className="absolute left-1/2 top-0 sm:top-1 will-change-transform cursor-pointer"
            >
              {/* Card Container - Strict Image Only, rounded corners, glass border & subtle sheen */}
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
                  loading={idx < 4 ? 'eager' : 'lazy'}
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
            handlePrev();
          }}
          aria-label="Previous category"
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-xl border border-gray-200/80 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
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
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-xl border border-gray-200/80 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </section>
  );
};

export default CategoryCarousel;
