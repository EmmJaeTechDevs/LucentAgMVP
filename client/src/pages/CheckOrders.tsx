import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Leaf, ChevronRight } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";

interface Order {
  id: string;
  crop: string;
  quantity: string;
  buyerName: string;
  status: "pending" | "completed";
}

export function CheckOrders() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [orders, setOrders] = useState<any[]>([]);
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

        const ordersData = await response.json();
        console.log('=== FARMER ORDERS API RESPONSE ===');
        console.log('Full Farmer Orders Response:', ordersData);
        console.log('Type of response:', typeof ordersData);
        console.log('Is Array:', Array.isArray(ordersData));
        console.log('Response length:', ordersData?.length);
        console.log('=====================================');
        
        // Set the raw orders data without any processing for now
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error loading farmer orders:', error);
        setError(error instanceof Error ? error.message : 'Failed to load orders');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFarmerOrders();
  }, []);
  
  // For now, using sample data structure until we see the actual API response
  const sampleOrders: Order[] = [
    {
      id: "1",
      crop: "Tomatoes",
      quantity: "10 Bags",
      buyerName: "Benita E.",
      status: "pending"
    },
    {
      id: "2", 
      crop: "Rice",
      quantity: "5 Bags",
      buyerName: "Simeon A.",
      status: "pending"
    }
  ];

  const handleGoBack = () => {
    setLocation("/farmer-dashboard");
  };

  const handleOrderClick = (orderId: string) => {
    console.log("Order clicked:", orderId);
    // Navigate to order details page
  };

  // Use sample data for display while we debug the API response
  const displayOrders = sampleOrders;
  const pendingOrders = displayOrders.filter(order => order.status === "pending");
  const completedOrders = displayOrders.filter(order => order.status === "completed");
  const currentOrders = activeTab === "pending" ? pendingOrders : completedOrders;

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
                Here are the orders from buyers
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
            </div>
          )}

          {/* API Response Debug Info */}
          {!isLoading && !error && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                🐛 API Debug Info
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Raw orders count: {orders?.length || 0}
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Check browser console for full response
              </p>
            </div>
          )}

          {/* Tab buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
              data-testid="tab-pending"
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
                activeTab === "completed"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
              data-testid="tab-completed"
            >
              Completed
            </button>
          </div>

          {/* New orders notification */}
          {!isLoading && activeTab === "pending" && pendingOrders.length > 0 && (
            <div className="bg-green-100 dark:bg-green-900/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-20">
                <Leaf className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <div className="relative z-10">
                <p className="text-green-800 dark:text-green-400 font-semibold text-lg">
                  You have {pendingOrders.length} new order{pendingOrders.length > 1 ? 's' : ''}!
                </p>
              </div>
            </div>
          )}

          {/* Orders list */}
          {!isLoading && (
            <div className="space-y-4">
              {currentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No {activeTab} orders yet
                  </p>
                </div>
              ) : (
                currentOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all text-left"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                            {order.crop} - {order.quantity}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Ordered by {order.buyerName}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
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
        <div className="w-full max-w-4xl mx-auto">
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
                Here are the orders from buyers
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
              </div>
            )}

            {/* API Response Debug Info */}
            {!isLoading && !error && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2 text-lg">
                  🐛 API Debug Info
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Raw orders count: {orders?.length || 0}
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Check browser console for full response
                </p>
              </div>
            )}

            {/* Tab buttons */}
            {!isLoading && (
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-2 mb-8 max-w-md">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`flex-1 py-4 px-8 rounded-full text-lg font-medium transition-colors ${
                    activeTab === "pending"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                  data-testid="tab-pending-desktop"
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex-1 py-4 px-8 rounded-full text-lg font-medium transition-colors ${
                    activeTab === "completed"
                      ? "bg-green-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                  data-testid="tab-completed-desktop"
                >
                  Completed
                </button>
              </div>
            )}

            {/* New orders notification */}
            {!isLoading && activeTab === "pending" && pendingOrders.length > 0 && (
              <div className="bg-green-100 dark:bg-green-900/20 rounded-3xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-6 right-6 opacity-20">
                  <Leaf className="w-20 h-20 text-green-600 dark:text-green-400" />
                </div>
                <div className="relative z-10">
                  <p className="text-green-800 dark:text-green-400 font-semibold text-xl">
                    You have {pendingOrders.length} new order{pendingOrders.length > 1 ? 's' : ''}!
                  </p>
                </div>
              </div>
            )}

            {/* Orders list */}
            {!isLoading && (
              <div className="space-y-4">
                {currentOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Leaf className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xl">
                      No {activeTab} orders yet
                    </p>
                  </div>
                ) : (
                  currentOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
                      className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-left hover:scale-[1.02]"
                      data-testid={`order-${order.id}-desktop`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                            <Leaf className="w-7 h-7 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xl">
                              {order.crop} - {order.quantity}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                              Ordered by {order.buyerName}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}