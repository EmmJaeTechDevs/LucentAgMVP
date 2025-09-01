import React, { useState } from "react";
import { ArrowLeft, Edit3, MapPin, FileText, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import TomatoesImage from "@assets/image 15.png";
import { DeliveryAddressModal } from "../components/DeliveryAddressModal";
import { DeliveryNoteModal } from "../components/DeliveryNoteModal";
import { OrderSuccessModal } from "../components/OrderSuccessModal";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  pricePerUnit: string;
  image: string;
}

export function Checkout() {
  const [cartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Tomatoes",
      quantity: 8,
      price: 16000,
      pricePerUnit: "per Basket",
      image: TomatoesImage,
    },
  ]);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsSuccessModalOpen(true);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
        <Link href="/cart">
          <ArrowLeft className="w-6 h-6 text-gray-700" data-testid="button-back" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Checkout</h1>
      </div>

      {/* Content */}
      <div className="p-6 pb-32">
        {/* Order Items */}
        <div className="space-y-4 mb-8">
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
            </div>
          ))}
        </div>

        {/* Edit Items */}
        <Link href="/cart">
          <div className="flex items-center gap-3 py-4 border-b border-gray-200 mb-8">
            <Edit3 className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900 font-medium">Edit Items</span>
          </div>
        </Link>

        {/* Delivery Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h2>
          
          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="w-full flex items-center justify-between py-4 border-b border-gray-200 mb-4"
            data-testid="button-set-address"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">
                {deliveryAddress || "Set Delivery Address"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => setIsNoteModalOpen(true)}
            className="w-full flex items-center justify-between py-4 border-b border-gray-200"
            data-testid="button-add-note"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">
                {deliveryNote ? "Edit Delivery Note" : "Add Delivery Note"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Sub-total</span>
              <span className="text-gray-900">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900">₦{deliveryFee}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-semibold text-gray-900">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
          data-testid="button-place-order"
        >
          Place Order
        </button>
      </div>

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
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}