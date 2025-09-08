import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useSessionValidation } from "@/hooks/useSessionValidation";
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
  const { toast } = useToast();

  // Validate buyer session
  useSessionValidation("buyer");

  const categories = ["All", "Leafy Greens", "Fruits", "Grains", "Vegetables"];

  // Sample product data matching your design
  const freshTodayProducts = [
    {
      id: 1,
      name: "Tomatoes",
      farm: "Oshuporu Farms",
      price: "₦2,000",
      unit: "per Basket",
      image: TomatoesImage,
      stockLeft: "8 Baskets Left",
    },
    {
      id: 2,
      name: "Sweet Potatoes",
      farm: "Chika & Sons Farms",
      price: "₦3,500",
      unit: "per Bag",
      image: SweetPotatoImage,
      stockLeft: "",
    },
    {
      id: 3,
      name: "Green Beans",
      farm: "Emeka Farms",
      price: "₦1,800",
      unit: "per Basket",
      image: GreenBeansImage,
      stockLeft: "",
    },
  ];

  const harvestingSoonProducts = [
    {
      id: 4,
      name: "Cabbage",
      farm: "Lily Farms",
      price: "₦2,500",
      unit: "per Basket",
      image: CabbageImage,
      stockLeft: "",
      availableQuantity: "50 Bags Available",
      location: "Grown in Lagos, Nigeria",
      harvestDate: "Ready by September 23, 2025",
    },
    {
      id: 5,
      name: "Groundnuts",
      farm: "Lily Farms",
      price: "₦4,200",
      unit: "per Bag",
      image: GroundnutsImage,
      stockLeft: "",
      availableQuantity: "30 Bags Available",
      location: "Grown in Kaduna, Nigeria",
      harvestDate: "Ready by October 15, 2025",
    },
    {
      id: 6,
      name: "Plantain",
      farm: "Lily Farms",
      price: "₦3,000",
      unit: "per Bunch",
      image: PlantainImage,
      stockLeft: "",
      availableQuantity: "100 Bunches Available",
      location: "Grown in Oyo, Nigeria",
      harvestDate: "Ready by September 30, 2025",
    },
  ];

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

  const handleAddToCart = (product: any, quantity: number) => {
    console.log("Adding to cart:", product.name, "Quantity:", quantity);
    // TODO: Implement add to cart functionality
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
        const sessionData = JSON.parse(buyerSession);
        const now = new Date().getTime();
        if (now < sessionData.expiry && sessionData.lastName) {
          setUserLastName(sessionData.lastName);
        }
      } catch (error) {
        console.error("Error parsing buyer session:", error);
      }
    }
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
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
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
          </div>

          {/* Harvesting Soon Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Harvesting Soon
            </h2>
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
                className="p-4 hover:bg-gray-100 rounded-xl transition-colors"
                data-testid="button-cart-desktop"
              >
                <ShoppingCart className="w-8 h-8 text-gray-700" />
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
          </div>

          {/* Harvesting Soon Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Harvesting Soon
            </h2>
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
