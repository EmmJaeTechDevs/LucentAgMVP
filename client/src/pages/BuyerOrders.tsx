import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, MapPin, Phone, User, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { HamburgerMenu } from "@/components/HamburgerMenu";

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

        const response = await fetch('https://lucent-ag-api-damidek.replit.app/api/buyer/orders', {
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

        {/* Orders List */}
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                data-testid={`order-${order.id}`}
              >
                {/* Order Header with Crop Image */}
                <div className="p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={order.crop.plant.imageUrl}
                        alt={order.crop.plant.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                        }}
                      />
                      <div className={`absolute -top-1 -right-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                        {order.crop.plant.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <User className="w-4 h-4" />
                        <span>{order.farmer.firstName} {order.farmer.lastName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Order #{order.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {order.quantityOrdered} {order.crop.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Price per unit:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          ₦{order.pricePerUnit.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          ₦{order.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Delivery:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {order.deliveryFee === 0 ? 'Free' : `₦${order.deliveryFee.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₦{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Delivery Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900 dark:text-gray-100">
                      {order.deliveryAddress}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {order.deliveryLga}, {order.deliveryState}
                    </p>
                    {order.deliveryNote && (
                      <div className="flex items-start gap-2 mt-2">
                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Note: {order.deliveryNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Farm Information */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Farm Details
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Location:</strong> {order.crop.state}, {order.crop.lga}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong>Description:</strong> {order.crop.description}
                    </p>
                    {order.deliveredAt && (
                      <p className="text-green-600 dark:text-green-400">
                        <strong>Delivered:</strong> {formatDate(order.deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
}