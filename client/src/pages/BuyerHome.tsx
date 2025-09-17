import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User, LogOut } from "lucide-react";
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
import TomatoesImage from "@assets/image 15.png";
import SweetPotatoImage from "@assets/Frame 8.png";
import CabbageImage from "@assets/Frame 9.png";
import PlantainImage from "@assets/image 13_1756529531399.png";
import GroundnutsImage from "@assets/image 17.png";
import GreenBeansImage from "@assets/image 2_1756522296288.jpg";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { HarvestingSoonModal } from "@/components/HarvestingSoonModal";

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
  const { toast } = useToast();
  const { addToCart, cartCount, isLoading: isCartLoading, fetchCartCount } = useCart();

  // Validate buyer session
  useSessionValidation("buyer");

  const categories = ["All", "Leafy Greens", "Fruits", "Grains", "Vegetables"];

  // Mapping function to transform API crop data to UI format
  const mapCropToProduct = (crop: any) => {
    // Get plant name from the API response Plant object, fallback to plantId-based name
    const plantName = crop.plant?.name || crop.plantId?.replace('plant-', '').replace('-', ' ') || 'Unknown Crop';
    
    // Map plantId to images (keeping image mapping for now)
    const plantImageMapping: { [key: string]: any } = {
      'plant-beans': GreenBeansImage,
      'plant-yam': SweetPotatoImage,
      'plant-tomatoes': TomatoesImage,
      'plant-cabbage': CabbageImage,
      'plant-groundnuts': GroundnutsImage,
      'plant-plantain': PlantainImage,
    };

    const plantImage = plantImageMapping[crop.plantId] || TomatoesImage;
    
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
  };

  const handleProductClick = (productId: number) => {
    const product = freshTodayProducts.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsProductModalOpen(true);
    }
  };

  const handleHarvestingProductClick = (productId: number) => {
    const product = harvestingSoonProducts.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setIsHarvestingModalOpen(true);
    }
  };

  const handleAddToCart = async (product: any, quantity: number) => {
    await addToCart(product, quantity);
  };

  const handleNotifyMe = (product: any) => {
    console.log("Notify me for:", product.name);
    // TODO: Implement notification signup
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
        const response = await fetch("https://lucent-ag-api-damidek.replit.app/api/buyer/crops/available", {
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
        const response = await fetch("https://lucent-ag-api-damidek.replit.app/api/buyer/crops/soon-ready", {
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
        <div className="px-6 pt-16 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hello {userLastName}!</h1>
              <p className="text-gray-600 text-sm">
                Ready for something fresh today?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                data-testid="button-profile"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-semibold">Profile</span>
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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search produce e.g. Fresh carrots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-green-500 transition-all"
                data-testid="input-search"
              />
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
                      product.image.startsWith("/") ? (
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
                    product.image.startsWith("/") ? (
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
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Hello {userLastName}!</h1>
              <p className="text-gray-600 text-xl">
                Ready for something fresh today?
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                data-testid="button-profile-desktop"
              >
                <User className="w-6 h-6" />
                <span className="text-lg">My Profile</span>
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
                      product.image.startsWith("/") ? (
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
                    product.image.startsWith("/") ? (
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
