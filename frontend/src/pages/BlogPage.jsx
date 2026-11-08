import { useState, useEffect, useMemo, useCallback } from "react";

// Mock blog data
const mockBlogPosts = [
  {
    id: "1",
    title: "The Art of Swat Valley Woodwork: Century-Old Craftsmanship",
    excerpt: "Explore the intricate geometric carving traditions of Swati artisans, where cedar and walnut woods are shaped into timeless architectural heirlooms.",
    author: {
      name: "Sarah Ahmed",
      role: "Heritage Curator"
    },
    category: "Heritage Crafts",
    tags: ["Woodwork", "Swat Valley", "Artisans"],
    publishDate: "2024-06-10",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80",
    featured: true,
    views: 12547
  },
  {
    id: "2",
    title: "Building Trust in Global E-commerce: Security Best Practices",
    excerpt: "Learn how International Tijarat maintains the highest security standards to protect customer data and ensure safe cross-border transactions.",
    author: {
      name: "Michael Chen",
      role: "CTO"
    },
    category: "Security",
    tags: ["Security", "Trust", "Data Protection"],
    publishDate: "2024-06-08",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&q=80",
    featured: false,
    views: 8934
  },
  {
    id: "3",
    title: "Sustainable Packaging: Honoring the Earth While Delivering Luxury",
    excerpt: "Discover our eco-conscious packaging initiative utilizing biodegradable jute and recycled paper, reducing carbon footprints without sacrificing elegance.",
    author: {
      name: "Fatima Khan",
      role: "Head of Operations"
    },
    category: "Sustainability",
    tags: ["Sustainability", "Environment", "Green Packaging"],
    publishDate: "2024-06-05",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&q=80",
    featured: true,
    views: 15673
  },
  {
    id: "4",
    title: "International Shipping Made Simple: A Complete Guide",
    excerpt: "Navigate the complexities of international courier logistics, duty calculations, and transparent tracking with our global delivery framework.",
    author: {
      name: "David Rodriguez",
      role: "Head of Logistics"
    },
    category: "Shipping Guide",
    tags: ["Shipping", "International", "Logistics"],
    publishDate: "2024-06-03",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80",
    featured: false,
    views: 9876
  },
  {
    id: "5",
    title: "Gemstones and Marble Art of Pakistan: From Mine to Masterpiece",
    excerpt: "An insider look into our rigorous curation process for onyx vessels, lapis carvings, and natural mineral home decor crafted in northern Pakistan.",
    author: {
      name: "Sarah Ahmed",
      role: "Heritage Curator"
    },
    category: "Quality Assurance",
    tags: ["Onyx", "Gemstones", "Authenticity"],
    publishDate: "2024-06-01",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80",
    featured: false,
    views: 11234
  },
  {
    id: "6",
    title: "Mobile Commerce Revolution: The Modern Heritage Experience",
    excerpt: "Explore how responsive, minimal e-commerce design bridges international consumers with authentic regional artisan workshops seamlessly.",
    author: {
      name: "Michael Chen",
      role: "CTO"
    },
    category: "Technology",
    tags: ["Mobile Commerce", "Technology", "User Experience"],
    publishDate: "2024-05-28",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&q=80",
    featured: false,
    views: 7654
  }
];

const categories = [
  "All Categories",
  "Heritage Crafts",
  "Technology",
  "Security",
  "Sustainability",
  "Shipping Guide",
  "Quality Assurance"
];

