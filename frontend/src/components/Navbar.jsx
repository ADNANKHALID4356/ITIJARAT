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
  // --- LOGIC SECTION: Preserved exactly as provided ---
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
    <header className="bg-[#0f172a] shadow-lg sticky top-0 z-50 border-b border-gray-800 header-glass-dark">
      {/* Main Navigation - Full Width with consistent padding */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 py-1.5">
          
          {/* Logo on Left */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0 transition-transform hover:scale-105">
            <img
              src="/IT Images/ITLOGO2.png"
              alt="Logo"
              className="h-9 w-auto rounded drop-shadow-md object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </Link>

          {/* Search Bar - Stretched across entire remaining space */}
          <div className="flex-1 mx-2 sm:mx-4 md:mx-6 min-w-0">
            <form onSubmit={handleSearch} className="flex w-full overflow-hidden rounded-md border border-gray-700 focus-within:border-orange-500 transition-all shadow-inner bg-gray-900/50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium products..."
                className="bg-transparent text-white flex-1 px-3 sm:px-4 py-1.5 text-xs sm:text-sm focus:outline-none placeholder-gray-500 min-w-0"
              />
              <button
                type="submit"
                className="shimmer-bg px-4 sm:px-5 py-1.5 transition-all hover:opacity-90 flex-shrink-0"
              >
                <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </form>
          </div>

          {/* Right Side Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-shrink-0">
            {/* Account Info */}
            <div className="flex items-center">
              {isVendorAuthenticated || isAuthenticated ? (
                <div className="flex flex-col items-end mr-3">
                  <span className="text-gray-400 text-[10px] uppercase tracking-widest leading-none">Welcome</span>
                  <span className="text-white text-xs sm:text-sm font-bold truncate max-w-[150px]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {isVendorAuthenticated ? (vendor?.businessName || vendor?.name) : user?.name}
                  </span>
                </div>
              ) : null}

              <div className="relative group">
                <button className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all duration-300 border border-transparent hover:border-gray-700 hover:bg-gray-800 ${!isAuthenticated && !isVendorAuthenticated ? 'shimmer-bg text-white shadow-lg' : 'text-white'}`}>
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-xs sm:text-sm" style={{ fontFamily: 'var(--font-serif)' }}>Account</span>
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden transform group-hover:translate-y-0 translate-y-2">
                  <div className="py-2">
                    {isVendorAuthenticated ? (
                      <>
                        <NavLink to="/vendor/dashboard" className="flex items-center px-4 py-3 text-sm font-bold text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                          Vendor Dashboard
                        </NavLink>
                        <hr className="border-gray-100" />
                        <button onClick={vendorLogout} className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                          Logout
                        </button>
                      </>
                    ) : isAuthenticated ? (
                      <>
                        <NavLink to="/profile" className="flex items-center px-4 py-3 text-sm font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                          My Profile
                        </NavLink>
                        <NavLink to="/orders" className="flex items-center px-4 py-3 text-sm font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                          My Orders
                        </NavLink>
                        <hr className="border-gray-100" />
                        <button onClick={logout} className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <NavLink to="/login" className="flex items-center px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>Login</NavLink>
                        <NavLink to="/register" className="flex items-center px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>Register</NavLink>
                        <div className="bg-green-50 m-2 rounded-lg">
                          <NavLink to="/vendor/login" className="flex items-center px-4 py-3 text-sm font-bold text-green-700 hover:text-green-800" style={{ fontFamily: 'var(--font-serif)' }}>Sell With Us</NavLink>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center space-x-2 text-white hover:text-orange-400 group transition-all">
              <div className="relative">
                <ShoppingCartIcon className="w-7 h-7 transition-transform group-hover:scale-110" />
                {cartStats.totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 shimmer-bg text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg border-2 border-[#0f172a]">
                    {cartStats.totalItems}
                  </span>
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] uppercase tracking-tighter text-gray-400">Your Cart</span>
                <span className="text-xs sm:text-sm font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Checkout</span>
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <Link to="/cart" className="relative text-white">
              <ShoppingCartIcon className="w-6 h-6" />
              {cartStats.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 shimmer-bg text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartStats.totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Full Width with consistent padding & decreased height */}
      <div className="bg-[#1e293b] border-b border-gray-800 shadow-inner">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center h-10 justify-between">
            
            {/* All Categories Dropdown - Placed on the Left */}
            <div className="relative flex-shrink-0" ref={categoriesRef} onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="shimmer-bg flex items-center space-x-1.5 px-3 py-1 rounded text-white text-xs font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-transform" style={{ fontFamily: 'var(--font-serif)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" /></svg>
                <span>Browse All</span>
              </button>

              {catOpen && (
                <div className="absolute left-0 mt-1 w-64 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-visible">
                  <div className="max-h-[70vh] overflow-y-auto py-2 scrollbar-thin">
                    {loadingCategories ? (
                      <div className="p-4 text-center text-xs font-bold text-gray-500 animate-pulse uppercase tracking-widest">Loading...</div>
                    ) : Object.entries(categories).sort().map(([main, subs]) => (
                      <div key={main} className="relative group/item" 
                           onMouseEnter={(e) => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); setHoveredCategory(main); const rect = e.currentTarget.getBoundingClientRect(); setSubmenuPosition(rect.top - e.currentTarget.closest('.overflow-y-auto').getBoundingClientRect().top); }}
                           onMouseLeave={() => { hoverTimeoutRef.current = setTimeout(() => setHoveredCategory(null), 150); }}>
                        <Link to={`/category-group/${main.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`} 
                              className="flex justify-between items-center px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all border-l-4 border-transparent hover:border-orange-500"
                              style={{ fontFamily: 'var(--font-serif)' }} onClick={() => setCatOpen(false)}>
                          <span>{main}</span>
                          {subs.length > 0 && <ChevronDownIcon className="w-4 h-4 -rotate-90 text-gray-300" />}
                        </Link>
                        
                        {/* Submenu */}
                        {hoveredCategory === main && subs.length > 0 && (
                          <div className="absolute left-full top-0 w-64 ml-[1px] bg-white shadow-2xl border border-gray-200 rounded-r-lg overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200"
                               style={{ top: `${submenuPosition}px` }} onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}>
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{main} Collection</div>
                            {subs.sort().map((sub, i) => (
                              <Link key={i} to={`/category-group/${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                                    className="block px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                    style={{ fontFamily: 'var(--font-serif)' }} onClick={() => setCatOpen(false)}>{sub}</Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Links */}
            <div className="flex items-center space-x-1 h-full">
              {mainPages.map((page) => (
                <NavLink
                  key={page.label}
                  to={page.path}
                  className={({ isActive }) => {
                    const isWholesale = page.label === 'Wholesale Dealership';
                    if (isWholesale) return `mx-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-all shimmer-bg text-white shadow-lg border border-white/20 hover:scale-105 active:scale-95`;
                    return `px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center h-full ${isActive ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`;
                  }}
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {page.label}
                </NavLink>
              ))}
            </div>

            {/* Other Pages Dropdown */}
            <div className="relative group flex items-center h-full">
              <button className="flex items-center space-x-1 px-3 py-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest">
                <span>More</span>
                <ChevronDownIcon className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full w-48 bg-[#0f172a] rounded-b-lg shadow-2xl border border-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                {otherPages.map((page) => (
                  <NavLink key={page.label} to={page.path} style={{ fontFamily: 'var(--font-serif)' }}
                           className="block px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-orange-400 hover:bg-white/5 uppercase tracking-widest">
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
                       className="block p-3 rounded-lg text-base font-bold text-gray-800 border-b border-gray-50 active:bg-gray-50"
                       style={{ fontFamily: 'var(--font-serif)' }}>
                {page.label}
              </NavLink>
            ))}
            <button onClick={() => setMobileCatOpen(!mobileCatOpen)} className="w-full flex justify-between items-center p-3 text-base font-bold text-gray-800" style={{ fontFamily: 'var(--font-serif)' }}>
              <span>Categories</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform ${mobileCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileCatOpen && (
              <div className="grid grid-cols-1 gap-1 pl-4 bg-gray-50 rounded-xl py-2">
                {Object.keys(categories).sort().map(main => (
                  <Link key={main} to={`/category-group/${main.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                        className="p-2.5 text-sm font-bold text-gray-600" onClick={() => setIsOpen(false)}>{main}</Link>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {!isAuthenticated && !isVendorAuthenticated ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="p-3 text-center font-bold bg-gray-100 rounded-xl" style={{ fontFamily: 'var(--font-serif)' }}>Login</Link>
                  <Link to="/register" className="p-3 text-center font-bold shimmer-bg text-white rounded-xl" style={{ fontFamily: 'var(--font-serif)' }}>Register</Link>
                </div>
              ) : (
                <button onClick={isAuthenticated ? logout : vendorLogout} className="w-full p-3 text-center font-bold text-red-600 bg-red-50 rounded-xl" style={{ fontFamily: 'var(--font-serif)' }}>Logout</button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
