import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../api';
import { getImageUrl } from '../config';
import LazyImage from './LazyImage';

const CACHE_DURATION = 30000; // 30 seconds - Preserved exactly

const DynamicHomepageCards = () => {
  // --- LOGIC AND CACHING: 100% PRESERVED AND UNTOUCHED ---
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const cache = useRef({
    cards: { data: null, timestamp: 0 }
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const now = Date.now();
    if (cache.current.cards.data && now - cache.current.cards.timestamp < CACHE_DURATION) {
      console.log('Using cached homepage cards data');
      setCards(cache.current.cards.data);
      setLoading(false);
      return;
    }

    console.log('Fetching fresh homepage cards data');
    try {
      const response = await API.get('/homepage/cards');
      const data = response.data.cards || [];
      console.log('Homepage cards received:', data.length);
      setCards(data);
      
      cache.current.cards = {
        data: data,
        timestamp: now
      };
    } catch (err) {
      console.error('Error fetching homepage cards:', err);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const getCardImageUrl = (card) => {
    if (card.type === 'main-category' && card.mainImage) {
      return getImageUrl('homepage-cards', card.mainImage);
    }
    return null;
  };

  const getSubcategoryImageUrl = (subcategoryItem) => {
    if (subcategoryItem?.image) {
      return getImageUrl('homepage-cards', subcategoryItem.image);
    }
    return null;
  };

  const getCategoryUrl = (categoryId, categoryName) => {
    if (!categoryName) return '/products';
    return `/category-group/${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
  };
  // --- END OF UNTOUCHED LOGIC ---

  // Loading skeleton matching the 2-column mobile / 4-column desktop layout
  if (loading) {
    return (
      <div className="bg-white pt-3 sm:pt-4 pb-0">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="bg-gray-100 animate-pulse rounded-2xl h-56 sm:h-72 lg:h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Create array for all 4 positions
  const cardPositions = [1, 2, 3, 4].map(position => 
    cards.find(card => card.order === position) || null
  );

  return (
    <div className="w-full bg-white pt-3 sm:pt-4 pb-1">
      <div className="w-full px-3 sm:px-6">
        {/* 
          Main Grid Wrapper:
          - grid-cols-2: 2 columns on mobile
          - sm:grid-cols-2: 2 columns on tablets
          - md:grid-cols-3: 3 columns on small desktops
          - lg:grid-cols-4: 4 columns on widescreen desktops
          - items-stretch: all cards share equal dynamic height
        */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 items-stretch">
          {cardPositions.map((card, index) => {
            // 1. Placeholder card if no card is configured
            if (!card) {
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl border border-dashed border-black/25 p-3 sm:p-4 lg:p-5 flex items-center justify-center h-full min-h-[200px] text-gray-400"
                >
                  <div className="text-center">
                    <div className="w-6 h-6 bg-gray-200/50 rounded-full mx-auto mb-2 animate-pulse"></div>
                    <p className="text-[10px] sm:text-xs font-serif uppercase tracking-wider text-gray-500" style={{ fontFamily: 'var(--font-serif)' }}>
                      Card {index + 1}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Not Configured</p>
                  </div>
                </div>
              );
            }

            // 2. Main category card (single image)
            if (card.type === 'main-category') {
              const mainUrl = getCategoryUrl(card.mainCategory?._id, card.mainCategory?.name);
              return (
                <div 
                  key={card._id} 
                  className="bg-white rounded-2xl border border-black/25 hover:border-black/60 shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 lg:p-5 flex flex-col justify-between h-full group"
                >
                  <div className="w-full">
                    <Link to={mainUrl} className="flex items-center justify-between gap-2 mb-3 sm:mb-4 group-hover:text-[#0F0A87] transition-colors">
                      <h3 className="text-xs sm:text-base font-bold text-gray-900 tracking-tight leading-snug line-clamp-2">
                        {card.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-gray-700 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    {card.mainImage && (
                      <Link to={mainUrl} className="block group/img">
                        <div className="aspect-[4/3] sm:aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-2 border border-black/5 group-hover/img:border-black/15 transition-all duration-300">
                          <LazyImage 
                            src={getCardImageUrl(card)}
                            alt={card.title}
                            enableModernFormats={true}
                            priority={card.order === 1}
                            optimizedImage={card.optimizedMainImage || null}
                            className="w-full h-full object-cover rounded-lg group-hover/img:scale-105 transition-transform duration-500 cursor-pointer"
                          />
                        </div>
                      </Link>
                    )}
                  </div>
                  
                  <Link 
                    to={mainUrl} 
                    className="text-[10px] sm:text-xs font-bold text-[#0F0A87] hover:text-[#1510B5] font-serif transition-colors tracking-widest uppercase mt-auto pt-2 sm:pt-3 block"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Explore Now →
                  </Link>
                </div>
              );
            }

            // 3. Subcategories card (4 images in 2x2 grid)
            if (card.type === 'subcategories' && card.subcategoryItems?.length === 4) {
              const firstSubUrl = getCategoryUrl(card.subcategoryItems[0].category._id, card.subcategoryItems[0].category.name);
              return (
                <div 
                  key={card._id} 
                  className="bg-white rounded-2xl border border-black/25 hover:border-black/60 shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 lg:p-5 flex flex-col justify-between h-full group"
                >
                  <div className="w-full">
                    <Link to={firstSubUrl} className="flex items-center justify-between gap-2 mb-3 sm:mb-4 group-hover:text-[#0F0A87] transition-colors">
                      <h3 className="text-xs sm:text-base font-bold text-gray-900 tracking-tight leading-snug line-clamp-2">
                        {card.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-gray-700 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-2">
                      {card.subcategoryItems.map((item, idx) => {
                        const optimizedItem = card.optimizedSubcategoryItems?.[idx];
                        return (
                          <div key={idx} className="flex flex-col items-start group/sub">
                            <Link to={getCategoryUrl(item.category._id, item.category.name)} className="w-full block">
                              <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1.5 sm:p-2 border border-black/5 group-hover/sub:border-black/15 transition-all duration-300">
                                <LazyImage 
                                  src={getSubcategoryImageUrl(item)}
                                  alt={item.name}
                                  enableModernFormats={true}
                                  priority={card.order === 1 && idx < 2}
                                  optimizedImage={optimizedItem?.optimizedImage || null}
                                  className="w-full h-full object-contain rounded-lg group-hover/sub:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </Link>
                            <p className="text-[10px] sm:text-xs text-gray-800 font-medium mt-1.5 text-left line-clamp-1 w-full">
                              {item.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link 
                    to={firstSubUrl} 
                    className="text-[10px] sm:text-xs font-bold text-[#0F0A87] hover:text-[#1510B5] font-serif transition-colors tracking-widest uppercase mt-auto pt-3 block"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Discover →
                  </Link>
                </div>
              );
            }

            // Fallback for invalid card configurations
            return (
              <div 
                key={card._id} 
                className="bg-white rounded-2xl border border-black/25 p-3 sm:p-4 lg:p-5 flex items-center justify-center h-full min-h-[200px] text-gray-400"
              >
                <div className="text-center">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest font-serif" style={{ fontFamily: 'var(--font-serif)' }}>Invalid Configuration</p>
                  <p className="text-[10px] text-gray-500 mt-1">{card.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DynamicHomepageCards;
