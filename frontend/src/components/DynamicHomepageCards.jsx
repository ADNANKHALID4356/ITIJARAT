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
      <div className="bg-[#FAF7F3] pt-3 sm:pt-4 pb-0">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="bg-white border border-[#E8DED8] animate-pulse rounded-2xl h-56 sm:h-72 lg:h-80"></div>
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
    <div className="w-full bg-[#FAF7F3] pt-3 sm:pt-4 pb-1">
      <div className="w-full px-3 sm:px-6">
        {/* 
          Main Grid Wrapper:
          - grid-cols-2: 2 columns on mobile
          - sm:grid-cols-2: 2 columns on tablets
          - md:grid-cols-3: 3 columns on small desktops
          - lg:grid-cols-4: 4 columns on widescreen desktops
          - items-stretch: all cards share equal dynamic height
        */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 lg:gap-4 items-stretch">
          {cardPositions.map((card, index) => {
            // 1. Placeholder card if no card is configured
            if (!card) {
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl border border-dashed border-[#E8DED8] p-3 sm:p-3.5 lg:p-4 flex items-center justify-center h-full min-h-[200px] text-[#8B8080]"
                >
                  <div className="text-center">
                    <div className="w-6 h-6 bg-[#FAF7F3] rounded-full mx-auto mb-2 animate-pulse"></div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#746B6C] font-body">
                      Card {index + 1}
                    </p>
                    <p className="text-[9px] text-[#8B8080] mt-0.5 font-body">Not Configured</p>
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
                  className="bg-white rounded-2xl border border-[#E8DED8] hover:border-[#D8C9C0] shadow-2xs hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between h-full group"
                >
                  <div className="w-full">
                    <Link to={mainUrl} className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3 group-hover:text-[#5B1830] transition-colors">
                      <h3 className="text-xs sm:text-base font-semibold text-[#241A1D] tracking-tight leading-snug line-clamp-2 font-body">
                        {card.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-[#746B6C] flex-shrink-0 group-hover:text-[#5B1830] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    {card.mainImage && (
                      <Link to={mainUrl} className="block group/img">
                        <div className="aspect-[4/3] sm:aspect-square w-full rounded-xl overflow-hidden bg-[#FAF7F3] border border-[#E8DED8] group-hover/img:border-[#B97855]/60 transition-all duration-300 shadow-2xs group-hover/img:shadow-xs">
                          <LazyImage 
                            src={getCardImageUrl(card)}
                            alt={card.title}
                            enableModernFormats={true}
                            priority={card.order === 1}
                            optimizedImage={card.optimizedMainImage || null}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 cursor-pointer"
                          />
                        </div>
                      </Link>
                    )}
                  </div>
                  
                  <Link 
                    to={mainUrl} 
                    className="text-[11px] sm:text-xs font-semibold text-[#5B1830] hover:text-[#350A1B] font-body transition-colors tracking-wider uppercase mt-auto pt-2.5 sm:pt-3 block"
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
                  className="bg-white rounded-2xl border border-[#E8DED8] hover:border-[#D8C9C0] shadow-2xs hover:shadow-md transition-all duration-300 p-3 sm:p-3.5 lg:p-4 flex flex-col justify-between h-full group"
                >
                  <div className="w-full">
                    <Link to={firstSubUrl} className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3 group-hover:text-[#5B1830] transition-colors">
                      <h3 className="text-xs sm:text-base font-semibold text-[#241A1D] tracking-tight leading-snug line-clamp-2 font-body">
                        {card.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-[#746B6C] flex-shrink-0 group-hover:text-[#5B1830] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-1.5">
                      {card.subcategoryItems.map((item, idx) => {
                        const optimizedItem = card.optimizedSubcategoryItems?.[idx];
                        return (
                          <div key={idx} className="flex flex-col items-start group/sub">
                            <Link to={getCategoryUrl(item.category._id, item.category.name)} className="w-full block">
                              <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#FAF7F3] border border-[#E8DED8] group-hover/sub:border-[#B97855]/60 transition-all duration-300 shadow-2xs group-hover/sub:shadow-xs relative">
                                <LazyImage 
                                  src={getSubcategoryImageUrl(item)}
                                  alt={item.name}
                                  enableModernFormats={true}
                                  priority={card.order === 1 && idx < 2}
                                  optimizedImage={optimizedItem?.optimizedImage || null}
                                  className="w-full h-full object-cover group-hover/sub:scale-105 transition-transform duration-300"
                                />
                              </div>
                            </Link>
                            <p className="text-[11px] sm:text-xs text-[#241A1D] group-hover/sub:text-[#5B1830] font-medium mt-1.5 text-left line-clamp-1 w-full font-body transition-colors">
                              {item.name}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link 
                    to={firstSubUrl} 
                    className="text-[11px] sm:text-xs font-semibold text-[#5B1830] hover:text-[#350A1B] font-body transition-colors tracking-wider uppercase mt-auto pt-2.5 sm:pt-3 block"
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
                className="bg-white rounded-2xl border border-[#E8DED8] p-3 sm:p-4 lg:p-5 flex items-center justify-center h-full min-h-[200px] text-[#8B8080]"
              >
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#C43D43] uppercase tracking-wider font-body">Invalid Configuration</p>
                  <p className="text-[10px] text-[#746B6C] mt-1 font-body">{card.title}</p>
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
