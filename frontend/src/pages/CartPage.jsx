import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { getImageUrl, config } from "../config";

const CartPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const navigate = useNavigate();
  
  // Use cart and auth contexts
  const { 
    cartItems, 
    cartStats, 
    removeFromCart: removeFromCartContext, 
    updateQuantity: updateQuantityContext, 
    clearCart: clearCartContext 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { showError } = useNotification();

  // All hooks must be defined before any conditional logic
  const removeItem = useCallback((productId) => {
    setUpdatingItemId(productId);
    setTimeout(() => {
      removeFromCartContext(productId);
      setUpdatingItemId(null);
    }, 300);
  }, [removeFromCartContext]);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    
    // Find the cart item to get stock information
    const cartItem = cartItems.find(item => {
      const itemId = item.productData?._id || item._id;
      return itemId === productId;
    });
    
    if (!cartItem) return;
    
    // Get stock information for validation
    const availableStock = cartItem.productData?.stock || cartItem.stock;
    
    // Check if we're trying to set quantity beyond available stock
    if (availableStock !== undefined && newQuantity > availableStock) {
      showError(
        `Cannot add more items. Only ${availableStock} items available in stock.`
      );
      return;
    }
    
    setUpdatingItemId(productId);
    
    try {
      await updateQuantityContext(productId, newQuantity);
      setUpdatingItemId(null);
    } catch (error) {
      setUpdatingItemId(null);
      // Handle backend stock validation errors
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError('Failed to update quantity. Please try again.');
      }
    }
  }, [updateQuantityContext, removeItem, cartItems, showError]);

  const clearCart = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCartContext();
    }
  }, [clearCartContext]);

  const { subtotal, totalItems, shipping, total } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.productData?.price || item.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate shipping - find maximum shipping cost among all products
    let shipping = 0;
    if (cartItems.length > 0) {
      console.log('CartPage: Cart items for shipping calculation:', cartItems);
      const shippingCosts = cartItems.map(item => {
        const productShipping = item.productData?.shipping || item.shipping || 0;
        console.log('CartPage: Item shipping data:', {
          itemId: item._id,
          hasProductData: !!item.productData,
          productData: item.productData,
          productDataShipping: item.productData?.shipping,
          itemShipping: item.shipping,
          finalShipping: productShipping
        });
        return parseFloat(productShipping) || 0;
      });
      console.log('CartPage: All shipping costs:', shippingCosts);
      shipping = Math.max(...shippingCosts, 0);
      console.log('CartPage: Maximum shipping cost:', shipping);
    }
    
    // Apply free shipping rule for orders >= $10,000
    if (subtotal >= 10000) {
      shipping = 0;
    }
    
    const total = subtotal + shipping;
    
    return { subtotal, totalItems, shipping, total };
  }, [cartItems]);

  // Update document title
  useEffect(() => {
    document.title = cartStats.totalItems > 0 
      ? `Shopping Cart (${cartStats.totalItems}) - International Tijarat`
      : 'Shopping Cart - International Tijarat';
  }, [cartStats.totalItems]);

  // Icons
  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  const MinusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );

  // Show login requirement if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F3]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E8DED8] shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#241A1D]">Shopping Cart</h1>
          </div>
        </div>

        {/* Login Required Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-2xl shadow-xs border border-[#E8DED8] p-8 sm:p-12 text-center">
            {/* Brand Icon Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-[#F4E9ED] border border-[#B97855]/30 rounded-full flex items-center justify-center shadow-xs">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#5B1830]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#241A1D] mb-3">Sign in to see your cart</h2>
            <p className="text-base sm:text-lg text-[#746B6C] font-body mb-8 max-w-md mx-auto leading-relaxed">
              Your shopping cart is waiting! Sign in to view your items, access saved selections, and complete your purchase.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#5B1830] hover:bg-[#350A1B] text-white px-8 py-3.5 rounded-lg transition-all duration-200 font-semibold font-body text-base shadow-xs hover:shadow-md cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-[#241A1D] hover:text-[#5B1830] border border-[#D8C9C0] hover:border-[#5B1830] px-8 py-3.5 rounded-lg hover:bg-[#F4E9ED]/50 transition-all duration-200 font-semibold font-body text-base cursor-pointer"
              >
                Create Account
              </button>
            </div>
            
            {/* Continue Shopping Link */}
            <div className="border-t border-[#E8DED8] pt-6">
              <Link 
                to="/" 
                className="inline-flex items-center text-[#5B1830] hover:text-[#350A1B] font-semibold text-base font-body transition-colors gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Trust Features Section */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl shadow-2xs border border-[#E8DED8] p-6 text-center hover:border-[#B97855]/40 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#F4E9ED] border border-[#B97855]/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5B1830]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#241A1D] mb-1 font-body">Secure Shopping</h3>
              <p className="text-xs sm:text-sm text-[#746B6C] font-body">Protected with industry-standard TLS encryption</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-2xs border border-[#E8DED8] p-6 text-center hover:border-[#B97855]/40 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#EAF4EF] border border-[#23845B]/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#23845B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#241A1D] mb-1 font-body">Verified Authentic</h3>
              <p className="text-xs sm:text-sm text-[#746B6C] font-body">Authentic products with hassle-free returns</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-2xs border border-[#E8DED8] p-6 text-center hover:border-[#B97855]/40 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#F4E9ED] border border-[#B97855]/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#B97855]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 3M7 13l2.5 3m9.5-3v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#241A1D] mb-1 font-body">Persistent Cart</h3>
              <p className="text-xs sm:text-sm text-[#746B6C] font-body">Your saved cart syncs seamlessly across devices</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart Component
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F3]">
        {/* Header Section */}
        <div className="bg-white border-b border-[#E8DED8] shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#241A1D]">Shopping Cart</h1>
          </div>
        </div>

        {/* Empty Cart Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-2xl shadow-xs border border-[#E8DED8] p-8 sm:p-12 text-center">
            {/* Elegant Cart Icon Circle */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-[#F4E9ED] border border-[#B97855]/30 rounded-full flex items-center justify-center shadow-xs">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#5B1830]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 3M7 13l2.5 3m9.5-3v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#241A1D] mb-3">Your cart is empty</h2>
            <p className="text-base sm:text-lg text-[#746B6C] font-body mb-8 max-w-md mx-auto leading-relaxed">
              Start adding items to your cart to see them here. Discover authentic craftsmanship, fine fragrances, and everyday essentials!
            </p>
            
            {/* Action Button */}
            <button 
              onClick={() => navigate('/products')}
              className="bg-[#5B1830] hover:bg-[#350A1B] text-white px-8 py-3.5 rounded-lg transition-all duration-200 font-semibold font-body text-base sm:text-lg shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <span>Start Shopping</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            {/* Popular Categories */}
            <div className="mt-10 pt-8 border-t border-[#E8DED8]">
              <h3 className="text-xs sm:text-sm font-semibold text-[#8B8080] uppercase tracking-wider mb-4 font-body">Popular Categories</h3>
              <div className="flex flex-wrap justify-center gap-2.5">
                {['Electronics', 'Fashion & Style', 'Beauty & Cosmetic', 'Furniture', 'Groceries'].map((category) => (
                  <button
                    key={category}
                    onClick={() => navigate(`/category-group/${category.toLowerCase().replace(' & ', '-').replace(' ', '-')}`)}
                    className="bg-[#FAF7F3] hover:bg-[#F4E9ED] text-[#241A1D] hover:text-[#5B1830] border border-[#E8DED8] hover:border-[#B97855]/50 px-4 py-2 rounded-full text-xs sm:text-sm font-medium font-body transition-all duration-200 cursor-pointer shadow-2xs"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart Item Component
  const CartItem = ({ item }) => {
    const productId = item.productData?._id || item._id;
    const isUpdating = updatingItemId === productId;
    const [imageError, setImageError] = useState(false);

    // Handle both backend cart structure and legacy structure
    const title = item.productData?.title || item.title;
    const price = item.productData?.price || item.price;
    const image = item.productData?.image || item.image;
    const currency = item.productData?.currency || item.currency || 'USD';
    
    // Use consistent getImageUrl approach like other working components
    const imageUrl = getImageUrl('products', image);

    return (
      <div className="p-5 sm:p-6 hover:bg-[#FCFAF8] transition-colors">
        <div className="flex gap-4 sm:gap-5">
          {/* Product Image */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FAF7F3] border border-[#E8DED8] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            {!imageError ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF7F3] text-[#8B8080]">
                <svg className="w-6 h-6 mb-1 text-[#8B8080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-body">No image</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="text-base sm:text-lg font-semibold text-[#241A1D] hover:text-[#5B1830] transition-colors line-clamp-2 pr-4 font-body leading-snug">
                {title}
              </h3>
              <button
                onClick={() => removeItem(productId)}
                disabled={isUpdating}
                className="text-[#8B8080] hover:text-[#C43D43] p-1.5 rounded-md hover:bg-[#FBECEE] transition-colors flex-shrink-0 cursor-pointer"
                title="Remove item"
                aria-label="Remove item"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-[#D8C9C0] border-t-[#5B1830] rounded-full animate-spin"></div>
                ) : (
                  <TrashIcon />
                )}
              </button>
            </div>

            {/* Brand and Category Metadata */}
            <div className="text-xs sm:text-sm text-[#746B6C] mb-2.5 font-body flex flex-wrap items-center gap-1.5">
              {item.brand && <span className="font-medium text-[#241A1D]">{item.brand}</span>}
              {item.brand && item.category && <span className="text-[#8B8080]">•</span>}
              {item.category && <span>{item.category}</span>}
              {item.selectedSize && (
                <>
                  {(item.brand || item.category) && <span className="text-[#8B8080]">•</span>}
                  <span className="bg-[#F4E9ED] text-[#5B1830] border border-[#B97855]/20 px-2 py-0.5 rounded text-xs font-semibold">
                    Size: {item.selectedSize}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status Badge */}
            <div className="mb-3">
              {item.inStock !== false ? (
                <span className="inline-flex items-center text-xs font-semibold text-[#23845B] bg-[#EAF4EF] border border-[#23845B]/20 px-2 py-0.5 rounded-full font-body">
                  ● In Stock
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-semibold text-[#C43D43] bg-[#FBECEE] border border-[#C43D43]/20 px-2 py-0.5 rounded-full font-body">
                  ● Out of Stock
                </span>
              )}
            </div>

            {/* Price and Quantity Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-bold text-[#5B1830] font-body">
                  PKR {(price * item.quantity).toFixed(2)}
                </span>
                {item.originalPrice && item.originalPrice > price && (
                  <span className="text-xs sm:text-sm text-[#8B8080] line-through font-body">
                    PKR {(item.originalPrice * item.quantity).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#D8C9C0] rounded-lg bg-[#FAF7F3] overflow-hidden shadow-2xs">
                <button
                  onClick={() => updateQuantity(productId, item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="p-2 text-[#241A1D] hover:bg-[#E8DED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon />
                </button>
                <span className="px-3 sm:px-4 py-1 font-bold text-[#241A1D] min-w-[2.5rem] sm:min-w-[3rem] text-center bg-white text-xs sm:text-sm font-body border-x border-[#D8C9C0]">
                  {isUpdating ? '...' : item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(productId, item.quantity + 1)}
                  disabled={isUpdating}
                  className="p-2 text-[#241A1D] hover:bg-[#E8DED8] transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <PlusIcon />
                </button>
              </div>
            </div>

            {/* Free Shipping Tag */}
            {item.freeShipping && (
              <div className="text-xs text-[#23845B] font-semibold flex items-center gap-1 mt-2.5 font-body">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Eligible for Free Shipping
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      {/* Brand Header */}
      <div className="bg-white border-b border-[#E8DED8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#241A1D]">Shopping Cart</h1>
              <p className="text-sm text-[#746B6C] font-body mt-1">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={clearCart}
                className="text-xs sm:text-sm text-[#746B6C] hover:text-[#C43D43] font-medium border border-[#E8DED8] hover:border-[#C43D43]/40 px-4 py-2 rounded-lg hover:bg-[#FBECEE]/40 transition-colors cursor-pointer font-body"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('/products')}
                className="text-xs sm:text-sm bg-[#F4E9ED] hover:bg-[#5B1830] text-[#5B1830] hover:text-white border border-[#B97855]/30 px-4 py-2 rounded-lg font-semibold font-body transition-all duration-200 cursor-pointer shadow-2xs"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Cart Items Column */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-[#E8DED8] shadow-xs mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E8DED8] flex items-center justify-between bg-[#FAF7F3]/60">
                <h2 className="text-base sm:text-lg font-semibold text-[#241A1D] font-display">Items in your cart</h2>
                <button
                  onClick={clearCart}
                  className="text-xs sm:text-sm text-[#746B6C] hover:text-[#C43D43] font-medium font-body transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="divide-y divide-[#E8DED8]">
                {cartItems.map((item) => (
                  <CartItem key={item.productData?._id || item._id} item={item} />
                ))}
              </div>
            </div>

            {/* Mobile / Inline Continue Shopping */}
            <div className="flex items-center justify-between pt-1 pb-4">
              <button
                onClick={() => navigate('/products')}
                className="text-[#5B1830] hover:text-[#350A1B] font-semibold text-sm inline-flex items-center gap-2 font-body transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue shopping
              </button>
              
              <button
                onClick={clearCart}
                className="sm:hidden text-xs text-[#746B6C] hover:text-[#C43D43] font-medium cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-2xl border border-[#E8DED8] p-6 shadow-xs sticky top-24">
              <h2 className="text-lg font-bold text-[#241A1D] font-display pb-3 border-b border-[#E8DED8]">Order Summary</h2>
              
              <div className="space-y-3.5 pt-4">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-[#746B6C]">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-[#241A1D]">PKR {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm font-body">
                  <span className="text-[#746B6C]">Shipping</span>
                  <div className="text-right">
                    <span className="font-semibold text-[#241A1D]">
                      {shipping > 0 ? `PKR ${shipping.toFixed(2)}` : 'Free'}
                    </span>
                    {subtotal >= 10000 && (
                      <span className="text-[#23845B] text-xs font-semibold block mt-0.5">Free shipping applied!</span>
                    )}
                  </div>
                </div>
                
                {/* Shipping Free Progress Hint */}
                {shipping > 0 && subtotal < 10000 && (
                  <div className="bg-[#EAF4EF] border border-[#23845B]/20 rounded-lg p-2.5 text-xs text-[#23845B] font-body mt-2">
                    <p className="font-semibold">Add PKR {(10000 - subtotal).toFixed(2)} more for FREE shipping!</p>
                  </div>
                )}
                
                <div className="border-t border-[#E8DED8] pt-3.5 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-[#241A1D] font-body">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#5B1830] font-body">
                      PKR {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <button
                onClick={() => navigate('/checkout')}
                disabled={isLoading}
                className="w-full mt-6 bg-[#5B1830] hover:bg-[#350A1B] text-white py-3.5 px-4 rounded-lg font-bold font-body text-base transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>

              {/* Trust & Security Badges */}
              <div className="mt-6 pt-5 border-t border-[#E8DED8] flex items-center justify-center gap-5 text-xs text-[#746B6C] font-body">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#23845B]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#23845B]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Buyer Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
