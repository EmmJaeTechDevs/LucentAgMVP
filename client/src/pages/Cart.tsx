import React, { useEffect } from "react";
import { ArrowLeft, Trash2, Minus, Plus } from "lucide-react";
import { Link } from "wouter";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useCart } from "@/hooks/useCart";


export function Cart() {
  // Validate buyer session (only buyers can have shopping carts)
  useSessionValidation("buyer");

  const { cartItems, updateQuantity, removeItem, clearCart, isLoading, fetchCartItems } = useCart();

  // Load cart items when component mounts
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Calculate total from cart items (totalPrice is already a number)
  const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Handle quantity update
  const handleUpdateQuantity = async (item: any, change: number) => {
    const newQuantity = Math.max(1, item.quantity + change);
    await updateQuantity(item.id, newQuantity);
  };

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to remove all items from your cart?")) {
      await clearCart();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
        <Link href="/buyer-home">
          <ArrowLeft className="w-6 h-6 text-gray-700" data-testid="button-back" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Cart</h1>
      </div>

      {/* Cart Items */}
      <div className="p-6 pb-40">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-400 text-sm mb-6">Add some fresh crops to get started!</p>
            <Link href="/buyer-home">
              <button className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-medium transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
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
                      <p className="text-gray-500 text-xs">From {item.farmName}</p>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                    data-testid={`button-remove-${item.id}`}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Remove</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className="w-10 h-10 bg-green-700 hover:bg-green-800 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      data-testid={`button-decrease-${item.id}`}
                      disabled={isLoading}
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center" data-testid={`quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className="w-10 h-10 bg-green-700 hover:bg-green-800 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                      data-testid={`button-increase-${item.id}`}
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proceed to Checkout Button */}
      {cartItems.length > 0 && !isLoading && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</span>
              <span className="text-2xl font-bold text-gray-900">₦{total.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500">Taxes and shipping calculated at checkout</p>
          </div>
          
          <div className="space-y-3">
            <Link href="/checkout">
              <button
                className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
                data-testid="button-proceed-checkout"
                disabled={isLoading}
              >
                Proceed to Checkout - ₦{total.toLocaleString()}
              </button>
            </Link>
            
            <button
              onClick={handleClearCart}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
              data-testid="button-clear-cart"
              disabled={isLoading}
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}