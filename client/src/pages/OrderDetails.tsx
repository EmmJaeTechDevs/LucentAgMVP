import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";

export function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

        console.log('=== MAKING ORDER DETAILS API REQUEST ===');
        console.log('Order ID:', orderId);
        console.log('API URL:', `https://lucent-ag-api-damidek.replit.app/api/farmer/orders/${orderId}`);

        const response = await fetch(`https://lucent-ag-api-damidek.replit.app/api/farmer/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log('=== API RESPONSE STATUS ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', response.headers);

        if (!response.ok) {
          throw new Error(`Failed to fetch order details: ${response.status} ${response.statusText}`);
        }

        const orderData = await response.json();
        console.log('=== FULL ORDER DETAILS API RESPONSE ===');
        console.log('Response Data:', orderData);
        console.log('Data Type:', typeof orderData);
        console.log('Keys:', Object.keys(orderData));
        console.log('=====================================');
        
        setSuccess(true);
      } catch (error) {
        console.error('=== API ERROR ===');
        console.error('Error loading order details:', error);
        console.error('================');
        setError(error instanceof Error ? error.message : 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId]);

  const handleGoBack = () => {
    setLocation("/check-orders");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Order Details
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Order ID: {orderId}
          </p>

          {isLoading && (
            <div>
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading order details...
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Check console for API request details
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                API Error
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
                ✅ API Request Successful!
              </h3>
              <p className="text-green-600 dark:text-green-300 mb-2">
                Order details loaded successfully.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check the browser console to see the full response structure.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}