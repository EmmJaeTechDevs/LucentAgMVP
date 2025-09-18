import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Leaf, ChevronRight, User, Package, MapPin, Calendar, Phone } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";

interface FarmerOrderResponse {
  orders: FarmerOrder[];
  total: number;
  page: number;
  totalPages: number;
}

interface FarmerOrder {
  id: string;
  cropId: string;
  buyerId: string;
  farmerId: string;
  quantityOrdered: number;
  pricePerUnit: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  deliveryAddress: string;
  deliveryState: string;
  deliveryLga: string;
  deliveryNote: string;
  orderDate: string;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    username: string | null;
    userType: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  crop: {
    id: string;
    farmerId: string;
    plantId: string;
    totalQuantity: number;
    availableQuantity: number;
    unit: string;
    pricePerUnit: number;
    harvestDate: string;
    state: string;
    lga: string;
    farmAddress: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    plant: {
      id: string;
      name: string;
      description: string;
      category: string;
      growthDuration: string;
      imageUrl: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export function CheckOrders() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "delivered" | "cancelled">("pending");
  const [orderResponse, setOrderResponse] = useState<FarmerOrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate farmer session
  useSessionValidation("farmer");

  // Function to get farmer token from session storage
  const getFarmerToken = (): string | null => {
    try {
      const farmerSession = sessionStorage.getItem("farmerSession");
      if (farmerSession) {
        const encryptedSessionData = JSON.parse(farmerSession);
        const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
        const now = new Date().getTime();
        
        // Check if session is still valid and has token
        if (sessionData.token && now < sessionData.expiry) {
          return sessionData.token;
        }
      }
      return null;
    } catch (error) {
      console.error('Error retrieving farmer token:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadFarmerOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = getFarmerToken();
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch('https://lucent-ag-api-damidek.replit.app/api/farmer/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch farmer orders: ${response.status} ${response.statusText}`);
        }

        const ordersData: FarmerOrderResponse = await response.json();
        console.log('Farmer Orders Response:', ordersData);
        
        setOrderResponse(ordersData);
      } catch (error) {
        console.error('Error loading farmer orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to load orders');
        setOrderResponse(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFarmerOrders();
  }, []);

  const handleGoBack = () => {
    setLocation("/farmer-dashboard");
  };

  const handleOrderClick = (orderId: string) => {
    console.log("Order clicked:", orderId);
    // Navigate to order details page
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: FarmerOrder["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const orders = orderResponse?.orders || [];
  const filteredOrders = orders.filter(order => order.status === activeTab);
  
  const orderCounts = {
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const filterTabs = [
    { key: "pending" as const, label: "Pending", count: orderCounts.pending },
    { key: "confirmed" as const, label: "Confirmed", count: orderCounts.confirmed },
    { key: "delivered" as const, label: "Delivered", count: orderCounts.delivered },
    { key: "cancelled" as const, label: "Cancelled", count: orderCounts.cancelled },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
            </button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Your Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Orders from buyers for your crops
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Tab buttons */}
          {!isLoading && !error && (
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                  data-testid={`tab-${tab.key}`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>
          )}

          {/* New orders notification */}
          {!isLoading && !error && activeTab === "pending" && orderCounts.pending > 0 && (
            <div className="bg-green-100 dark:bg-green-900/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-20">
                <Leaf className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <div className="relative z-10">
                <p className="text-green-800 dark:text-green-400 font-semibold text-lg">
                  You have {orderCounts.pending} new order{orderCounts.pending > 1 ? 's' : ''}!
                </p>
              </div>
            </div>
          )}

          {/* Orders list */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No {activeTab} orders yet
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="space-y-3">
                      {/* Order Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                            {order.crop.plant.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{order.buyer.firstName} {order.buyer.lastName}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {order.quantityOrdered} {order.crop.unit}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Total:</span>
                          <p className="font-medium text-green-600 dark:text-green-400">
                            ₦{order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-gray-100">{order.deliveryAddress}</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.deliveryLga}, {order.deliveryState}</p>
                        </div>
                      </div>

                      {/* Order Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Ordered {formatDate(order.orderDate)}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-12">
            <button
              onClick={handleGoBack}
              className="p-3 -ml-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-8 h-8 text-gray-900 dark:text-gray-100" />
            </button>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Your Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Orders from buyers for your crops
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Loading orders...</p>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
                <p className="text-red-600 dark:text-red-300">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Tab buttons */}
            {!isLoading && !error && (
              <div className="flex gap-2 mb-8 overflow-x-auto">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-3 rounded-full text-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                    data-testid={`tab-${tab.key}-desktop`}
                  >
                    {tab.label} {tab.count > 0 && `(${tab.count})`}
                  </button>
                ))}
              </div>
            )}

            {/* New orders notification */}
            {!isLoading && !error && activeTab === "pending" && orderCounts.pending > 0 && (
              <div className="bg-green-100 dark:bg-green-900/20 rounded-3xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-6 right-6 opacity-20">
                  <Leaf className="w-20 h-20 text-green-600 dark:text-green-400" />
                </div>
                <div className="relative z-10">
                  <p className="text-green-800 dark:text-green-400 font-semibold text-xl">
                    You have {orderCounts.pending} new order{orderCounts.pending > 1 ? 's' : ''}!
                  </p>
                </div>
              </div>
            )}

            {/* Orders list */}
            {!isLoading && !error && (
              <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xl">
                      No {activeTab} orders yet
                    </p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
                      className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-left hover:scale-[1.01]"
                      data-testid={`order-${order.id}-desktop`}
                    >
                      <div className="flex gap-6">
                        {/* Crop Image */}
                        <div className="relative">
                          <img
                            src={order.crop.plant.imageUrl}
                            alt={order.crop.plant.name}
                            className="w-20 h-20 object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                            }}
                          />
                          <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-1">
                                {order.crop.plant.name}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <User className="w-5 h-5" />
                                <span className="text-lg">{order.buyer.firstName} {order.buyer.lastName}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ₦{order.total.toLocaleString()}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {order.quantityOrdered} {order.crop.unit}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-gray-900 dark:text-gray-100 font-medium">{order.deliveryAddress}</p>
                                <p className="text-gray-600 dark:text-gray-400">{order.deliveryLga}, {order.deliveryState}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Ordered {formatDate(order.orderDate)}
                              </span>
                            </div>
                          </div>

                          {order.buyer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4" />
                              <span>{order.buyer.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Pagination Info */}
            {orderResponse && orderResponse.totalPages > 1 && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Page {orderResponse.page} of {orderResponse.totalPages} 
                  ({orderResponse.total} total orders)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}