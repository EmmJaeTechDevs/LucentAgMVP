import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Leaf, ChevronRight } from "lucide-react";

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
  
  // Sample orders data
  const orders: Order[] = [
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

  const pendingOrders = orders.filter(order => order.status === "pending");
  const completedOrders = orders.filter(order => order.status === "completed");
  const currentOrders = activeTab === "pending" ? pendingOrders : completedOrders;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">
                Your Orders
              </h1>
              <p className="text-gray-600 text-sm">
                Here are the orders from buyers
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-colors ${
                activeTab === "pending"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
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
                  : "text-gray-600 hover:text-gray-800"
              }`}
              data-testid="tab-completed"
            >
              Completed
            </button>
          </div>

          {/* New orders notification */}
          {activeTab === "pending" && pendingOrders.length > 0 && (
            <div className="bg-green-100 rounded-2xl p-4 mb-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-20">
                <Leaf className="w-16 h-16 text-green-600" />
              </div>
              <div className="relative z-10">
                <p className="text-green-800 font-semibold text-lg">
                  You have {pendingOrders.length} new order{pendingOrders.length > 1 ? 's' : ''}!
                </p>
              </div>
            </div>
          )}

          {/* Orders list */}
          <div className="space-y-4">
            {currentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">
                  No {activeTab} orders yet
                </p>
              </div>
            ) : (
              currentOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {order.crop} - {order.quantity}
                        </h3>
                        <p className="text-gray-600 text-sm">
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
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-12">
            <button
              onClick={handleGoBack}
              className="p-3 -ml-3 hover:bg-gray-100 rounded-xl transition-colors"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-8 h-8 text-gray-900" />
            </button>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Your Orders
              </h1>
              <p className="text-gray-600 text-lg">
                Here are the orders from buyers
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Tab buttons */}
            <div className="flex bg-gray-100 rounded-full p-2 mb-8 max-w-md">
              <button
                onClick={() => setActiveTab("pending")}
                className={`flex-1 py-4 px-8 rounded-full text-lg font-medium transition-colors ${
                  activeTab === "pending"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:text-gray-800"
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
                    : "text-gray-600 hover:text-gray-800"
                }`}
                data-testid="tab-completed-desktop"
              >
                Completed
              </button>
            </div>

            {/* New orders notification */}
            {activeTab === "pending" && pendingOrders.length > 0 && (
              <div className="bg-green-100 rounded-3xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-6 right-6 opacity-20">
                  <Leaf className="w-20 h-20 text-green-600" />
                </div>
                <div className="relative z-10">
                  <p className="text-green-800 font-semibold text-xl">
                    You have {pendingOrders.length} new order{pendingOrders.length > 1 ? 's' : ''}!
                  </p>
                </div>
              </div>
            )}

            {/* Orders list */}
            <div className="space-y-4">
              {currentOrders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Leaf className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xl">
                    No {activeTab} orders yet
                  </p>
                </div>
              ) : (
                currentOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="w-full bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all text-left hover:scale-[1.02]"
                    data-testid={`order-${order.id}-desktop`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                          <Leaf className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-xl">
                            {order.crop} - {order.quantity}
                          </h3>
                          <p className="text-gray-600 text-lg">
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
          </div>
        </div>
      </div>
    </div>
  );
}