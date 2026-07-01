import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../config';
import DynamicHomepageCards from './DynamicHomepageCards';
import LazyImage from './LazyImage';

const HeroSection = ({ banners = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // High-quality local assets as default fallback banners from your display folder
  const fallbackBanners = [
    {
      id: 'default-1',
      bannerImage: ""
    },
    {
      id: 'default-2',
      bannerImage: ""
    }
  ];

  const heroSlides = useMemo(() => {
    if (banners.length > 0) {
      return banners.map((slide) => ({
        id: slide._id,
        title: slide.title,
        // Uses the custom widescreen slide image uploaded by the admin
        bannerImage: slide.image ? getImageUrl('banner', slide.image) : (slide.primaryProduct ? getImageUrl('products', slide.primaryProduct.image) : null),
        category: slide.category
      }));
    }
    return fallbackBanners;
  }, [banners]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // Transitions slide every 6 seconds
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    if (heroSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="w-full bg-white relative">
      {/* 
        Main Hero Slider Container 
        Strictly managed height to support responsive aspect scaling:
        - Mobile: 280px tall
        - Tablet: 380px tall
        - Desktop: 480px to 540px tall (matches widescreen standards)
      */}
      <div className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] overflow-hidden bg-gray-950 select-none">
        
        {/* Render Banners */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {slide.bannerImage ? (
              <LazyImage 
                src={slide.bannerImage}
                alt={slide.title || "Promo slide"}
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                enableModernFormats={true}
                className="w-full h-full object-cover select-none"
              />
            ) : (
              // Luxury background shimmer fallback if slide is loading or fails
              <div className="w-full h-full shimmer-bg flex items-center justify-center">
                <div className="absolute inset-0 bg-black/10" />
              </div>
            )}

            {/* Optional elegant title banner header */}
            {slide.title && (
              <div className="absolute top-6 left-6 sm:top-12 sm:left-12 lg:top-16 lg:left-16 z-20 max-w-sm sm:max-w-md bg-black/30 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 shadow-lg">
                <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-white uppercase tracking-wider font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
                  {slide.title}
                </h1>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        {heroSlides.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 border border-white/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 border border-white/10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 
          DECOUPLED "SHOP NOW" OVERLAY BUTTON
          Always floats cleanly in the same position on top of any active slide 
        */}
        <Link 
          to="/products"
          className="absolute bottom-10 left-6 sm:bottom-12 sm:left-12 lg:bottom-16 lg:left-16 z-30 select-none cursor-pointer"
        >
          <button className="shimmer-bg text-white font-bold px-6 py-3.5 md:px-8 md:py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-widest border border-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            Shop now
          </button>
        </Link>

        {/* 
          BOTTOM LINE DIFFUSION GRADIENT
          This smoothly fades the bottom edge of the slide into your white background below!
        */}
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 md:h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />
      </div>

      {/* Dynamic Homepage Cards - Preserved fully */}
      <DynamicHomepageCards />
    </div>
  );
};

export default HeroSection;