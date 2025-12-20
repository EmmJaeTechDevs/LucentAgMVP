import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, ShoppingCart, User, LogOut, Settings, Package, Users, Home, Heart, Star, Plus, Minus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useCart } from "@/hooks/useCart";
import { SessionCrypto } from "@/utils/sessionCrypto";
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
import PlaceholderImage from "@assets/stock_images/agricultural_plant_c_660884ee.jpg";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { HarvestingSoonModal } from "@/components/HarvestingSoonModal";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { BaseUrl } from "../../../Baseconfig";
import lucentLogo from "@assets/image 20_1759571692580.png";

export function BuyerHome() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any>(undefined);
  const [harvestingProduct, setHarvestingProduct] = useState<any>(undefined);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isHarvestingModalOpen, setIsHarvestingModalOpen] = useState(false);
  const [userLastName, setUserLastName] = useState("John");
  const [availableCrops, setAvailableCrops] = useState<any[]>([]);
  const [soonReadyCrops, setSoonReadyCrops] = useState<any[]>([]);
  const [isLoadingCrops, setIsLoadingCrops] = useState(true);
  const [isLoadingSoonReady, setIsLoadingSoonReady] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showSkipConfirmPopup, setShowSkipConfirmPopup] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const sameFarmerScrollRef = useRef<HTMLDivElement>(null);
  const relatedItemsScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { addToCart, cartCount, isLoading: isCartLoading, fetchCartCount } = useCart();

  // Check if buyer is a new registration (only show onboarding for new registrations, not logins)
  useEffect(() => {
    const isNewRegistration = sessionStorage.getItem("buyerIsNewRegistration");
    if (isNewRegistration === "true") {
      setShowWelcomePopup(true);
    }
  }, []);

  const handleSkipOnboarding = () => {
    setShowWelcomePopup(false);
    setShowSkipConfirmPopup(true);
  };

  const handleCloseSkipConfirm = () => {
    sessionStorage.removeItem("buyerIsNewRegistration");
    setShowSkipConfirmPopup(false);
    setLocation("/buyer-notification-preferences");
  };

  const handleProceedToOnboarding = () => {
    sessionStorage.removeItem("buyerIsNewRegistration");
    setShowWelcomePopup(false);
    setLocation("/buyer-onboarding-tutorial");
  };

  // Validate buyer session
  useSessionValidation("buyer");

  const categories = ["All", "Leafy Greens", "Fruits", "Grains", "Vegetables"];

  // Mapping function to transform API crop data to UI format
  const mapCropToProduct = (crop: any) => {
    // Get plant name from the API response Plant object, fallback to plantId-based name
    const plantName = crop.plant?.name || crop.plantId?.replace('plant-', '').replace('-', ' ') || 'Unknown Crop';
    
    // Use plant imageUrl from API response, fallback to placeholder
    const plantImage = crop.plant?.imageUrl || PlaceholderImage;
    
    // Calculate stock left message
    const stockLeft = crop.availableQuantity < crop.totalQuantity 
      ? `${crop.availableQuantity} ${crop.unit || 'Units'} Left`
      : "";

    return {
      id: crop.id,
      name: plantName, // Use actual plant name from API response
      farm: crop.farmerName || crop.farmer?.name || "Local Farm", // Use farmer name if available
      price: `₦${crop.pricePerUnit?.toLocaleString() || '0'}`,
      unit: `per ${crop.unit || 'Unit'}`,
      image: plantImage, // Use mapped image
      stockLeft: stockLeft,
      availableQuantity: `${crop.availableQuantity} ${crop.unit || 'Units'} Available`,
      location: `Grown in ${crop.state || 'Nigeria'}`,
      harvestDate: crop.harvestDate ? `Ready by ${new Date(crop.harvestDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : "Available now",
      rawData: crop // Keep original data for detailed view
    };
  };

  // Transform API data to products
  const freshTodayProducts = availableCrops.map(mapCropToProduct);
  const harvestingSoonProducts = soonReadyCrops.map(mapCropToProduct);
  const searchResultProducts = searchResults.map(mapCropToProduct);

  // Get buyer token helper function
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

  // Search API function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const token = getBuyerToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to search for crops.",
          variant: "destructive",
        });
        setIsSearching(false);
        return;
      }

      // Make search request with query parameter
      const response = await fetch(`${BaseUrl}/api/buyer/crops/search?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      console.log("Search API response status:", response.status);
      const responseData = await response.json();
      console.log("Search API response data:", responseData);

      if (response.status === 200 && responseData.crops) {
        setSearchResults(responseData.crops);
      } else {
        console.error("Search failed or no results found");
        setSearchResults([]);
      }

    } catch (error) {
      console.error("Error performing search:", error);
      setSearchResults([]);
      toast({
        title: "Search Error",
        description: "Failed to search for crops. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => performSearch(query), 300);
      };
    })(),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
  };

  const handleProductClick = (productId: number) => {
    // Find product
    let product = freshTodayProducts.find((p) => p.id === productId);
    if (!product) {
      product = searchResultProducts.find((p) => p.id === productId);
    }
    if (product) {
      // Check if mobile (less than 768px) - show modal, otherwise show inline
      const isMobileView = window.innerWidth < 768;
      if (isMobileView) {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
      } else {
        setSelectedProduct(product);
        // Scroll to product details section on tablet/desktop
        setTimeout(() => {
          document.getElementById('product-details-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const handleHarvestingProductClick = (productId: number) => {
    // Look for product in all possible arrays
    let product = harvestingSoonProducts.find((p) => p.id === productId);
    if (!product) {
      product = searchResultProducts.find((p) => p.id === productId);
    }
    if (product) {
      setHarvestingProduct(product);
      setIsHarvestingModalOpen(true);
    }
  };

  const handleAddToCart = async (product: any, quantity: number) => {
    await addToCart(product, quantity);
  };

  // Scroll handlers for inline product details
  const scrollSameFarmer = (direction: 'left' | 'right') => {
    if (sameFarmerScrollRef.current) {
      const scrollAmount = 200;
      sameFarmerScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRelatedItems = (direction: 'left' | 'right') => {
    if (relatedItemsScrollRef.current) {
      const scrollAmount = 200;
      relatedItemsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const closeProductDetails = () => {
    setSelectedProduct(undefined);
    setProductQuantity(1);
    setIsProductModalOpen(false);
  };

  const handleNotifyMe = async (product: any) => {
    console.log("Notify me for:", product.name);
    
    try {
      // Get buyer token from session storage
      const buyerSession = sessionStorage.getItem("buyerSession");
      if (!buyerSession) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to set up notifications.",
          variant: "destructive",
        });
        return;
      }

      const encryptedSessionData = JSON.parse(buyerSession);
      const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
      const now = new Date().getTime();
      
      // Check if session is still valid and has token
      if (!sessionData.token || now >= sessionData.expiry) {
        toast({
          title: "Session Expired",
          description: "Please log in again to set up notifications.",
          variant: "destructive",
        });
        return;
      }

      // Prepare request body
      const requestBody = {
        cropId: product.rawData?.id || product.id,
        message: "Please notify me when this crop is ready",
        notificationType: "crop_ready"
      };

      console.log('Making notification request with:', requestBody);

      // Make POST request to notifications endpoint
      const response = await fetch(`${BaseUrl}/api/buyer/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to set up notification: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Notification API Response:', result);
      
      // Show success message
      toast({
        title: "Notification Set!",
        description: `We'll notify you when ${product.name} is ready for harvest.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });
      
    } catch (error) {
      console.error('Error setting up notification:', error);
      toast({
        title: "Failed to Set Notification",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleCartClick = () => {
    setLocation("/cart");
  };

  const handleProfileClick = () => {
    setLocation("/buyer-profile");
  };

  const handleLogout = () => {
    // Clear all session and local storage data
    sessionStorage.clear();
    localStorage.clear();
    
    toast({
      title: "✅ Logged Out Successfully",
      description: "You have been securely logged out.",
    });
    
    // Redirect to logged out page
    setLocation("/logged-out");
  };

  // Load user data from session storage
  useEffect(() => {
    const buyerSession = sessionStorage.getItem("buyerSession");
    if (buyerSession) {
      try {
        const encryptedSessionData = JSON.parse(buyerSession);
        const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
        const now = new Date().getTime();
        if (now < sessionData.expiry && sessionData.lastName) {
          setUserLastName(sessionData.lastName);
        }
      } catch (error) {
        console.error("Error parsing buyer session:", error);
      }
    }
  }, []);

  // Fetch available crops when component mounts
  useEffect(() => {
    const fetchAvailableCrops = async () => {
      try {
        setIsLoadingCrops(true);
        
        // Get buyer token from session storage
        const buyerSession = sessionStorage.getItem("buyerSession");
        if (!buyerSession) {
          console.error("No buyer session found");
          setIsLoadingCrops(false);
          return;
        }

        const encryptedSessionData = JSON.parse(buyerSession);
        const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
        const now = new Date().getTime();
        
        if (now >= sessionData.expiry) {
          console.error("Buyer session has expired");
          setIsLoadingCrops(false);
          return;
        }

        const token = sessionData.token;
        if (!token) {
          console.error("No buyer token found in session");
          setIsLoadingCrops(false);
          return;
        }

        // Make GET request to fetch available crops
        const response = await fetch(`${BaseUrl}/api/buyer/crops/available`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        // Console log the response
        console.log("Available crops API response status:", response.status);
        const responseData = await response.json();
        console.log("Available crops API response data:", responseData);

        if (response.status === 200 && responseData.crops) {
          // Debug: Log crop structure to see plant object
          if (responseData.crops.length > 0) {
            console.log("Available crop sample:", responseData.crops[0]);
          }
          setAvailableCrops(responseData.crops);
        } else {
          console.error("Failed to fetch crops or no crops available");
          setAvailableCrops([]);
        }

      } catch (error) {
        console.error("Error fetching available crops:", error);
        setAvailableCrops([]);
      } finally {
        setIsLoadingCrops(false);
      }
    };

    fetchAvailableCrops();
  }, []);

  // Fetch soon-ready crops when component mounts
  useEffect(() => {
    const fetchSoonReadyCrops = async () => {
      try {
        setIsLoadingSoonReady(true);
        
        // Get buyer token from session storage
        const buyerSession = sessionStorage.getItem("buyerSession");
        if (!buyerSession) {
          console.error("No buyer session found for soon-ready crops");
          setIsLoadingSoonReady(false);
          return;
        }

        const encryptedSessionData = JSON.parse(buyerSession);
        const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
        const now = new Date().getTime();
        
        if (now >= sessionData.expiry) {
          console.error("Buyer session has expired for soon-ready crops");
          setIsLoadingSoonReady(false);
          return;
        }

        const token = sessionData.token;
        if (!token) {
          console.error("No buyer token found in session for soon-ready crops");
          setIsLoadingSoonReady(false);
          return;
        }

        // Make GET request to fetch soon-ready crops
        const response = await fetch(`${BaseUrl}/api/buyer/crops/soon-ready`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        });

        // Console log the response
        console.log("Soon-ready crops API response status:", response.status);
        const responseData = await response.json();
        console.log("Soon-ready crops API response data:", responseData);

        if (response.status === 200 && responseData.crops) {
          // Debug: Log crop structure to see plant object
          if (responseData.crops.length > 0) {
            console.log("Soon-ready crop sample:", responseData.crops[0]);
          }
          setSoonReadyCrops(responseData.crops);
        } else {
          console.error("Failed to fetch soon-ready crops or no crops available");
          setSoonReadyCrops([]);
        }

      } catch (error) {
        console.error("Error fetching soon-ready crops:", error);
        setSoonReadyCrops([]);
      } finally {
        setIsLoadingSoonReady(false);
      }
    };

    fetchSoonReadyCrops();
  }, []);

  // Initialize cart count on component mount
  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="px-6 pt-16 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setLocation("/buyer-home")}
              className="flex-shrink-0"
              data-testid="button-logo"
            >
              <img 
                src={lucentLogo} 
                alt="Lucent Ag Logo" 
                className="h-20 w-auto object-contain"
              />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-all duration-200 hover:scale-105"
                data-testid="button-profile"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={handleCartClick}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors relative"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-3 hover:bg-red-50 rounded-xl transition-colors"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-6 h-6 text-red-600" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                    <AlertDialogDescription>
                      You're about to log out of your account. Your session will end and you'll need to sign in again to access your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Greeting Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Hello {userLastName}!</h1>
            <p className="text-gray-600 text-sm">
              Ready for something fresh today?
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search produce e.g. Fresh carrots..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                data-testid="input-search"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </form>

          {/* Categories */}
          <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                data-testid={`category-${category.toLowerCase().replace(" ", "-")}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Results Section */}
          {hasSearched ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Search Results {searchQuery && `for "${searchQuery}"`}
              </h2>
              {isSearching ? (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm animate-pulse">
                      <div className="w-full h-32 bg-gray-200 rounded-t-xl"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResultProducts.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                  {searchResultProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      data-testid={`search-result-${product.id}`}
                    >
                      <div className="relative">
                        <div className="w-full h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                          {typeof product.image === "string" &&
                          (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">
                              {product.image}
                            </div>
                          )}
                        </div>
                        {product.stockLeft && (
                          <div className="absolute top-2 left-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                            {product.stockLeft}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {product.farm}
                        </p>
                        <p className="font-bold text-gray-900">
                          {product.price}{" "}
                          <span className="font-normal text-sm text-gray-600">
                            {product.unit}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No crops found matching "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setHasSearched(false);
                      setSearchResults([]);
                    }}
                    className="mt-2 text-green-600 hover:text-green-700 font-medium"
                    data-testid="button-clear-search"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Fresh Today Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Fresh Today
                </h2>
                {isLoadingCrops ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : freshTodayProducts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {freshTodayProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`product-${product.id}`}
                >
                  <div className="relative">
                    <div className="w-full h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                      {typeof product.image === "string" &&
                      (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {product.image}
                        </div>
                      )}
                    </div>
                    {product.stockLeft && (
                      <div className="absolute top-2 left-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                        {product.stockLeft}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {product.farm}
                    </p>
                    <p className="font-bold text-gray-900">
                      {product.price}{" "}
                      <span className="font-normal text-sm text-gray-600">
                        {product.unit}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No fresh crops available at the moment</p>
              </div>
            )}
          </div>

          {/* Harvesting Soon Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Harvesting Soon
            </h2>
            {isLoadingSoonReady ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : harvestingSoonProducts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {harvestingSoonProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleHarvestingProductClick(product.id)}
                  className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`product-${product.id}`}
                >
                  <div className="w-full h-32 bg-gray-100 rounded-t-xl overflow-hidden">
                    {typeof product.image === "string" &&
                    (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {product.image}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {product.farm}
                    </p>
                    <p className="font-bold text-gray-900">
                      {product.price}{" "}
                      <span className="font-normal text-sm text-gray-600">
                        {product.unit}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No harvesting soon crops available</p>
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* Mobile Bottom Navigation Tray */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="grid grid-cols-4 h-20">
            <button
              onClick={() => setLocation("/buyer-home")}
              className="flex flex-col items-center justify-center gap-1 text-green-600 font-medium"
              data-testid="nav-home"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
            
            <button
              onClick={() => setLocation("/buyer-profile")}
              className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
              data-testid="nav-settings"
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs">Settings</span>
            </button>
            
            <button
              onClick={() => setLocation("/buyer-orders")}
              className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
              data-testid="nav-orders"
            >
              <Package className="w-6 h-6" />
              <span className="text-xs">My Orders</span>
            </button>
            
            <button
              onClick={() => setLocation("/communities")}
              className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
              data-testid="nav-communities"
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Communities</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="hidden md:block">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-6">
              {/* Logo */}
              <button
                onClick={() => setLocation("/buyer-home")}
                className="flex-shrink-0"
                data-testid="button-logo-desktop"
              >
                <img 
                  src={lucentLogo} 
                  alt="Lucent Ag" 
                  className="h-12 w-auto object-contain"
                />
              </button>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search produce e.g. fresh carrots..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                    data-testid="input-search-desktop"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Right Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 text-sm font-medium transition-colors"
                  data-testid="button-account-desktop"
                >
                  <User className="w-5 h-5" />
                  <span>Account</span>
                </button>
                <button
                  onClick={handleCartClick}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 text-sm font-medium transition-colors relative"
                  data-testid="button-cart-desktop"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>My Basket</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      data-testid="button-logout-desktop"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Log Out</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                      <AlertDialogDescription>
                        You're about to log out of your account. Your session will end and you'll need to sign in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                        Log Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? "bg-green-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      data-testid={`category-desktop-${category.toLowerCase().replace(" ", "-")}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setLocation("/buyer-orders")}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => setLocation("/communities")}
                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 text-sm font-medium"
                  >
                    <Users className="w-4 h-4" />
                    <span>Communities</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Sign Up Banner */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 border-t border-yellow-300">
            <div className="max-w-7xl mx-auto px-6 py-2 text-center">
              <span className="text-sm text-gray-800 font-medium">
                Are you a farmer?{" "}
                <button
                  onClick={() => setLocation("/login")}
                  className="text-green-700 hover:text-green-800 font-semibold hover:underline"
                >
                  Login or Sign up as a Farmer
                </button>
              </span>
            </div>
          </div>
        </header>

        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80')`,
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Fresh from local farms to your door
              </h1>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                data-testid="button-shop-fresh"
              >
                Shop Fresh Today
              </button>
            </div>
          </div>
        </div>

        {/* Inline Product Details Section - Only show on tablet/desktop */}
        {selectedProduct && !isProductModalOpen && (
          <div id="product-details-section" className="hidden md:block bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {/* Close button */}
              <button
                onClick={closeProductDetails}
                className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-1"
                data-testid="button-close-product-details"
              >
                <X className="w-5 h-5" />
                <span>Close</span>
              </button>
              
              {/* Product Details */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Product Image */}
                <div className="md:w-2/5">
                  <div className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
                    {typeof selectedProduct.image === "string" && 
                    (selectedProduct.image.startsWith("/") || selectedProduct.image.startsWith("http")) ? (
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-200">
                        {selectedProduct.image}
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="md:w-3/5">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <button className="p-2 text-gray-400 hover:text-red-500" data-testid="button-favorite">
                      <Heart className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {selectedProduct.farm}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-gray-500 text-sm ml-1">(134 Reviews)</span>
                  </div>

                  {/* Price */}
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedProduct.price}{" "}
                    <span className="font-normal text-base text-gray-600">{selectedProduct.unit}</span>
                  </p>

                  {/* Quantity Selector */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Quantity (kg)</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                        className="w-10 h-10 bg-green-700 text-white rounded-md flex items-center justify-center hover:bg-green-800"
                        data-testid="button-decrease-quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-lg">{productQuantity}</span>
                      <button
                        onClick={() => setProductQuantity(productQuantity + 1)}
                        className="w-10 h-10 bg-green-700 text-white rounded-md flex items-center justify-center hover:bg-green-800"
                        data-testid="button-increase-quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700 text-sm font-medium">{selectedProduct.availableQuantity || "20kg Available"}</span>
                  </div>

                  {/* Add to Basket Button */}
                  <button
                    onClick={async () => {
                      await handleAddToCart(selectedProduct, productQuantity);
                      toast({
                        title: "Added to basket",
                        description: `${productQuantity} ${selectedProduct.unit?.replace('per ', '') || 'kg'} of ${selectedProduct.name} added to your basket`,
                      });
                    }}
                    className="w-full md:w-auto bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    data-testid="button-add-to-basket"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Basket
                  </button>
                </div>
              </div>

              {/* From the Same Farmer Section */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">From the same farmer</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollSameFarmer('left')}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                      data-testid="button-scroll-farmer-left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollSameFarmer('right')}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                      data-testid="button-scroll-farmer-right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div ref={sameFarmerScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {freshTodayProducts.filter(p => p.farm === selectedProduct.farm && p.id !== selectedProduct.id).slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setProductQuantity(1);
                      }}
                      className="flex-shrink-0 w-36 cursor-pointer"
                      data-testid={`same-farmer-product-${product.id}`}
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
                      <p className="font-bold text-gray-900 text-sm">
                        {product.price} <span className="font-normal text-xs text-gray-500">{product.unit}</span>
                      </p>
                    </div>
                  ))}
                  {freshTodayProducts.filter(p => p.farm === selectedProduct.farm && p.id !== selectedProduct.id).length === 0 && (
                    freshTodayProducts.filter(p => p.id !== selectedProduct.id).slice(0, 6).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setProductQuantity(1);
                        }}
                        className="flex-shrink-0 w-36 cursor-pointer"
                        data-testid={`same-farmer-product-${product.id}`}
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
                        <p className="font-bold text-gray-900 text-sm">
                          {product.price} <span className="font-normal text-xs text-gray-500">{product.unit}</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Related Items Section */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Related Items</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollRelatedItems('left')}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                      data-testid="button-scroll-related-left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollRelatedItems('right')}
                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50"
                      data-testid="button-scroll-related-right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div ref={relatedItemsScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {freshTodayProducts.filter(p => p.id !== selectedProduct.id).slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setProductQuantity(1);
                      }}
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
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Fresh Today Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Fresh Today</h2>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                See all
                <span>→</span>
              </button>
            </div>
            {isLoadingCrops ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-44 bg-white rounded-lg shadow-sm animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : freshTodayProducts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {freshTodayProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="flex-shrink-0 w-44 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                    data-testid={`product-desktop-${product.id}`}
                  >
                    <div className="w-full h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                      {typeof product.image === "string" &&
                      (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-200">
                          {product.image}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                        {product.farm}
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {product.price}{" "}
                        <span className="font-normal text-xs text-gray-500">
                          {product.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No fresh crops available at the moment</p>
              </div>
            )}
          </div>

          {/* Harvesting Soon Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Harvesting Soon</h2>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                See all
                <span>→</span>
              </button>
            </div>
            {isLoadingSoonReady ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-44 bg-white rounded-lg shadow-sm animate-pulse">
                    <div className="w-full h-32 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : harvestingSoonProducts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {harvestingSoonProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleHarvestingProductClick(product.id)}
                    className="flex-shrink-0 w-44 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                    data-testid={`product-desktop-${product.id}`}
                  >
                    <div className="w-full h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                      {typeof product.image === "string" &&
                      (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-200">
                          {product.image}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                        {product.farm}
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {product.price}{" "}
                        <span className="font-normal text-xs text-gray-500">
                          {product.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No harvesting soon crops available</p>
              </div>
            )}
          </div>

          {/* Shop by Category Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: "Vegetables", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80" },
                { name: "Fruits", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80" },
                { name: "Grains", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80" },
                { name: "Legumes", image: "https://images.unsplash.com/photo-1515543904323-4ce37c8f6114?w=400&q=80" },
                { name: "Herbs & Spices", image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80" },
              ].map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCategorySelect(category.name)}
                  className="group relative h-32 rounded-lg overflow-hidden"
                  data-testid={`category-image-${category.name.toLowerCase().replace(/ & /g, "-")}`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Picks Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Picks</h2>
            {freshTodayProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {freshTodayProducts.slice(0, 10).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                    data-testid={`popular-product-${product.id}`}
                  >
                    <div className="w-full h-28 bg-gray-100 rounded-t-lg overflow-hidden">
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
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-1 flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                        {product.farm}
                      </p>
                      <p className="font-bold text-gray-900 text-sm">
                        {product.price}{" "}
                        <span className="font-normal text-xs text-gray-500">
                          {product.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <HarvestingSoonModal
        product={harvestingProduct}
        isOpen={isHarvestingModalOpen}
        onClose={() => {
          setIsHarvestingModalOpen(false);
          setHarvestingProduct(undefined);
        }}
        onNotifyMe={handleNotifyMe}
      />

      {/* Welcome Popup */}
      <AlertDialog open={showWelcomePopup} onOpenChange={setShowWelcomePopup}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              Welcome to Lucent Ag
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              To help you make the most use of this app, please proceed to the recommended onboarding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-3 sm:flex-col">
            <AlertDialogAction
              onClick={handleProceedToOnboarding}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-proceed-onboarding"
            >
              Proceed to onboarding
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={handleSkipOnboarding}
              className="w-full"
              data-testid="button-skip-onboarding"
            >
              Skip onboarding
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Skip Confirmation Popup */}
      <AlertDialog open={showSkipConfirmPopup} onOpenChange={setShowSkipConfirmPopup}>
        <AlertDialogContent className="max-w-md mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              Onboarding Skipped
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              You can access the onboarding at your convenience in the Help Center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleCloseSkipConfirm}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-close-skip-confirm"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
