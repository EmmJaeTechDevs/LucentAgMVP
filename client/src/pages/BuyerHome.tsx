import React, { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import TomatoesImage from "@assets/image 15.png";

export function BuyerHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
      image: "🥔",
      stockLeft: "",
    },
    {
      id: 3,
      name: "Green Beans",
      farm: "Emeka Farms",
      price: "₦1,800",
      unit: "per Basket",
      image: "🫘",
      stockLeft: "",
    },
  ];

  const harvestingSoonProducts = [
    {
      id: 4,
      name: "Cabbage",
      farm: "Northern Farms",
      price: "₦2,500",
      unit: "per Basket",
      image: "🥬",
      stockLeft: "",
    },
    {
      id: 5,
      name: "Groundnuts",
      farm: "Kaduna Co-op",
      price: "₦4,200",
      unit: "per Bag",
      image: "🥜",
      stockLeft: "",
    },
    {
      id: 6,
      name: "Plantain",
      farm: "Oyo Plantain Farm",
      price: "₦3,000",
      unit: "per Bunch",
      image: "🍌",
      stockLeft: "",
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
    console.log("Product clicked:", productId);
    // TODO: Navigate to product details
  };

  const handleCartClick = () => {
    console.log("Cart clicked");
    // TODO: Navigate to cart
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="px-6 pt-16 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hello John!</h1>
              <p className="text-gray-600 text-sm">
                Ready for something fresh today?
              </p>
            </div>
            <button
              onClick={handleCartClick}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
            </button>
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
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
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
            <div className="flex gap-4 overflow-x-hidden pb-2">
              {freshTodayProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`product-${product.id}`}
                >
                  <div className="relative">
                    <div className="w-full h-32 bg-gray-100 rounded-t-xl flex items-center justify-center text-4xl">
                      {product.image}
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
            <div className="flex gap-4 overflow-x-hidden pb-2">
              {harvestingSoonProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="flex-shrink-0 w-48 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  data-testid={`product-${product.id}`}
                >
                  <div className="w-full h-32 bg-gray-100 rounded-t-xl flex items-center justify-center text-4xl">
                    {product.image}
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
              <h1 className="text-4xl font-bold text-gray-900">Hello John!</h1>
              <p className="text-gray-600 text-xl">
                Ready for something fresh today?
              </p>
            </div>
            <button
              onClick={handleCartClick}
              className="p-4 hover:bg-gray-100 rounded-xl transition-colors"
              data-testid="button-cart-desktop"
            >
              <ShoppingCart className="w-8 h-8 text-gray-700" />
            </button>
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
                    <div className="w-full h-48 bg-gray-100 rounded-t-xl flex items-center justify-center text-6xl">
                      {product.image}
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
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                  data-testid={`product-desktop-${product.id}`}
                >
                  <div className="w-full h-48 bg-gray-100 rounded-t-xl flex items-center justify-center text-6xl">
                    {product.image}
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
    </div>
  );
}
