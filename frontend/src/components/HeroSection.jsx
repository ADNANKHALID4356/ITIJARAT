import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../config';
import DynamicHomepageCards from './DynamicHomepageCards';
import LazyImage from './LazyImage';

// Configurable constants
const AUTOPLAY_INTERVAL = 5500; // 5.5s gentle interval
const TRANSITION_DURATION = 700; // 700ms smooth cubic-bezier slide

const HeroSection = ({ banners = [], hideCards = false }) => {
  // Normalize banner input
  const slides = useMemo(() => {
    if (!Array.isArray(banners) || banners.length === 0) return [];

    return banners
      .filter((slide) => slide && slide.isActive !== false)
      .map((slide, index) => {
        const rawImage = slide.imageFilename || slide.image;
        let bannerImage = '';

        if (rawImage) {
          // If already has path prefix
          if (rawImage.startsWith('/uploads/') || rawImage.startsWith('http')) {
            bannerImage = rawImage;
          } else {
            bannerImage = getImageUrl('banner-slides', rawImage);
          }
        } else if (slide.primaryProduct?.image) {
          // Legacy product fallback
          bannerImage = getImageUrl('products', slide.primaryProduct.image);
        }

        return {
          id: slide._id || `slide-${index}`,
          title: slide.title || '',
          subtitle: slide.subtitle || '',
          buttonText: slide.buttonText || 'Shop now',
          linkUrl: slide.linkUrl || '/products',
          bannerImage,
          order: typeof slide.order === 'number' ? slide.order : index
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [banners]);

  const slideCount = slides.length;

  // Extended slides for seamless infinite loop: [lastSlide, ...slides, firstSlide]
  const extendedSlides = useMemo(() => {
    if (slideCount <= 1) return slides;
    return [slides[slideCount - 1], ...slides, slides[0]];
  }, [slides, slideCount]);

  // Index points to extendedSlides (starts at 1 = first real slide)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Transition timeout ref to prevent overlapping transitions
  const transitionTimeoutRef = useRef(null);

  // Detect user's reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute real active index (0 to slideCount - 1) for dots
  const activeDotIndex = useMemo(() => {
    if (slideCount <= 1) return 0;
    if (currentIndex === 0) return slideCount - 1;
    if (currentIndex === slideCount + 1) return 0;
    return currentIndex - 1;
  }, [currentIndex, slideCount]);

  // Handle seamless loop teleportation at boundary clones
  const handleTransitionEnd = useCallback(() => {
    if (slideCount <= 1) return;

    if (currentIndex === slideCount + 1) {
      // Teleport from trailing clone back to slide 1 without animation
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex === 0) {
      // Teleport from leading clone back to last slide without animation
      setIsTransitioning(false);
      setCurrentIndex(slideCount);
    }
  }, [currentIndex, slideCount]);

  // When transitioning is disabled for teleportation, re-enable it on next render frame
  useEffect(() => {
    if (!isTransitioning) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [slideCount]);

  const goToSlide = useCallback((index) => {
    setIsTransitioning(true);
    setCurrentIndex(index + 1);
  }, []);

  // Autoplay timer
  useEffect(() => {
    if (slideCount <= 1 || isPaused || prefersReducedMotion) return;

    const interval = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [slideCount, isPaused, prefersReducedMotion, nextSlide]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  // Renders button link (handles internal /routes and external URLs)
  const renderSlideCTA = (slide) => {
    const isExternal = slide.linkUrl.startsWith('http://') || slide.linkUrl.startsWith('https://');
    const buttonContent = (
      <button className="shimmer-bg text-white font-bold px-6 py-3 md:px-8 md:py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-widest border border-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center gap-1.5 cursor-pointer">
        <span>{slide.buttonText || 'Shop now'}</span>
        {isExternal && <ExternalLink size={14} className="opacity-80" />}
      </button>
    );

    if (isExternal) {
      return (
        <a
          href={slide.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block select-none"
        >
          {buttonContent}
        </a>
      );
    }

    return (
      <Link to={slide.linkUrl || '/products'} className="inline-block select-none">
        {buttonContent}
      </Link>
    );
  };

  // If no slides available, render luxury shimmer container
  if (slideCount === 0) {
    return (
      <div className="w-full bg-white relative">
        <div className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] overflow-hidden bg-gray-950 flex items-center justify-center">
          <div className="w-full h-full shimmer-bg flex items-center justify-center">
            <div className="text-white/40 text-sm uppercase tracking-widest font-medium">
              Welcome to International Tijarat
            </div>
          </div>
        </div>
        {!hideCards && <DynamicHomepageCards />}
      </div>
    );
  }

  // Single slide (no slider track needed)
  if (slideCount === 1) {
    const single = slides[0];
    return (
      <div className="w-full bg-white relative">
        <section
          role="region"
          aria-label="Homepage hero banner"
          className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] overflow-hidden bg-gray-950 select-none"
        >
          {single.bannerImage ? (
            <LazyImage
              src={single.bannerImage}
              alt={single.title || 'Featured Promotion'}
              priority={true}
              fetchPriority="high"
              enableModernFormats={true}
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <div className="w-full h-full shimmer-bg" />
          )}

          {(single.title || single.subtitle) && (
            <div className="absolute top-6 left-6 sm:top-12 sm:left-12 lg:top-16 lg:left-16 z-20 max-w-sm sm:max-w-md bg-black/40 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-4 rounded-xl border border-white/15 shadow-xl text-white">
              {single.title && (
                <h1 className="text-base sm:text-2xl font-bold tracking-wide uppercase font-serif">
                  {single.title}
                </h1>
              )}
              {single.subtitle && (
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2">
                  {single.subtitle}
                </p>
              )}
            </div>
          )}

          <div className="absolute bottom-10 left-6 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16 z-30 select-none">
            {renderSlideCTA(single)}
          </div>
        </section>
        {!hideCards && <DynamicHomepageCards />}
      </div>
    );
  }

  return (
    <div className="w-full bg-white relative">
      <section
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured promotions carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] overflow-hidden bg-gray-950 select-none group"
      >
        {/* Sliding Track */}
        <div
          aria-live={isPaused ? "polite" : "off"}
          onTransitionEnd={handleTransitionEnd}
          className="flex h-full w-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition:
              isTransitioning && !prefersReducedMotion
                ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`
                : 'none'
          }}
        >
          {extendedSlides.map((slide, idx) => {
            // Determine if this slide is currently visible for fetch priority
            const isFirstRealSlide = idx === 1;

            return (
              <div
                key={`${slide.id}-${idx}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${((idx - 1 + slideCount) % slideCount) + 1} of ${slideCount}`}
                className="w-full h-full flex-shrink-0 relative overflow-hidden"
              >
                {slide.bannerImage ? (
                  <LazyImage
                    src={slide.bannerImage}
                    alt={slide.title || `Promotion slide ${idx}`}
                    priority={isFirstRealSlide}
                    fetchPriority={isFirstRealSlide ? 'high' : 'auto'}
                    enableModernFormats={true}
                    className="w-full h-full object-cover select-none pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full shimmer-bg flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/10" />
                  </div>
                )}

                {/* Optional Title + Subtitle Overlay */}
                {(slide.title || slide.subtitle) && (
                  <div className="absolute top-6 left-6 sm:top-12 sm:left-12 lg:top-16 lg:left-16 z-20 max-w-xs sm:max-w-md bg-black/40 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-4 rounded-xl border border-white/15 shadow-xl text-white">
                    {slide.title && (
                      <h2 className="text-sm sm:text-xl lg:text-2xl font-bold uppercase tracking-wider font-serif">
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {/* Action CTA Button */}
                <div className="absolute bottom-10 left-6 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16 z-30 select-none">
                  {renderSlideCTA(slide)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/50 text-white rounded-full p-2.5 sm:p-3 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/50 text-white rounded-full p-2.5 sm:p-3 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dot Pagination Indicators */}
        <div
          role="tablist"
          aria-label="Slide indicators"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-sm border border-white/10 shadow-md"
        >
          {slides.map((_, dotIdx) => {
            const isActive = dotIdx === activeDotIndex;
            return (
              <button
                key={dotIdx}
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${dotIdx + 1}`}
                onClick={() => goToSlide(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/80 ${
                  isActive
                    ? 'w-7 sm:w-9 h-2 sm:h-2.5 bg-white shadow-md'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </section>

      {/* Dynamic Homepage Cards - Preserved fully */}
      {!hideCards && <DynamicHomepageCards />}
    </div>
  );
};

export default HeroSection;
