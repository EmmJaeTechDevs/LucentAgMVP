import React, { useState, useEffect, useCallback } from "react";
import { Search, ShoppingCart, User, LogOut, Settings, Package, Users, Home } from "lucide-react";
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
  const { toast } = useToast();
  const { addToCart, cartCount, isLoading: isCartLoading, fetchCartCount } = useCart();

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
    // Look for product in all possible arrays
    let product = freshTodayProducts.find((p) => p.id === productId);
    if (!product) {
      product = searchResultProducts.find((p) => p.id === productId);
    }
    if (product) {
      setSelectedProduct(product);
      setIsProductModalOpen(true);
    }
  };

  const handleHarvestingProductClick = (productId: number) => {
    // Look for product in all possible arrays
    let product = harvestingSoonProducts.find((p) => p.id === productId);
    if (!product) {
      product = searchResultProducts.find((p) => p.id === productId);
    }
    if (product) {
      setSelectedProduct(product);
      setIsHarvestingModalOpen(true);
    }
  };

  const handleAddToCart = async (product: any, quantity: number) => {
    await addToCart(product, quantity);
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

      {/* Desktop Layout */}
      <div className="hidden md:block p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setLocation("/buyer-home")}
                className="flex-shrink-0"
                data-testid="button-logo-desktop"
              >
                <img 
                  src={lucentLogo} 
                  alt="Lucent Ag Logo" 
                  className="h-24 w-auto object-contain"
                />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Hello {userLastName}!</h1>
                <p className="text-gray-600 text-xl">
                  Ready for something fresh today?
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleProfileClick}
                className="p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                data-testid="button-profile-desktop"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={handleCartClick}
                className="p-4 hover:bg-gray-100 rounded-xl transition-colors relative"
                data-testid="button-cart-desktop"
              >
                <ShoppingCart className="w-8 h-8 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
              <HamburgerMenu userType="buyer" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative max-w-2xl">
              <Search className="w-6 h-6 text-gray-400 absolute left-6 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search produce e.g. Fresh carrots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-lg"
                data-testid="input-search-desktop"
              />
            </div>
          </form>

          {/* Categories */}
          <div className="flex gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-8 py-4 rounded-full font-medium text-lg transition-colors ${
                  selectedCategory === category
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                data-testid={`category-desktop-${category.toLowerCase().replace(" ", "-")}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Fresh Today Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Fresh Today
            </h2>
            {isLoadingCrops ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : freshTodayProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freshTodayProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                  data-testid={`product-desktop-${product.id}`}
                >
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                      {typeof product.image === "string" &&
                      (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          {product.image}
                        </div>
                      )}
                    </div>
                    {product.stockLeft && (
                      <div className="absolute top-3 left-3 bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm font-medium">
                        {product.stockLeft}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {product.farm}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {product.price}{" "}
                      <span className="font-normal text-base text-gray-600">
                        {product.unit}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xl">No fresh crops available at the moment</p>
              </div>
            )}
          </div>

          {/* Harvesting Soon Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Harvesting Soon
            </h2>
            {isLoadingSoonReady ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : harvestingSoonProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {harvestingSoonProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleHarvestingProductClick(product.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                  data-testid={`product-desktop-${product.id}`}
                >
                  <div className="w-full h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                    {typeof product.image === "string" &&
                    (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {product.image}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {product.farm}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {product.price}{" "}
                      <span className="font-normal text-base text-gray-600">
                        {product.unit}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-xl">No harvesting soon crops available</p>
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
        product={selectedProduct}
        isOpen={isHarvestingModalOpen}
        onClose={() => setIsHarvestingModalOpen(false)}
        onNotifyMe={handleNotifyMe}
      />
    </div>
  );
}
