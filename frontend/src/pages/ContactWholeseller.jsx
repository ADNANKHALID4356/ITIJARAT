import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getImageUrl } from '../config';

const ContactWholeseller = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getApiUrl()}/wholesale/suppliers`);
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wholesale suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Flatten all suppliers from all categories
  const allSuppliers = suppliers.flatMap(category => 
    category.suppliers.map(supplier => ({
      ...supplier,
      categoryName: category.categoryName
    }))
  );

  // Filter suppliers
  const filteredSuppliers = allSuppliers.filter(supplier => {
    const matchesCategory = selectedCategory === 'all' || supplier.categoryName === selectedCategory;
    const matchesSearch = 
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.specialties && supplier.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const allCategories = [...new Set(suppliers.map(cat => cat.categoryName))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex items-center justify-center font-body">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B1830] mx-auto mb-4"></div>
          <p className="text-[#746B6C]">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3] py-6 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#241A1D] mb-1">Wholesale Suppliers</h1>
          <p className="text-sm text-[#746B6C]">Connect with verified wholesale suppliers and distributors</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-2xs border border-[#E8DED8] p-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search suppliers by name or specialty..."
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
                {allCategories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        {filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredSuppliers.map((supplier, index) => (
              <div
                key={index}
                onClick={() => navigate(`/wholesale/${supplier._id}`)}
                className="bg-white border border-[#E8DED8] rounded-xl p-3 hover:shadow-md hover:border-[#B97855]/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Category Badge */}
                  <div className="flex items-center justify-center gap-1 mb-2 bg-[#F4E9ED] rounded-md py-1 px-1.5">
                    <Store className="w-3 h-3 text-[#5B1830]" />
                    <span className="text-[10px] font-semibold text-[#5B1830] uppercase tracking-wide truncate">{supplier.categoryName}</span>
                  </div>

                  {/* Logo */}
                  <div className="flex justify-center mb-3">
                    {supplier.profileImage ? (
                      <img
                        src={getImageUrl('wholesale-suppliers', supplier.profileImage)}
                        alt={supplier.supplierName}
                        className="w-16 h-16 object-contain rounded-lg border border-[#E8DED8]"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={supplier.profileImage ? 'w-16 h-16 bg-gradient-to-br from-[#5B1830] to-[#350A1B] rounded-lg items-center justify-center hidden' : 'w-16 h-16 bg-gradient-to-br from-[#5B1830] to-[#350A1B] rounded-lg flex items-center justify-center'}>
                      <Store className="w-8 h-8 text-[#FAF7F3]" />
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xs sm:text-sm font-semibold text-[#241A1D] text-center line-clamp-2 mb-1 min-h-[2.5rem] leading-tight group-hover:text-[#5B1830] transition-colors">
                    {supplier.supplierName}
                  </h3>
                </div>

                <div className="mt-2 pt-2 border-t border-[#E8DED8]/60 space-y-1">
                  {/* Specialties Count */}
                  {supplier.specialties && supplier.specialties.length > 0 && (
                    <div className="flex justify-center">
                      <span className="text-[10px] px-2 py-0.5 bg-[#FAF7F3] border border-[#E8DED8] text-[#746B6C] rounded-full">
                        {supplier.specialties.length} {supplier.specialties.length === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                  )}

                  {/* Product Images Count */}
                  {supplier.productImages && supplier.productImages.length > 0 && (
                    <div className="text-center">
                      <span className="text-[10px] text-[#B97855] font-medium">
                        {supplier.productImages.length} {supplier.productImages.length === 1 ? 'Image' : 'Images'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-[#E8DED8]">
            <Store className="mx-auto h-12 w-12 text-[#8B8080] mb-3" />
            <h3 className="text-lg font-display font-semibold text-[#241A1D] mb-1">No suppliers found</h3>
            <p className="text-[#746B6C] text-sm">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No wholesale suppliers are currently available.'}
            </p>
          </div>
        )}

        {/* Call-to-Action */}
        <div className="mt-10 bg-[#350A1B] border border-[#B97855]/30 rounded-2xl p-6 sm:p-8 text-center text-white relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">Become a Wholesale Supplier?</h2>
            <p className="text-[#F0E7DF] text-sm mb-5">
              Join our network of verified suppliers and reach thousands of customers worldwide.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-2.5 bg-[#B97855] hover:bg-[#75462F] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              Contact Us to Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactWholeseller;
