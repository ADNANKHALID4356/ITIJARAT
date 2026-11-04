import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ProductService from "../services/productService";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useVendorAuth } from "../contexts/VendorAuthContext";
import { getApiUrl } from "../config";

// Icons - Preserved exactly
const ShoppingCartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const UserIcon = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
</svg>
);

const SearchIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const Navbar = () => {
  // --- LOGIC SECTION: Preserved 100% untouched ---
  const [isOpen, setIsOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const categoriesRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const navigate = useNavigate();
  
  const { cartStats } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { isAuthenticated: isVendorAuthenticated, vendor, logout: vendorLogout } = useVendorAuth();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetch(getApiUrl('/categories')).then(res => res.json());
        const formattedCategories = {};
        if (Array.isArray(categoriesData)) {
          const mainCategories = categoriesData.filter(cat => !cat.parentCategory);
          mainCategories.forEach(mainCat => {
            const subcategories = categoriesData.filter(cat => {
              const parentId = cat.parentCategory?._id || cat.parentCategory;
              return parentId === mainCat._id;
            });
            formattedCategories[mainCat.name] = subcategories.map(sub => sub.name);
          });
        }
        setCategories(formattedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories({});
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const mainPages = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/products" },
    { label: "Buy/Sell Used Products", path: "/used-products" },
    { label: "Property Sale/Purchase", path: "/properties" },
    { label: "Wholesale Dealership", path: "/contact-wholeseller" },
  ];

  const otherPages = [
    { label: "Blog", path: "/BlogPage" },
    { label: "About Us", path: "/AboutUsPage" },
    { label: "Contact Us", path: "/ContactUsPage" },
  ];
  // --- END OF LOGIC SECTION ---

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-[#E8DED8] shadow-xs header-glass-white">
      {/* Main Navigation - Shifted slightly left with pl-2 sm:pl-3 lg:pl-4 */}
      <div className="w-full pl-2 sm:pl-3 lg:pl-4 pr-3 sm:pr-4 lg:pr-6">
        <div className="flex items-center justify-between h-14 py-1.5">
          
          {/* Logo on Left */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0 transition-transform hover:scale-105" aria-label="International Tijarat Home">
            <img
              src="/IT Images/ITLOGO2.png"
              alt="International Tijarat"
              className="h-9 sm:h-10 w-auto object-contain drop-shadow-xs"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Link>

          {/* Search Bar - Stretched across entire remaining space */}
          <div className="flex-1 mx-2 sm:mx-3 lg:mx-4 min-w-0">
            <form onSubmit={handleSearch} className="flex w-full overflow-hidden rounded-md border border-[#E8DED8] focus-within:border-[#5B1830] focus-within:ring-1 focus-within:ring-[#5B1830] transition-all bg-white shadow-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium products..."
                className="bg-transparent text-[#241A1D] flex-1 px-3 sm:px-4 py-1.5 text-xs sm:text-sm focus:outline-none placeholder-[#8B8080] min-w-0 font-body"
              />
              <button
                type="submit"
                className="bg-[#5B1830] hover:bg-[#350A1B] text-white px-4 sm:px-5 py-1.5 transition-colors flex-shrink-0 flex items-center justify-center cursor-pointer"
                aria-label="Search"
              >
                <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </form>
          </div>

          {/* Right Side Navigation: Centered alignment for Account and Cart */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Account Info & Button */}
            <div className="flex items-center space-x-2">
              {isVendorAuthenticated || isAuthenticated ? (
                <div className="flex flex-col items-end leading-tight mr-1">
                  <span className="text-[#8B8080] text-[10px] uppercase tracking-wider font-body">Welcome</span>
                  <span className="text-[#241A1D] text-xs sm:text-sm font-semibold truncate max-w-[140px] font-body">
                    {isVendorAuthenticated ? (vendor?.businessName || vendor?.name) : user?.name}
                  </span>
                </div>
              ) : null}

              <div className="relative group">
                <button className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all duration-200 border border-transparent hover:border-[#E8DED8] hover:bg-[#FAF7F3] ${!isAuthenticated && !isVendorAuthenticated ? 'bg-[#5B1830] hover:bg-[#350A1B] text-white shadow-sm' : 'text-[#241A1D]'}`}>
                  <UserIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${!isAuthenticated && !isVendorAuthenticated ? 'text-white' : 'text-[#746B6C]'}`} />
                  <span className={`font-semibold text-xs sm:text-sm font-body ${!isAuthenticated && !isVendorAuthenticated ? 'text-white' : 'text-[#241A1D]'}`}>Account</span>
                  <ChevronDownIcon className={`w-3.5 h-3.5 ${!isAuthenticated && !isVendorAuthenticated ? 'text-white/80' : 'text-[#8B8080]'}`} />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8DED8] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-2">
                    {isVendorAuthenticated ? (
                      <>
                        <NavLink to="/vendor/dashboard" className="flex items-center px-4 py-2.5 text-sm font-medium text-[#241A1D] hover:bg-[#F4E9ED] hover:text-[#5B1830] transition-colors font-body">
                          Vendor Dashboard
                        </NavLink>
                        <hr className="border-[#E8DED8] my-1" />
                        <button onClick={vendorLogout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-[#C43D43] hover:bg-[#FBECEE] transition-colors font-body">
                          Logout
                        </button>
                      </>
                    ) : isAuthenticated ? (
                      <>
                        <NavLink to="/profile" className="flex items-center px-4 py-2.5 text-sm font-medium text-[#241A1D] hover:bg-[#F4E9ED] hover:text-[#5B1830] transition-colors font-body">
                          My Profile
                        </NavLink>
                        <NavLink to="/orders" className="flex items-center px-4 py-2.5 text-sm font-medium text-[#241A1D] hover:bg-[#F4E9ED] hover:text-[#5B1830] transition-colors font-body">
                          My Orders
                        </NavLink>
                        <hr className="border-[#E8DED8] my-1" />
                        <button onClick={logout} className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-[#C43D43] hover:bg-[#FBECEE] transition-colors font-body">
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <NavLink to="/login" className="flex items-center px-4 py-2.5 text-sm font-medium text-[#241A1D] hover:bg-[#FAF7F3] hover:text-[#5B1830] transition-colors font-body">Login</NavLink>
                        <NavLink to="/register" className="flex items-center px-4 py-2.5 text-sm font-medium text-[#241A1D] hover:bg-[#FAF7F3] hover:text-[#5B1830] transition-colors font-body">Register</NavLink>
                        <div className="bg-[#FAF7F3] border border-[#E8DED8] m-2 rounded-lg">
                          <NavLink to="/vendor/login" className="flex items-center px-4 py-2.5 text-sm font-semibold text-[#5B1830] hover:text-[#350A1B] font-body">Sell With Us</NavLink>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Widget */}
            <Link to="/cart" className="relative flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-[#241A1D] hover:text-[#5B1830] group transition-all hover:bg-[#FAF7F3] border border-transparent hover:border-[#E8DED8]">
              <div className="relative flex-shrink-0">
                <ShoppingCartIcon className="w-6 h-6 transition-transform group-hover:scale-105 text-[#241A1D] group-hover:text-[#5B1830]" />
                {cartStats.totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#5B1830] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs border-2 border-white">
                    {cartStats.totalItems}
                  </span>
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-[#8B8080] font-body">Your Cart</span>
                <span className="text-xs sm:text-sm font-semibold text-[#241A1D] group-hover:text-[#5B1830] font-body">Checkout</span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <Link to="/cart" className="relative text-[#241A1D]">
              <ShoppingCartIcon className="w-6 h-6" />
              {cartStats.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#5B1830] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartStats.totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#241A1D] p-1" aria-label="Toggle Navigation">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Left-aligned Grouping */}
      <div className="bg-[#FAF7F3] border-b border-[#E8DED8]">
        <div className="w-full pl-2 sm:pl-3 lg:pl-4 pr-3 sm:pr-4 lg:pr-6">
          <nav className="hidden md:flex items-center h-10 justify-between">
            
            {/* Left Group: Browse All + Main Nav Links */}
            <div className="flex items-center space-x-2 sm:space-x-4 h-full">
              {/* All Categories Dropdown - Placed on the Left */}
              <div className="relative flex-shrink-0" ref={categoriesRef} onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                <button className="bg-[#5B1830] hover:bg-[#350A1B] flex items-center space-x-1.5 px-3 py-1 rounded text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors cursor-pointer font-body">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" /></svg>
                  <span className="text-white">Browse All</span>
                </button>

                {catOpen && (
                  <div className="absolute left-0 mt-1 w-64 z-50 bg-white rounded-lg shadow-xl border border-[#E8DED8] overflow-visible">
                    <div className="max-h-[70vh] overflow-y-auto py-2 scrollbar-thin">
                      {loadingCategories ? (
                        <div className="p-4 text-center text-xs font-semibold text-[#8B8080] animate-pulse uppercase tracking-wider font-body">Loading...</div>
                      ) : Object.entries(categories).sort().map(([main, subs]) => (
                        <div key={main} className="relative group/item" 
                             onMouseEnter={(e) => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); setHoveredCategory(main); const rect = e.currentTarget.getBoundingClientRect(); setSubmenuPosition(rect.top - e.currentTarget.closest('.overflow-y-auto').getBoundingClientRect().top); }}
                             onMouseLeave={() => { hoverTimeoutRef.current = setTimeout(() => setHoveredCategory(null), 150); }}>
                          <Link to={`/category-group/${main.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} 
                                className="flex justify-between items-center px-4 py-2.5 text-sm font-medium text-[#241A1D] hover:bg-[#F4E9ED] hover:text-[#5B1830] transition-all border-l-3 border-transparent hover:border-[#5B1830] font-body"
                                onClick={() => setCatOpen(false)}>
                            <span>{main}</span>
                            {subs.length > 0 && <ChevronDownIcon className="w-4 h-4 -rotate-90 text-[#8B8080]" />}
                          </Link>
                          
                          {/* Submenu */}
                          {hoveredCategory === main && subs.length > 0 && (
                            <div className="absolute left-full top-0 w-64 ml-[1px] bg-white shadow-xl border border-[#E8DED8] rounded-r-lg overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200"
                                 style={{ top: `${submenuPosition}px` }} onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}>
                              <div className="bg-[#FAF7F3] px-4 py-2 border-b border-[#E8DED8] text-[10px] font-semibold text-[#8B8080] uppercase tracking-wider font-body">{main} Collection</div>
                              {subs.sort().map((sub, i) => (
                                <Link key={i} to={`/category-group/${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                                      className="block px-4 py-2.5 text-sm font-medium text-[#746B6C] hover:bg-[#F4E9ED] hover:text-[#5B1830] font-body"
                                      onClick={() => setCatOpen(false)}>{sub}</Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Links - Aligned right next to Browse All */}
              <div className="flex items-center space-x-1 h-full">
                {mainPages.map((page) => (
                  <NavLink
                    key={page.label}
                    to={page.path}
                    className={({ isActive }) => {
                      const isWholesale = page.label === 'Wholesale Dealership';
                      if (isWholesale) {
                        return isActive
                          ? 'mx-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-[#5B1830] text-white border border-[#5B1830] shadow-2xs font-body'
                          : 'mx-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-[#F4E9ED] text-[#5B1830] border border-[#B97855]/40 hover:bg-[#5B1830] hover:text-white shadow-2xs font-body';
                      }
                      return `px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-all flex items-center h-full font-body ${isActive ? 'text-[#5B1830] border-b-2 border-[#5B1830]' : 'text-[#746B6C] hover:text-[#241A1D] hover:bg-black/5'}`;
                    }}
                  >
                    {page.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right: Other Pages Dropdown */}
            <div className="relative group flex items-center h-full">
              <button className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-semibold text-[#746B6C] hover:text-[#241A1D] uppercase tracking-wider hover:bg-black/5 transition-colors font-body">
                <span>More</span>
                <ChevronDownIcon className="w-3 h-3 text-[#8B8080]" />
              </button>
              <div className="absolute right-0 top-full w-48 bg-white rounded-b-lg shadow-xl border border-[#E8DED8] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                {otherPages.map((page) => (
                  <NavLink key={page.label} to={page.path}
                           className="block px-4 py-2 text-xs font-medium text-[#746B6C] hover:text-[#5B1830] hover:bg-[#F4E9ED] uppercase tracking-wider font-body">
                    {page.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu - Logic Preserved */}
      {isOpen && (
        <div ref={mobileMenuRef} className="md:hidden fixed inset-0 top-[56px] bg-white z-40 overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="p-4 space-y-2">
            {mainPages.map((page) => (
              <NavLink key={page.label} to={page.path} onClick={() => setIsOpen(false)}
                       className="block p-3 rounded-lg text-base font-semibold text-[#241A1D] border-b border-[#E8DED8] active:bg-[#FAF7F3] font-body">
                {page.label}
              </NavLink>
            ))}
            <button onClick={() => setMobileCatOpen(!mobileCatOpen)} className="w-full flex justify-between items-center p-3 text-base font-semibold text-[#241A1D] font-body">
              <span>Categories</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileCatOpen && (
              <div className="grid grid-cols-1 gap-1 pl-4 bg-[#FAF7F3] rounded-xl py-2 border border-[#E8DED8]">
                {Object.keys(categories).sort().map(main => (
                  <Link key={main} to={`/category-group/${main.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                        className="p-2.5 text-sm font-medium text-[#746B6C] font-body" onClick={() => setIsOpen(false)}>{main}</Link>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-[#E8DED8] space-y-3">
              {!isAuthenticated && !isVendorAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="p-3 text-center font-semibold bg-[#FAF7F3] border border-[#E8DED8] text-[#241A1D] rounded-xl font-body">Login</Link>
                  <Link to="/register" className="p-3 text-center font-semibold bg-[#5B1830] text-white rounded-xl shadow-xs font-body">Register</Link>
                </div>
              ) : (
                <button onClick={isAuthenticated ? logout : vendorLogout} className="w-full p-3 text-center font-semibold text-[#C43D43] bg-[#FBECEE] rounded-xl font-body">Logout</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
