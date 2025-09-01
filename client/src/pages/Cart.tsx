import React, { useState } from "react";
import { ArrowLeft, Trash2, Minus, Plus } from "lucide-react";
import { Link } from "wouter";
import TomatoesImage from "@assets/image 15.png";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  pricePerUnit: string;
  image: string;
}

export function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Tomatoes",
      quantity: 8,
      price: 16000,
      pricePerUnit: "per Basket",
      image: TomatoesImage,
    },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

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
      <div className="p-6">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {typeof item.image === 'string' && item.image.startsWith('/') ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {item.image}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.quantity} Baskets</p>
                    <p className="font-bold text-gray-900">₦{item.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Remove</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-10 h-10 bg-green-700 hover:bg-green-800 rounded-lg flex items-center justify-center transition-colors"
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center" data-testid={`quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-10 h-10 bg-green-700 hover:bg-green-800 rounded-lg flex items-center justify-center transition-colors"
                      data-testid={`button-increase-${item.id}`}
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
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
          <Link href="/checkout">
            <button
              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              data-testid="button-proceed-checkout"
            >
              Proceed to Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}