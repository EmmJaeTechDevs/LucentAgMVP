import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Trash2, Minus, Plus, ShoppingCart, Heart, Search, User, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useCart } from "@/hooks/useCart";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";
import lucentLogo from "@assets/image 20_1759571692580.png";
import PlaceholderImage from "@assets/stock_images/agricultural_plant_c_660884ee.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Cart() {
  const [, setLocation] = useLocation();
  useSessionValidation("buyer");

  const { cartItems, updateQuantity, removeItem, clearCart, isLoading, fetchCartItems, cartCount } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [relatedCrops, setRelatedCrops] = useState<any[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCartItems();
    fetchRelatedCrops();
  }, []);

  const getBuyerToken = () => {
    try {
      const buyerSession = sessionStorage.getItem("buyerSession");
      if (!buyerSession) return null;
      const encryptedSessionData = JSON.parse(buyerSession);
      const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
      const now = new Date().getTime();
      if (sessionData.token && now < sessionData.expiry) {
        return sessionData.token;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving buyer token:', error);
      return null;
    }
  };

  const fetchRelatedCrops = async () => {
    try {
      const token = getBuyerToken();
      if (!token) return;

      const response = await fetch(`${BaseUrl}/api/buyer/crops/available`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRelatedCrops(data.crops || []);
      }
    } catch (error) {
      console.error("Error fetching related crops:", error);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const mapCropToProduct = (crop: any) => {
    const plantName = crop.plant?.name || crop.plantId?.replace('plant-', '').replace('-', ' ') || 'Unknown Crop';
    const plantImage = crop.plant?.imageUrl || PlaceholderImage;
    return {
      id: crop.id,
      name: plantName,
      farm: crop.farmerName || crop.farmer?.name || "Local Farm",
      price: `₦${crop.pricePerUnit?.toLocaleString() || '0'}`,
      unit: `per ${crop.unit || 'Unit'}`,
      image: plantImage,
    };
  };

  const relatedProducts = relatedCrops.map(mapCropToProduct);

  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = 0;

  const handleUpdateQuantity = async (item: any, change: number) => {
    const newQuantity = Math.max(1, item.quantity + change);
    await updateQuantity(item.id, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
    setIsDialogOpen(false);
  };

  const scrollRelated = (direction: 'left' | 'right') => {
    if (relatedScrollRef.current) {
      const scrollAmount = 200;
      relatedScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/buyer-home?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/buyer-home">
            <ArrowLeft className="w-6 h-6 text-gray-700" data-testid="button-back" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Cart</h1>
        </div>
        <HamburgerMenu userType="buyer" />
      </div>

      {/* Desktop Header */}
      <header className="hidden md:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/buyer-home">
              <img src={lucentLogo} alt="Lucent Ag" className="h-8 cursor-pointer" />
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
              <div className="relative flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search produce e.g. Fresh carrots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    data-testid="input-search"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-r-lg transition-colors"
                  data-testid="button-search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 text-sm font-medium">
                <span>Get the App</span>
              </button>
              <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 text-sm font-medium">
                <User className="w-4 h-4" />
                <span>Account</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <Link href="/cart">
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 text-sm font-medium">
                  <ShoppingCart className="w-4 h-4" />
                  <span>My Basket</span>
                  {cartCount > 0 && (
                    <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-400 text-sm mb-6">Add some fresh crops to get started!</p>
            <Link href="/buyer-home">
              <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop: Two Column Layout */}
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {/* Left Column: Cart Items */}
              <div className="md:col-span-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cart ({cartItems.length})</h1>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.plantName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-green-100 text-green-600">
                              🌱
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{item.plantName}</h3>
                                <p className="text-gray-500 text-sm">{(item as any).availableQuantity || "20kg"} Available</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                  data-testid={`button-favorite-${item.id}`}
                                >
                                  <Heart className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-2 text-red-500 hover:text-red-600 transition-colors"
                                  data-testid={`button-remove-${item.id}`}
                                  disabled={isLoading}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                            <p className="font-bold text-gray-900 text-lg mt-2">₦{item.pricePerUnit?.toLocaleString() || (item.totalPrice / item.quantity).toLocaleString()}</p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-end mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item, -1)}
                                className="w-8 h-8 bg-green-700 hover:bg-green-800 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                                data-testid={`button-decrease-${item.id}`}
                                disabled={isLoading}
                              >
                                <Minus className="w-4 h-4 text-white" />
                              </button>
                              <span className="text-sm font-medium min-w-[3rem] text-center" data-testid={`quantity-${item.id}`}>
                                {item.quantity}{item.unit || 'kg'}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item, 1)}
                                className="w-8 h-8 bg-green-700 hover:bg-green-800 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                                data-testid={`button-increase-${item.id}`}
                                disabled={isLoading}
                              >
                                <Plus className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="hidden md:block">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">₦{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-gray-900">₦{discount.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-gray-900 text-xl">₦{(total - discount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <button
                      className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold transition-colors"
                      data-testid="button-checkout-desktop"
                    >
                      Checkout
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile: Fixed Bottom Checkout */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600">Total</span>
                <span className="text-xl font-bold text-gray-900">₦{total.toLocaleString()}</span>
              </div>
              <Link href="/checkout">
                <button
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                  data-testid="button-checkout-mobile"
                >
                  Checkout
                </button>
              </Link>
            </div>

            {/* Related Items Section */}
            <div className="mt-12 border-t pt-10 pb-24 md:pb-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Related Items</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollRelated('left')}
                    className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                    data-testid="button-scroll-related-left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollRelated('right')}
                    className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                    data-testid="button-scroll-related-right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isLoadingRelated ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex-shrink-0 w-36 animate-pulse">
                      <div className="w-full h-28 bg-gray-200 rounded-lg mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : relatedProducts.length > 0 ? (
                <div ref={relatedScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {relatedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setLocation('/buyer-home')}
                      className="flex-shrink-0 w-36 cursor-pointer"
                      data-testid={`related-product-${product.id}`}
                    >
                      <div className="w-full h-28 bg-gray-100 rounded-lg overflow-hidden mb-2">
                        {typeof product.image === "string" &&
                        (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-200">
                            {product.image}
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        {product.farm}
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {product.price} <span className="font-normal text-xs text-gray-500">{product.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No related items available</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Clear Cart Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <ShoppingCart className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-center">
              Clear Your Cart?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              This will remove all {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} from your cart. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Keep Items
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Clear Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
