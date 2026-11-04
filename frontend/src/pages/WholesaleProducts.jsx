import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Search, Filter, Package, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getImageUrl } from '../config';

const WholesaleProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchWholesaleProducts();
    fetchCategories();
  }, []);

  const fetchWholesaleProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getApiUrl()}/products/wholesale`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching wholesale products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/products/categories`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.category?._id === selectedCategory ||
      product.mainCategory?._id === selectedCategory;
    const matchesSearch = 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.wholesaleContact?.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug || product._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex items-center justify-center font-body">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B1830] mx-auto mb-4"></div>
          <p className="text-[#746B6C]">Loading wholesale products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3] py-6 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F4E9ED] rounded-full mb-3 border border-[#5B1830]/20">
            <Store className="w-8 h-8 text-[#5B1830]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#241A1D] mb-1">Wholesale Products</h1>
          <p className="text-sm text-[#746B6C]">Discover bulk purchase opportunities directly from verified suppliers</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-2xs border border-[#E8DED8] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DED8] rounded-lg focus:ring-1 focus:ring-[#5B1830] focus:border-[#5B1830] bg-[#FCFAF8] text-[#241A1D]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8DED8] rounded-lg focus:ring-1 focus:ring-[#5B1830] focus:border-[#5B1830] appearance-none bg-[#FCFAF8] text-[#241A1D] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.displayName || category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-xs text-[#746B6C]">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E8DED8]">
            <Package className="w-16 h-16 text-[#8B8080] mx-auto mb-3" />
            <h3 className="text-lg font-display font-semibold text-[#241A1D] mb-1">No products found</h3>
            <p className="text-sm text-[#746B6C]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-xl shadow-2xs border border-[#E8DED8] hover:shadow-md hover:border-[#B97855]/50 transition-all duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between"
              >
                {/* Product Image */}
                <div className="aspect-square relative overflow-hidden bg-[#FAF7F3]">
                  <img
                    src={getImageUrl('products', product.image)}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-[#5B1830] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category Badge */}
                    {product.category && (
                      <div className="mb-1.5">
                        <span className="inline-block px-2 py-0.5 bg-[#F4E9ED] text-[#5B1830] text-[10px] font-medium rounded-md border border-[#5B1830]/20">
                          {product.category.displayName || product.category.name}
                        </span>
                      </div>
                    )}

                    {/* Product Title */}
                    <h3 className="font-semibold text-xs sm:text-sm text-[#241A1D] mb-1.5 line-clamp-2 group-hover:text-[#5B1830] transition-colors leading-snug">
                      {product.title}
                    </h3>

                    {/* Supplier Info */}
                    {product.wholesaleContact?.supplierName && (
                      <div className="flex items-center gap-1 text-[11px] text-[#746B6C] mb-2">
                        <Store className="w-3 h-3 text-[#B97855]" />
                        <span className="truncate">{product.wholesaleContact.supplierName}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="mt-2 pt-2 border-t border-[#E8DED8]/60">
                    <div className="mb-2">
                      {product.wholesalePricing && product.wholesalePricing.length > 0 ? (
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-[#5B1830]">
                            ₨{product.wholesalePricing[0].pricePerUnit.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#8B8080] block">
                            Min: {product.wholesalePricing[0].minQuantity} units
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm font-bold text-[#5B1830]">
                          ₨{product.price.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Quick Contact */}
                    {product.wholesaleContact?.whatsappNumber && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://wa.me/${product.wholesaleContact.whatsappNumber}`, '_blank');
                        }}
                        className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-medium py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesaleProducts;
