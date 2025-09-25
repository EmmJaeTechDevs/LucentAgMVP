import React from "react";
import { Bell, MapPin, Clock, Leaf, X } from "lucide-react";

interface Product {
  id: number;
  name: string;
  farm: string;
  price?: string;
  unit?: string;
  image: string;
  stockLeft?: string;
  location?: string;
  harvestDate?: string;
  availableQuantity?: string;
}

interface HarvestingSoonModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onNotifyMe: (product: Product) => void;
}

export function HarvestingSoonModal({
  product,
  isOpen,
  onClose,
  onNotifyMe,
}: HarvestingSoonModalProps) {
  if (!isOpen || !product) return null;

  const handleNotifyMe = () => {
    onNotifyMe(product);
    onClose();
  };

  const getImageSrc = () => {
    if (typeof product.image === "string") {
      // Handle URLs or relative paths
      if (product.image.startsWith("http") || product.image.startsWith("/")) {
        return product.image;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md mx-4 max-h-[90vh] md:max-h-[80vh] overflow-y-auto scrollbar-hide md:scrollbar-styled">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all"
          data-testid="button-close-harvesting-modal-x"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* Product Image */}
        <div className="relative h-64">
          {getImageSrc() ? (
            <img
              src={getImageSrc()!}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl">
              {product.image}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Header with farm info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm">{product.farm}</span>
            </div>
          </div>

          {/* Product Name */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {product.name}
          </h2>

          {/* Available Quantity */}
          {product.availableQuantity && (
            <p className="text-gray-600 mb-6">{product.availableQuantity}</p>
          )}

          {/* Location */}
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">
              {product.location || "Grown in Lagos, Nigeria"}
            </span>
          </div>

          {/* Harvest Date */}
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">
              {product.harvestDate || "Ready by September 23, 2025"}
            </span>
          </div>

          {/* Notify Me Button */}
          <button
            onClick={handleNotifyMe}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors mb-4"
            data-testid="button-notify-me"
          >
            <Bell className="w-5 h-5" />
            Notify Me When Ready
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-600 py-2 text-center font-medium"
            data-testid="button-close-harvesting-modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
