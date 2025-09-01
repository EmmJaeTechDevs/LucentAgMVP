import React, { useState } from "react";
import { X, MapPin } from "lucide-react";

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSet: (address: string) => void;
  currentAddress: string;
}

export function DeliveryAddressModal({ isOpen, onClose, onAddressSet, currentAddress }: DeliveryAddressModalProps) {
  const [address, setAddress] = useState(currentAddress);

  if (!isOpen) return null;

  const handleSave = () => {
    onAddressSet(address);
  };

  const handleUseCurrentLocation = () => {
    // In a real app, this would get the user's current location
    onAddressSet("Your current location");
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Delivery Address</h1>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          data-testid="button-close-address-modal"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Address Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter a new address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            data-testid="input-delivery-address"
          />
        </div>

        {/* Use Current Location */}
        <button
          onClick={handleUseCurrentLocation}
          className="w-full flex items-center gap-3 py-4 text-left hover:bg-gray-50 rounded-xl transition-colors"
          data-testid="button-use-current-location"
        >
          <MapPin className="w-5 h-5 text-green-600" />
          <span className="text-green-600 font-medium">Use your current location</span>
        </button>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!address.trim()}
          className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
          data-testid="button-save-address"
        >
          Save Address
        </button>
      </div>
    </div>
  );
}