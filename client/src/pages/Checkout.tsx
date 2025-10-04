import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit3, MapPin, FileText, ChevronRight, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { DeliveryAddressModal } from "../components/DeliveryAddressModal";
import { DeliveryNoteModal } from "../components/DeliveryNoteModal";
import { OrderSuccessModal } from "../components/OrderSuccessModal";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@shared/schema";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";


export function Checkout() {
  // Validate buyer session (only buyers can checkout)
  useSessionValidation("buyer");
  
  const [, navigate] = useLocation();
  const { cartItems, clearCart, isLoading } = useCart();
  const [hasFetched, setHasFetched] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryLga, setDeliveryLga] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Track when cart has been fetched to show proper states
  useEffect(() => {
    if (!isLoading) {
      setHasFetched(true);
    }
  }, [isLoading]);

  const subtotal: number = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee: number = 0;
  const total: number = subtotal + deliveryFee;

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

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !deliveryState || !deliveryLga) {
      return;
    }

    const buyerToken = getBuyerToken();
    if (!buyerToken) {
      alert('Please log in again to place an order.');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Send order for each cart item
      for (const item of cartItems) {
        const orderData = {
          cropId: item.cropId,
          quantityOrdered: item.quantity,
          deliveryFee: deliveryFee,
          deliveryAddress: deliveryAddress,
          deliveryState: deliveryState,
          deliveryLga: deliveryLga,
          deliveryNote: deliveryNote || ""
        };

        console.log('Placing order with data:', orderData);

        const response = await fetch(`${BaseUrl}/api/buyer/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${buyerToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(orderData)
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Order API Error:', response.status, response.statusText, errorText);
          throw new Error(`Failed to place order for ${item.plantName}: ${response.status} ${response.statusText}`);
        }

        const result = await response.json().catch(() => ({}));
        console.log('Order placed successfully:', result);
      }
      
      // Show success modal after all orders are placed
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSuccessModalClose = async () => {
    // Clear cart when success modal closes
    await clearCart();
    setIsSuccessModalOpen(false);
    // Navigate to buyer home after successful order
    navigate('/buyer-home');
  };

  const handleAddressSet = (address: string) => {
    setDeliveryAddress(address);
    setIsAddressModalOpen(false);
  };

  const handleNoteSet = (note: string) => {
    setDeliveryNote(note);
    setIsNoteModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto sm:max-w-none">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <ArrowLeft className="w-6 h-6 text-gray-700" data-testid="button-back" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
        </div>
        <HamburgerMenu userType="buyer" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 pb-32 md:pb-6 md:max-w-4xl md:mx-auto">
        {/* Empty Cart State */}
        {hasFetched && !isLoading && cartItems.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some fresh crops to your cart before checking out</p>
            <div className="space-y-3">
              <Link href="/buyer-home">
                <button className="w-full sm:w-auto px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition-colors">
                  Continue Shopping
                </button>
              </Link>
              <Link href="/cart">
                <button className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors ml-0 sm:ml-3">
                  View Cart
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 mb-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Items */}
        {hasFetched && !isLoading && cartItems.length > 0 && (
          <>
            <div className="space-y-4 mb-6 sm:mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.plantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-green-100 text-green-600">
                          🌱
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.plantName}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.quantity} {item.unit}</p>
                      <p className="font-bold text-gray-900">₦{item.totalPrice.toLocaleString()}</p>
                      {item.farmName && (
                        <p className="text-gray-500 text-xs mt-1">From {item.farmName}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Items */}
            <Link href="/cart">
              <div className="flex items-center gap-3 py-4 border-b border-gray-200 mb-6 sm:mb-8">
                <Edit3 className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Edit Items</span>
              </div>
            </Link>

            {/* Delivery Information */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
          
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="w-full flex items-center justify-between py-4 border-b border-gray-200 mb-4"
                data-testid="button-set-address"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 text-left">
                    {deliveryAddress || "Set Delivery Address"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Delivery State */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery State *</label>
                <input
                  type="text"
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  placeholder="Enter delivery state (e.g., Lagos)"
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  data-testid="input-delivery-state"
                  required
                />
              </div>

              {/* Delivery LGA */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Local Government Area (LGA) *</label>
                <input
                  type="text"
                  value={deliveryLga}
                  onChange={(e) => setDeliveryLga(e.target.value)}
                  placeholder="Enter LGA (e.g., Lagos Island)"
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  data-testid="input-delivery-lga"
                  required
                />
              </div>

              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="w-full flex items-center justify-between py-4 border-b border-gray-200"
                data-testid="button-add-note"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 text-left">
                    {deliveryNote ? "Edit Delivery Note" : "Add Delivery Note (Optional)"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub-total ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</span>
                  <span className="text-gray-900">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-green-600 font-medium">{deliveryFee === 0 ? 'FREE' : `₦${deliveryFee.toLocaleString()}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Place Order Button */}
      {hasFetched && !isLoading && cartItems.length > 0 && (
        <div className="fixed md:static bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-200 max-w-md mx-auto sm:max-w-none md:max-w-4xl md:mt-6">
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
            data-testid="button-place-order"
            disabled={!deliveryAddress || !deliveryState || !deliveryLga || isPlacingOrder}
          >
            {isPlacingOrder ? 'Placing Order...' : `Place Order - ₦${total.toLocaleString()}`}
          </button>
          {(!deliveryAddress || !deliveryState || !deliveryLga) && (
            <p className="text-red-600 text-sm text-center mt-2">
              Please fill in all required delivery information to continue
            </p>
          )}
        </div>
      )}

      {/* Modals */}
      <DeliveryAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSet={handleAddressSet}
        currentAddress={deliveryAddress}
      />

      <DeliveryNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onNoteSet={handleNoteSet}
        currentNote={deliveryNote}
      />

      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
      />
    </div>
  );
}