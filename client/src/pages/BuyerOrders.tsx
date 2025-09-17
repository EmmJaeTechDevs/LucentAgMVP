import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { HamburgerMenu } from "@/components/HamburgerMenu";

interface Order {
  id: string;
  cropName: string;
  farmName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  orderDate: string;
  deliveryAddress: string;
  deliveryState: string;
  deliveryLga: string;
  deliveryNote?: string;
  estimatedDelivery?: string;
}

export function BuyerOrders() {
  // Validate buyer session (only buyers can view orders)
  useSessionValidation("buyer");
  
  const [orders, setOrders] = useState<Order[]>([]);
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

        const ordersData = await response.json();
        console.log('Orders API Response:', ordersData);
        
        // Set the orders data directly since the API returns an array
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to load orders');
        setOrders([]);
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

  const filteredOrders = selectedFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const filterTabs = [
    { key: "all" as const, label: "All", count: orders.length },
    { key: "pending" as const, label: "Pending", count: orders.filter(o => o.status === "pending").length },
    { key: "confirmed" as const, label: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
    { key: "delivered" as const, label: "Delivered", count: orders.filter(o => o.status === "delivered").length },
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
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                data-testid={`order-${order.id}`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {order.cropName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {order.farmName} • Order #{order.id}
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {order.quantity} {order.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      ₦{order.totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatDate(order.orderDate)}
                    </span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {order.status === "delivered" ? "Delivered:" : "Est. Delivery:"}
                      </span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delivery Address */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {order.deliveryAddress}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {order.deliveryLga}, {order.deliveryState}
                      </p>
                    </div>
                  </div>
                  {order.deliveryNote && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Note: {order.deliveryNote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {selectedFilter === "all" ? "No orders yet" : `No ${selectedFilter} orders`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {selectedFilter === "all" 
                ? "Start shopping to see your orders here"
                : `You don't have any ${selectedFilter} orders at the moment`
              }
            </p>
            {selectedFilter === "all" && (
              <Link href="/buyer-home">
                <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition-colors">
                  Start Shopping
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}