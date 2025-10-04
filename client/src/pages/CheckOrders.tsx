import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Leaf, ChevronRight, User, Package, MapPin, Calendar, Phone, Mail, X, CheckCircle, Clock, XCircle } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";

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
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "delivered" | "cancelled" | "closed">("pending");
  const [orderResponse, setOrderResponse] = useState<FarmerOrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FarmerOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);

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

        const response = await fetch(`${BaseUrl}/api/farmer/orders`, {
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
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusIcon = (status: FarmerOrder["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5" />;
      case "confirmed": return <Package className="w-5 h-5" />;
      case "delivered": return <CheckCircle className="w-5 h-5" />;
      case "cancelled": return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const handleDeliveryConfirm = async () => {
    if (!selectedOrder) return;

    setIsDelivering(true);
    
    try {
      const token = getFarmerToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${BaseUrl}/api/farmer/orders/${selectedOrder.id}/deliver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to mark order as delivered: ${response.status} ${response.statusText}`);
      }

      console.log('Order marked as delivered successfully');
      
      // Update the local order status
      if (orderResponse) {
        const updatedOrders = orderResponse.orders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: "delivered" as const, deliveredAt: new Date().toISOString() }
            : order
        );
        setOrderResponse({ ...orderResponse, orders: updatedOrders });
      }

      // Close the modal
      closeModal();
      
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert(error instanceof Error ? error.message : 'Failed to mark order as delivered');
    } finally {
      setIsDelivering(false);
    }
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
  const filteredOrders = activeTab === "closed" 
    ? [] // Closed tab logic to be defined by user
    : orders.filter(order => order.status === activeTab);
  
  const orderCounts = {
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    closed: 0, // To be defined
  };

  const filterTabs = [
    { key: "pending" as const, label: "Pending", count: orderCounts.pending },
    { key: "confirmed" as const, label: "Confirmed", count: orderCounts.confirmed },
    { key: "delivered" as const, label: "Delivered", count: orderCounts.delivered },
    { key: "cancelled" as const, label: "Cancelled", count: orderCounts.cancelled },
    { key: "closed" as const, label: "Closed", count: orderCounts.closed },
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

            {/* Orders Table */}
            {!isLoading && !error && (
              <div>
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Date Ordered</th>
                          <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Crop Name</th>
                          <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Buyer</th>
                          <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Quantity</th>
                          <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Status</th>
                          <th className="text-right py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Total Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr
                            key={order.id}
                            onClick={() => handleOrderClick(order.id)}
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                            data-testid={`order-${order.id}-desktop`}
                          >
                            <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
                              {new Date(order.orderDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                              })}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={order.crop.plant.imageUrl}
                                  alt={order.crop.plant.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                                  }}
                                />
                                <span className="font-medium text-gray-900 dark:text-gray-100">{order.crop.plant.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
                              {order.buyer.firstName} {order.buyer.lastName}
                            </td>
                            <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
                              {order.quantityOrdered} {order.crop.unit}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-green-600 dark:text-green-400">
                              ₦{order.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          {/* Mobile Modal - Bottom Half */}
          <div className="block md:hidden w-full h-1/2 bg-white dark:bg-gray-800 rounded-t-3xl p-6 animate-slide-up overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                data-testid="button-close-modal"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Order Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Crop:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.crop.plant.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.quantityOrdered} {selectedOrder.crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Price per unit:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">₦{selectedOrder.pricePerUnit.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">₦{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Buyer Information
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}
                  </p>
                  {selectedOrder.buyer.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedOrder.buyer.phone}</span>
                    </div>
                  )}
                  {selectedOrder.buyer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedOrder.buyer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Information
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-900 dark:text-gray-100">{selectedOrder.deliveryAddress}</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.deliveryLga}, {selectedOrder.deliveryState}</p>
                  {selectedOrder.deliveryNote && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        <strong>Note:</strong> {selectedOrder.deliveryNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Date */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Ordered on {formatDate(selectedOrder.orderDate)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    data-testid="button-cancel-order"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeliveryConfirm}
                    disabled={isDelivering}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors"
                    data-testid="button-mark-delivered"
                  >
                    {isDelivering ? 'Processing...' : 'I have delivered'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Modal - Centered */}
          <div className="hidden md:block w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                data-testid="button-close-modal-desktop"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Order Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Status</h3>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-full font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Ordered on {formatDate(selectedOrder.orderDate)}</span>
                  </div>
                </div>

                {/* Buyer Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Buyer Information
                  </h3>
                  <div className="space-y-3">
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}
                    </p>
                    {selectedOrder.buyer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{selectedOrder.buyer.phone}</span>
                      </div>
                    )}
                    {selectedOrder.buyer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{selectedOrder.buyer.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.deliveryAddress}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.deliveryLga}, {selectedOrder.deliveryState}</p>
                    {selectedOrder.deliveryNote && (
                      <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Note:</strong> {selectedOrder.deliveryNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Crop Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Crop Details</h3>
                  <div className="flex gap-3">
                    <img
                      src={selectedOrder.crop.plant.imageUrl}
                      alt={selectedOrder.crop.plant.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{selectedOrder.crop.plant.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedOrder.crop.plant.category}</p>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.quantityOrdered} {selectedOrder.crop.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Price per unit:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">₦{selectedOrder.pricePerUnit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">₦{selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery fee:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {selectedOrder.deliveryFee === 0 ? 'Free' : `₦${selectedOrder.deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">₦{selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  data-testid="button-cancel-order-desktop"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeliveryConfirm}
                  disabled={isDelivering}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-medium transition-colors"
                  data-testid="button-mark-delivered-desktop"
                >
                  {isDelivering ? 'Processing...' : 'I have delivered'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}