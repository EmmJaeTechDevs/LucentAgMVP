import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Search, User, ShoppingCart, Heart, Minus, Plus, Star, ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import lucentLogo from "@assets/image 20_1759571692580.png";
import { BaseUrl } from "../../../Baseconfig";
import PlaceholderImage from "@assets/image 20_1759571692580.png";

interface Product {
  id: number;
  name: string;
  farm: string;
  farmerId?: string;
  price: string;
  unit: string;
  image: string;
  availableQuantity?: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [sameFarmerProducts, setSameFarmerProducts] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  const { toast } = useToast();
  const { addToCart, cartCount } = useCart();
  useSessionValidation("buyer");

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`${BaseUrl}/api/crops/${productId}`);
        if (response.ok) {
          const data = await response.json();
          const crop = data.crop || data;
          
          const plantName = crop.plant?.name || crop.plantId?.replace('plant-', '').replace('-', ' ') || 'Unknown Crop';
          const plantImage = crop.plant?.imageUrl || PlaceholderImage;
          
          setProduct({
            id: crop.id,
            name: plantName,
            farm: crop.farmerName || crop.farmer?.name || "Local Farm",
            farmerId: crop.farmerId,
            price: `₦${crop.pricePerUnit?.toLocaleString() || '0'}`,
            unit: `per ${crop.unit || 'Kg'}`,
            image: plantImage,
            availableQuantity: `${crop.availableQuantity || 0}${crop.unit || 'kg'} Available`,
            rating: 4.5,
            reviewCount: 134,
          });
          
          fetchSameFarmerProducts(crop.farmerId);
          fetchRelatedProducts(crop.plantId);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const fetchSameFarmerProducts = async (farmerId: string) => {
    if (!farmerId) return;
    try {
      const response = await fetch(`${BaseUrl}/api/crops?status=available`);
      if (response.ok) {
        const data = await response.json();
        const crops = data.crops || data || [];
        const farmerCrops = crops
          .filter((crop: any) => crop.farmerId === farmerId && crop.id !== parseInt(productId || "0"))
          .slice(0, 6)
          .map((crop: any) => ({
            id: crop.id,
            name: crop.plant?.name || crop.plantId?.replace('plant-', '').replace('-', ' ') || 'Unknown',
            farm: crop.farmerName || "Local Farm",
            price: `₦${crop.pricePerUnit?.toLocaleString() || '0'}`,
            unit: `per ${crop.unit || 'Kg'}`,
            image: crop.plant?.imageUrl || PlaceholderImage,
          }));
        setSameFarmerProducts(farmerCrops);
      }
    } catch (error) {
      console.error("Error fetching farmer products:", error);
    }
  };

  const fetchRelatedProducts = async (plantId: string) => {
    try {
      const response = await fetch(`${BaseUrl}/api/crops?status=available`);
      if (response.ok) {
        const data = await response.json();
        const crops = data.crops || data || [];
        const related = crops
          .filter((crop: any) => crop.id !== parseInt(productId || "0"))
          .slice(0, 6)
          .map((crop: any) => ({
            id: crop.id,
            name: crop.plant?.name || crop.plantId?.replace('plant-', '').replace('-', ' ') || 'Unknown',
            farm: crop.farmerName || "Local Farm",
            price: `₦${crop.pricePerUnit?.toLocaleString() || '0'}`,
            unit: `per ${crop.unit || 'Kg'}`,
            image: crop.plant?.imageUrl || PlaceholderImage,
          }));
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const productData = {
      id: product.id,
      name: product.name,
      farm: product.farm,
      image: product.image,
      rawData: {
        pricePerUnit: parseFloat(product.price.replace(/[₦,]/g, '')),
        unit: product.unit.replace('per ', ''),
        availableQuantity: parseInt(product.availableQuantity?.replace(/[^\d]/g, '') || '0'),
      }
    };
    
    addToCart(productData, quantity);
    
    toast({
      title: "Added to basket",
      description: `${quantity} ${product.unit.replace('per ', '')} of ${product.name} added to your basket`,
    });
  };

  const handleProductClick = (id: number) => {
    setLocation(`/product/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/buyer-home?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Product not found</p>
        <button
          onClick={() => setLocation("/buyer-home")}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4 md:gap-6">
            <button
              onClick={() => setLocation("/buyer-home")}
              className="flex-shrink-0"
              data-testid="button-logo"
            >
              <img 
                src={lucentLogo} 
                alt="Lucent Ag" 
                className="h-8 md:h-12 w-auto object-contain"
              />
            </button>

            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search produce e.g. Fresh carrots..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                  data-testid="input-search"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => setLocation("/buyer-profile")}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 text-sm font-medium transition-colors"
                data-testid="button-account"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Account</span>
              </button>
              <button
                onClick={() => setLocation("/buyer-cart")}
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 text-sm font-medium transition-colors relative"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:inline">My Basket</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Back Button */}
      <div className="md:hidden px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => setLocation("/buyer-home")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Product Details Section */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-12">
          {/* Product Image */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
              {product.image && (product.image.startsWith('/') || product.image.startsWith('http')) ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-200">
                  <Leaf className="w-24 h-24 text-green-600" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                data-testid="button-wishlist"
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
              <Leaf className="w-4 h-4 text-green-600" />
              {product.farm}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">{renderStars(product.rating || 4.5)}</div>
              <span className="text-sm text-gray-500">({product.reviewCount || 134} Reviews)</span>
            </div>

            {/* Price */}
            <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {product.price} <span className="font-normal text-base text-gray-500">{product.unit}</span>
            </p>

            {/* Quantity Selector */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quantity (kg)</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors"
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold min-w-[2rem] text-center" data-testid="text-quantity">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors"
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Available Quantity Badge */}
            <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full mb-6">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">{product.availableQuantity}</span>
            </div>

            {/* Add to Basket Button */}
            <button
              onClick={handleAddToCart}
              className="w-full md:w-auto md:min-w-[280px] bg-green-600 hover:bg-green-700 text-white py-3.5 px-8 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              data-testid="button-add-to-basket"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Basket
            </button>
          </div>
        </div>

        {/* From the Same Farmer Section */}
        {sameFarmerProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">From the same farmer</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {sameFarmerProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleProductClick(item.id)}
                  className="flex-shrink-0 w-36 md:w-40 cursor-pointer group"
                  data-testid={`same-farmer-product-${item.id}`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 group-hover:shadow-md transition-shadow">
                    {item.image && (item.image.startsWith('/') || item.image.startsWith('http')) ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Leaf className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">{item.price}</span>
                    <span className="text-gray-500 text-xs ml-1">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Items Section */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Related Items</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleProductClick(item.id)}
                  className="flex-shrink-0 w-36 md:w-40 cursor-pointer group"
                  data-testid={`related-product-${item.id}`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 group-hover:shadow-md transition-shadow">
                    {item.image && (item.image.startsWith('/') || item.image.startsWith('http')) ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Leaf className="w-8 h-8 text-green-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                  <p className="text-gray-500 text-xs mb-1 flex items-center gap-1 truncate">
                    <Leaf className="w-3 h-3 text-green-600 flex-shrink-0" />
                    {item.farm}
                  </p>
                  <p className="text-sm">
                    <span className="font-bold text-gray-900">{item.price}</span>
                    <span className="text-gray-500 text-xs ml-1">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
