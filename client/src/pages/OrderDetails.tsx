import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, User, Package, MapPin, Calendar, Phone, Mail, CheckCircle, Clock, XCircle } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";

interface OrderDetailsResponse {
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
    homeStreet: string;
    homeHouseNumber: string;
    homeAdditionalDesc: string;
    homeBusStop: string;
    homeLocalGov: string;
    homePostcode: string;
    homeState: string;
    homeCountry: string;
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

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
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
    const loadOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const token = getFarmerToken();
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch(`https://lucent-ag-api-damidek.replit.app/api/farmer/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order details: ${response.status} ${response.statusText}`);
        }

        const orderData: OrderDetailsResponse = await response.json();
        console.log('=== ORDER DETAILS API RESPONSE ===');
        console.log('Full Order Details Response:', orderData);
        console.log('=====================================');
        
        setOrderDetails(orderData);
      } catch (error) {
        console.error('Error loading order details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load order details');
        setOrderDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId]);

  const handleGoBack = () => {
    setLocation("/check-orders");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5" />;
      case "confirmed": return <Package className="w-5 h-5" />;
      case "delivered": return <CheckCircle className="w-5 h-5" />;
      case "cancelled": return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Failed to Load Order
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="px-6 pt-16 pb-8">
          <div className="max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={handleGoBack}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
              </button>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Order Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Order #{orderDetails?.id?.slice(0, 8) || '...'}
                </p>
              </div>
            </div>

            {/* Order Status */}
            {orderDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">Order Status</h2>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderDetails.status)}`}>
                    {getStatusIcon(orderDetails.status)}
                    {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Ordered on {formatDate(orderDetails.orderDate)}
                </p>
                {orderDetails.deliveredAt && (
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Delivered on {formatDate(orderDetails.deliveredAt)}
                  </p>
                )}
              </div>
            )}

            {/* Crop Information */}
            {orderDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Crop Details</h2>
              <div className="flex gap-3">
                <img
                  src={orderDetails.crop.plant.imageUrl}
                  alt={orderDetails.crop.plant.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {orderDetails.crop.plant.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {orderDetails.crop.description}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Category: {orderDetails.crop.plant.category}
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Order Summary */}
            {orderDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {orderDetails.quantityOrdered} {orderDetails.crop.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Price per unit:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    ₦{orderDetails.pricePerUnit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    ₦{orderDetails.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery fee:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {orderDetails.deliveryFee === 0 ? 'Free' : `₦${orderDetails.deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      ₦{orderDetails.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Buyer Information */}
            {orderDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Buyer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {orderDetails.buyer.firstName} {orderDetails.buyer.lastName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">{orderDetails.buyer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">{orderDetails.buyer.email}</span>
                </div>
              </div>
            </div>
            )}

            {/* Delivery Information */}
            {orderDetails && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Information
              </h2>
              <div className="space-y-2">
                <p className="text-gray-900 dark:text-gray-100">{orderDetails.deliveryAddress}</p>
                <p className="text-gray-600 dark:text-gray-400">{orderDetails.deliveryLga}, {orderDetails.deliveryState}</p>
                {orderDetails.deliveryNote && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      <strong>Note:</strong> {orderDetails.deliveryNote}
                    </p>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleGoBack}
              className="p-3 -ml-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-8 h-8 text-gray-900 dark:text-gray-100" />
            </button>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Order Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Order #{orderDetails?.id || '...'}
              </p>
            </div>
          </div>

          {orderDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Order Status</h2>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getStatusColor(orderDetails.status)}`}>
                    {getStatusIcon(orderDetails.status)}
                    {orderDetails?.status ? orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1) : 'Loading...'}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span>Ordered on {formatDate(orderDetails.orderDate)}</span>
                </div>
                {orderDetails.deliveredAt && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>Delivered on {formatDate(orderDetails.deliveredAt)}</span>
                  </div>
                )}
              </div>

              {/* Crop Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Crop Details</h2>
                <div className="flex gap-6">
                  <img
                    src={orderDetails.crop.plant.imageUrl}
                    alt={orderDetails.crop.plant.name}
                    className="w-24 h-24 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=400&auto=format&fit=crop';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {orderDetails.crop.plant.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {orderDetails.crop.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{orderDetails.crop.plant.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Growth Duration:</span>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{orderDetails.crop.plant.growthDuration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Buyer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {orderDetails.buyer.firstName} {orderDetails.buyer.lastName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{orderDetails.buyer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{orderDetails.buyer.email}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Home Address</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>{orderDetails.buyer.homeHouseNumber} {orderDetails.buyer.homeStreet}</p>
                      <p>{orderDetails.buyer.homeAdditionalDesc}</p>
                      <p>{orderDetails.buyer.homeBusStop}, {orderDetails.buyer.homeLocalGov}</p>
                      <p>{orderDetails.buyer.homeState}, {orderDetails.buyer.homeCountry}</p>
                      <p>Postcode: {orderDetails.buyer.homePostcode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {orderDetails.quantityOrdered} {orderDetails.crop.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price per unit:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      ₦{orderDetails.pricePerUnit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      ₦{orderDetails.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery fee:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {orderDetails.deliveryFee === 0 ? 'Free' : `₦${orderDetails.deliveryFee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total:</span>
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        ₦{orderDetails.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Delivery Information
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">{orderDetails.deliveryAddress}</p>
                  <p className="text-gray-600 dark:text-gray-400">{orderDetails.deliveryLga}, {orderDetails.deliveryState}</p>
                  {orderDetails.deliveryNote && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-400">
                        <strong>Note:</strong> {orderDetails.deliveryNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}