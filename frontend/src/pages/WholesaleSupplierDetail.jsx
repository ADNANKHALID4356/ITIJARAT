import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Store, 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Package, 
  Clock,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getImageUrl } from '../config';
import LazyImage from '../components/LazyImage';

const WholesaleSupplierDetail = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    fetchSupplierDetail();
  }, [supplierId]);

  const fetchSupplierDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getApiUrl()}/wholesale/supplier/${supplierId}`);
      if (response.data.success) {
        setSupplier(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching supplier details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hi ${supplier.supplierName},\n\nI'm interested in your wholesale products.\n\nPlease share details about:\n- Product catalog\n- Pricing\n- Minimum order quantity\n- Delivery terms\n\nThank you!`
    );
    window.open(`https://wa.me/${supplier.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % supplier.productImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + supplier.productImages.length) % supplier.productImages.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, supplier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex items-center justify-center font-body">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B1830] mx-auto mb-4"></div>
          <p className="text-[#746B6C]">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-[#FAF7F3] flex items-center justify-center font-body">
        <div className="text-center bg-white border border-[#E8DED8] rounded-2xl p-8 max-w-md mx-auto shadow-sm">
          <Store className="mx-auto h-16 w-16 text-[#8B8080] mb-4" />
          <h2 className="text-2xl font-display font-bold text-[#241A1D] mb-2">Supplier Not Found</h2>
          <p className="text-[#746B6C] mb-6 text-sm">The supplier you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/contact-wholeseller')}
            className="px-6 py-2.5 bg-[#5B1830] text-white rounded-lg hover:bg-[#350A1B] transition-colors font-medium text-sm"
          >
            Back to Suppliers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F3] py-6 font-body">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/contact-wholeseller')}
          className="flex items-center gap-2 text-[#746B6C] hover:text-[#5B1830] mb-4 text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Suppliers</span>
        </button>

        {/* Supplier Info Card */}
        <div className="bg-white rounded-2xl shadow-2xs border border-[#E8DED8] p-5 sm:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Logo & Basic Info */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-3">
                {supplier.profileImage ? (
                  <img
                    src={getImageUrl('wholesale-suppliers', supplier.profileImage)}
                    alt={supplier.supplierName}
                    className="w-24 h-24 object-contain rounded-xl border border-[#E8DED8]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={supplier.profileImage ? 'w-24 h-24 bg-gradient-to-br from-[#5B1830] to-[#350A1B] rounded-xl flex items-center justify-center hidden' : 'w-24 h-24 bg-gradient-to-br from-[#5B1830] to-[#350A1B] rounded-xl flex items-center justify-center'}>
                  <Store className="w-12 h-12 text-[#FAF7F3]" />
                </div>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#241A1D] mb-2">{supplier.supplierName}</h1>
              
              {supplier.specialties && supplier.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mb-3">
                  {supplier.specialties.map((specialty, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-[#F4E9ED] text-[#5B1830] text-xs rounded-full border border-[#5B1830]/20 font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Middle: Details */}
            <div className="space-y-3 text-sm flex flex-col justify-center">
              {supplier.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#8B8080] mt-0.5 flex-shrink-0" />
                  <span className="text-[#241A1D]">{supplier.address}</span>
                </div>
              )}
              {supplier.minimumOrderQuantity && (
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#8B8080]" />
                  <span className="text-[#241A1D]">Min Order: {supplier.minimumOrderQuantity}</span>
                </div>
              )}
              {supplier.businessHours && (
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#8B8080]" />
                  <span className="text-[#241A1D]">{supplier.businessHours}</span>
                </div>
              )}
              {supplier.deliveryAreas && supplier.deliveryAreas.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#8B8080] mt-0.5 flex-shrink-0" />
                  <span className="text-[#241A1D]">Delivery: {supplier.deliveryAreas.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Right: Contact Buttons */}
            <div className="space-y-2.5 flex flex-col justify-center">
              <button
                onClick={handleWhatsAppContact}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${supplier.contactNumber}`}
                  className="bg-[#5B1830] hover:bg-[#350A1B] text-white py-2 px-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors text-sm shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>
                
                {supplier.email && (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="bg-[#B97855] hover:bg-[#75462F] text-white py-2 px-3 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors text-sm shadow-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description/Notes Section */}
        {supplier.description && (
          <div className="bg-white rounded-2xl shadow-2xs border border-[#E8DED8] p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-display font-bold text-[#241A1D] mb-2">About Supplier</h2>
            <p className="text-[#746B6C] text-sm leading-relaxed whitespace-pre-line">{supplier.description}</p>
          </div>
        )}

        {/* Product Gallery */}
        {supplier.productImages && supplier.productImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xs border border-[#E8DED8] p-5 sm:p-6">
            <h2 className="text-lg font-display font-bold text-[#241A1D] mb-4">Product Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {supplier.productImages.map((image, idx) => {
                const optimizedForLazy = image.optimized ? {
                  avif: {
                    '300w': getImageUrl('wholesale-suppliers', image.optimized.avif_300),
                    '600w': getImageUrl('wholesale-suppliers', image.optimized.avif_600)
                  },
                  webp: {
                    '300w': getImageUrl('wholesale-suppliers', image.optimized.webp_300),
                    '600w': getImageUrl('wholesale-suppliers', image.optimized.webp_600)
                  }
                } : null;

                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer border border-[#E8DED8] hover:border-[#B97855]/60 hover:shadow-md transition-all bg-[#FAF7F3]"
                    onClick={() => openLightbox(idx)}
                  >
                    <LazyImage
                      src={getImageUrl('wholesale-suppliers', image.filename)}
                      alt={image.altText || `Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                      optimizedImage={optimizedForLazy}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && supplier.productImages && supplier.productImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          {supplier.productImages.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 cursor-pointer"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh] px-8 sm:px-16 flex items-center justify-center">
            <picture>
              <source
                srcSet={getImageUrl('wholesale-suppliers', supplier.productImages[lightboxIndex]?.optimized?.avif_600)}
                type="image/avif"
              />
              <source
                srcSet={getImageUrl('wholesale-suppliers', supplier.productImages[lightboxIndex]?.optimized?.webp_600)}
                type="image/webp"
              />
              <img
                src={getImageUrl('wholesale-suppliers', supplier.productImages[lightboxIndex]?.optimized?.jpg_600 || supplier.productImages[lightboxIndex]?.filename)}
                alt={supplier.productImages[lightboxIndex]?.altText || `Product ${lightboxIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            </picture>
          </div>

          {/* Next Button */}
          {supplier.productImages.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 cursor-pointer"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-body">
            {lightboxIndex + 1} / {supplier.productImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default WholesaleSupplierDetail;
