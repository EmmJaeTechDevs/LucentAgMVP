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
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('=== RAW SERVER RESPONSE ===');
        console.log('Full Orders API Response:', ordersData);
        console.log('Type of response:', typeof ordersData);
        console.log('Is Array:', Array.isArray(ordersData));
        console.log('Response length:', ordersData?.length);
        console.log('================================');
        
        // Set the raw orders data without any processing
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-w-md mx-auto sm:max-w-none">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/buyer-home">
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" data-testid="button-back" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Orders - DEBUG MODE</h1>
        </div>
        <HamburgerMenu userType="buyer" />
      </div>

      {/* Content - DEBUG MODE */}
      <div className="p-4 sm:p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders from server...</p>
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

        {/* RAW DATA DISPLAY FOR DEBUGGING */}
        {!isLoading && !error && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🐛 Raw Server Response Debug Info
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {JSON.stringify(orders, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                📊 Debug Summary:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Total orders: {orders?.length || 0}</li>
                <li>• Data type: {typeof orders}</li>
                <li>• Is array: {Array.isArray(orders) ? 'Yes' : 'No'}</li>
                <li>• Check browser console for detailed logs</li>
                <li>• API Endpoint: /api/buyer/orders</li>
              </ul>
            </div>

            {/* Show first order structure if available */}
            {orders && orders.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                  📋 First Order Structure:
                </h4>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {JSON.stringify(orders[0], null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}