// Icons
const SearchIcon = () => (
  <svg className="w-4 h-4 text-[#8B8080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#8B8080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#8B8080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// Blog Card Component
const BlogCard = ({ post, featured = false }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (featured) {
    return (
      <article className="bg-white border border-[#E8DED8] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#D8C9C0] transition-all duration-300 mb-10 group">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="aspect-video md:h-full min-h-[260px] bg-[#FAF7F3] overflow-hidden relative">
              {!imageError ? (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FAF7F3]">
                  <div className="w-16 h-16 bg-[#E8DED8] rounded-xl animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#746B6C] mb-3 font-body">
                <span className="bg-[#F4E9ED] text-[#5B1830] border border-[#5B1830]/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {post.category}
                </span>
                <div className="flex items-center gap-1.5 text-[#8B8080]">
                  <CalendarIcon />
                  {formatDate(post.publishDate)}
                </div>
                <div className="flex items-center gap-1.5 text-[#8B8080]">
                  <ClockIcon />
                  {post.readTime}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#241A1D] mb-3 group-hover:text-[#5B1830] transition-colors leading-tight cursor-pointer">
                {post.title}
              </h2>
              <p className="text-[#746B6C] text-sm sm:text-base mb-6 leading-relaxed font-body">
                {post.excerpt}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[#E8DED8]">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-[#F4E9ED] border border-[#5B1830]/20 rounded-full flex items-center justify-center mr-3 text-[#5B1830] font-bold text-xs">
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-[#241A1D] text-sm font-body">{post.author.name}</div>
                  <div className="text-[#8B8080] text-xs font-body">{post.author.role}</div>
                </div>
              </div>
              <button className="text-[#5B1830] hover:text-[#350A1B] font-semibold text-sm flex items-center gap-1.5 transition-colors font-body cursor-pointer">
                <span>Read Story</span> <ArrowRightIcon />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white border border-[#E8DED8] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-[#D8C9C0] transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="aspect-video bg-[#FAF7F3] overflow-hidden relative">
          {!imageError ? (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FAF7F3]">
              <div className="w-12 h-12 bg-[#E8DED8] rounded-xl animate-pulse"></div>
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 text-xs text-[#8B8080] mb-3 font-body">
            <span className="bg-[#FCFAF8] text-[#5B1830] border border-[#E8DED8] px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider">
              {post.category}
            </span>
            <div className="flex items-center gap-1">
              <CalendarIcon />
              {formatDate(post.publishDate)}
            </div>
          </div>
          <h3 className="text-xl font-bold font-display text-[#241A1D] mb-2 group-hover:text-[#5B1830] transition-colors line-clamp-2 leading-snug cursor-pointer">
            {post.title}
          </h3>
          <p className="text-[#746B6C] text-sm mb-4 line-clamp-3 leading-relaxed font-body">
            {post.excerpt}
          </p>
        </div>
      </div>
      
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-[#E8DED8] flex items-center justify-between text-xs text-[#8B8080] font-body">
        <div className="flex items-center gap-1">
          <ClockIcon />
          <span>{post.readTime}</span>
        </div>
        <button className="text-[#5B1830] hover:text-[#350A1B] font-semibold text-xs sm:text-sm flex items-center gap-1 transition-colors cursor-pointer">
          Read Story <ArrowRightIcon />
        </button>
      </div>
    </article>
  );
};

// Main Blog Page
const BlogPage = () => {
  const [posts] = useState(mockBlogPosts);
  const [filteredPosts, setFilteredPosts] = useState(mockBlogPosts);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const postsPerPage = 6;

  // Filter posts
  useEffect(() => {
    let filtered = posts;

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, posts]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage]);

  const featuredPost = useMemo(() => {
    return posts.find(post => post.featured);
  }, [posts]);

  const regularPosts = useMemo(() => {
    return paginatedPosts.filter(post => !post.featured || currentPage > 1);
  }, [paginatedPosts, currentPage]);

  return (
    <div className="min-h-screen bg-[#FAF7F3] font-body text-[#241A1D]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8DED8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest font-semibold text-[#B97855] font-body mb-2 block">
              Editorial & Stories
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-[#241A1D] mb-4 tracking-tight">
              Marketplace <span className="text-[#5B1830]">Chronicles</span>
            </h1>
            <p className="text-base sm:text-lg text-[#746B6C] max-w-2xl mx-auto font-light leading-relaxed">
              Discover stories of authentic Pakistani craftsmanship, global logistics insights, and modern e-commerce trends.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-[#FCFAF8] border-b border-[#E8DED8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search articles & crafts..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-2 border border-[#E8DED8] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5B1830] focus:border-[#5B1830] text-[#241A1D] placeholder-[#8B8080] transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-[#5B1830] text-white shadow-xs border border-[#5B1830]'
                      : 'bg-white text-[#746B6C] border border-[#E8DED8] hover:bg-[#F4E9ED] hover:text-[#5B1830] hover:border-[#5B1830]/30'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-3 text-xs text-[#8B8080] font-medium">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            {selectedCategory !== "All Categories" && (
              <span className="text-[#5B1830] font-semibold"> in {selectedCategory}</span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DED8] p-8 max-w-xl mx-auto shadow-2xs">
            <div className="w-16 h-16 mx-auto mb-5 bg-[#F4E9ED] border border-[#5B1830]/20 rounded-2xl flex items-center justify-center text-[#5B1830]">
              <SearchIcon />
            </div>
            <h3 className="text-2xl font-bold font-display text-[#241A1D] mb-2">No Articles Found</h3>
            <p className="text-[#746B6C] text-sm mb-6 max-w-md mx-auto">
              {searchQuery ? `No articles match "${searchQuery}". Try searching for different craftsmanship or commerce keywords.` : 
               selectedCategory !== "All Categories" ? `No articles currently available in ${selectedCategory}.` :
               "No stories available at this time."}
            </p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="bg-[#5B1830] hover:bg-[#350A1B] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-xs cursor-pointer"
            >
              View All Articles
            </button>
          </div>
        ) : (
          <>
            {/* Featured Post (only on page 1 and no search query) */}
            {featuredPost && currentPage === 1 && !searchQuery && selectedCategory === "All Categories" && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#B97855]"></span>
                  <h2 className="text-xs uppercase tracking-widest font-bold text-[#75462F]">
                    Featured Editorial
                  </h2>
                </div>
                <BlogCard post={featuredPost} featured={true} />
              </div>
            )}

            {/* Regular Posts Grid */}
            {regularPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#241A1D]">
                    {currentPage === 1 && featuredPost && !searchQuery ? "Latest Stories" : "Articles"}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {regularPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#E8DED8]">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-[#746B6C] hover:text-[#241A1D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#5B1830] text-white shadow-xs'
                        : 'text-[#746B6C] bg-white border border-[#E8DED8] hover:bg-[#F4E9ED] hover:text-[#5B1830]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-[#746B6C] hover:text-[#241A1D] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-[#350A1B] text-white border-t border-[#4A1526]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-[#B97855] block mb-2 font-body">
            Stay Connected
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-3">
            Subscribe to Marketplace Chronicles
          </h2>
          <p className="text-sm sm:text-base text-[#FAF7F3] mb-8 max-w-xl mx-auto font-light leading-relaxed">
            Receive curated artisan stories, regional craft spotlights, and platform releases directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-[#5B1830] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B97855] focus:border-transparent bg-[#270713] text-white placeholder-[#D8C9C0] text-sm font-body"
            />
            <button className="bg-[#B97855] hover:bg-[#75462F] text-white px-7 py-3 rounded-xl font-medium transition-colors shadow-sm text-sm font-body cursor-pointer flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
