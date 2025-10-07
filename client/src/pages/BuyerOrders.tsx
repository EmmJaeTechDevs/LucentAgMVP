import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, MapPin, Phone, User, Calendar, X } from "lucide-react";
import { Link } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { BaseUrl } from "../../../Baseconfig";

interface OrderResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

interface Order {
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
  farmer: {
    id: string;
    username: string | null;
    userType: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    isVerified: boolean;
  };
}

export function BuyerOrders() {
  // Validate buyer session (only buyers can view orders)
  useSessionValidation("buyer");
  
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "pending" | "confirmed" | "delivered" | "cancelled">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to get buyer token from session storage
  const getBuyerToken = (): string | null => {
    try {
      const buyerSession = sessionStorage.getItem("buyerSession");
      if (buyerSession) {
        const encryptedSessionData = JSON.parse(buyerSession);
        const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
        const now = new Date().getTime();
        
        // Check if session is still valid and has token
        if (sessionData.token && now < sessionData.expiry) {
          return sessionData.token;
        }
      }
      return null;
    } catch (error) {
      console.error('Error retrieving buyer token:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = getBuyerToken();
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch(`${BaseUrl}/api/buyer/orders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }

        const ordersData: OrderResponse = await response.json();
        setOrderResponse(ordersData);
      } catch (error) {
        console.error('Error loading orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to load orders');
        setOrderResponse(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <Package className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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

  const handleOrderClick = (orderId: string) => {
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

  const orders = orderResponse?.orders || [];
  const filteredOrders = selectedFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const filterTabs = [
    { key: "all" as const, label: "All", count: orders.length },
    { key: "pending" as const, label: "Pending", count: orders.filter(o => o.status === "pending").length },
    { key: "confirmed" as const, label: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
    { key: "delivered" as const, label: "Delivered", count: orders.filter(o => o.status === "delivered").length },
    { key: "cancelled" as const, label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-w-md mx-auto sm:max-w-none">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/buyer-home">
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" data-testid="button-back" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Orders</h1>
        </div>
        <HamburgerMenu userType="buyer" />
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === tab.key
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              data-testid={`filter-${tab.key}`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex gap-4 mb-3">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                Failed to Load Orders
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                data-testid="button-retry"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {selectedFilter === "all" ? "No Orders Yet" : `No ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)} Orders`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              {selectedFilter === "all" 
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${selectedFilter} orders at the moment.`
              }
            </p>
          </div>
        )}

        {/* Mobile Orders List */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="md:hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-semibold text-xs">Date</th>
                    <th className="text-left py-3 px-3 text-gray-600 dark:text-gray-400 font-semibold text-xs">Crop Name</th>
                    <th className="text-right py-3 px-3 text-gray-600 dark:text-gray-400 font-semibold text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      data-testid={`order-${order.id}`}
                    >
                      <td className="py-3 px-3 text-gray-900 dark:text-gray-100 text-sm">
                        {new Date(order.orderDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={order.crop.plant.imageUrl}
                            alt={order.crop.plant.name}
                            className="w-8 h-8 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                            }}
                          />
                          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{order.crop.plant.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-green-600 dark:text-green-400 text-sm">
                        ₦{order.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Desktop Orders Table */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Date Ordered</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Crop Name</th>
                    <th className="text-left py-4 px-4 text-gray-600 dark:text-gray-400 font-semibold">Farmer</th>
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
                        {order.farmer.firstName} {order.farmer.lastName}
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
          </div>
        )}

        {/* Pagination Info */}
        {orderResponse && orderResponse.totalPages > 1 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {orderResponse.page} of {orderResponse.totalPages} 
              ({orderResponse.total} total orders)
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  data-testid="button-close-modal"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Crop Information */}
                <div className="flex items-start gap-4">
                  <img
                    src={selectedOrder.crop.plant.imageUrl}
                    alt={selectedOrder.crop.plant.name}
                    className="w-24 h-24 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedOrder.crop.plant.name}
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.id.slice(0, 12)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
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
                      <span className="text-gray-600 dark:text-gray-400">Delivery Fee:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">
                        {selectedOrder.deliveryFee === 0 ? 'Free' : `₦${selectedOrder.deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">₦{selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Delivery Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-gray-100">{selectedOrder.deliveryAddress}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.deliveryLga}, {selectedOrder.deliveryState}</p>
                    {selectedOrder.deliveryNote && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Note:</strong> {selectedOrder.deliveryNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Farmer Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Farmer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        {selectedOrder.farmer.firstName} {selectedOrder.farmer.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">{selectedOrder.farmer.phone}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Farm Location:</strong> {selectedOrder.crop.state}, {selectedOrder.crop.lga}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        <strong>Description:</strong> {selectedOrder.crop.description}
                      </p>
                      {selectedOrder.deliveredAt && (
                        <p className="text-green-600 dark:text-green-400 mt-2">
                          <strong>Delivered:</strong> {formatDate(selectedOrder.deliveredAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}