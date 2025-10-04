import React, { useState } from "react";
import { X, ShoppingCart, Truck, Minus, Plus, Leaf } from "lucide-react";

interface Product {
  id: number;
  name: string;
  farm: string;
  price: string;
  unit: string;
  image: string;
  stockLeft: string;
}

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductDetailsModal({ product, isOpen, onClose, onAddToCart }: ProductDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
    setQuantity(1);
  };

  const getImageSrc = () => {
    if (typeof product.image === 'string') {
      // Handle URLs or relative paths
      if (product.image.startsWith('http') || product.image.startsWith('/')) {
        return product.image;
      }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md mx-4 max-h-[90vh] md:max-h-none overflow-y-auto scrollbar-hide md:overflow-visible">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center transition-all"
          data-testid="button-close-modal-x"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* Product Image */}
        <div className="relative h-64 md:h-40">
          {getImageSrc() ? (
            <img 
              src={getImageSrc()!} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl md:text-4xl">
              {product.image}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-4">
          {/* Header with farm info */}
          <div className="flex items-center justify-between mb-3 md:mb-2">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 md:w-4 md:h-4 text-green-600" />
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm">{product.farm}</span>
            </div>
          </div>

          {/* Product Name */}
          <h2 className="text-2xl md:text-xl font-bold text-gray-900 mb-2 md:mb-1">{product.name}</h2>

          {/* Price */}
          <p className="text-xl md:text-lg font-bold text-gray-900 mb-2 md:mb-1">
            {product.price} <span className="font-normal text-base md:text-sm text-gray-600">{product.unit}</span>
          </p>

          {/* Stock */}
          <p className="text-gray-600 text-sm mb-4 md:mb-3">{product.stockLeft}</p>

          {/* Quantity Selector */}
          <div className="mb-4 md:mb-3">
            <p className="text-gray-900 font-medium mb-2 text-sm md:text-xs">
              How many do you want? <span className="text-gray-500">(1 basket ≈ 10kg)</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 md:w-9 md:h-9 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4 text-gray-700" />
              </button>
              <span className="text-lg md:text-base font-semibold min-w-[2rem] text-center" data-testid="text-quantity">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 md:w-9 md:h-9 bg-green-700 hover:bg-green-800 rounded-xl flex items-center justify-center transition-colors"
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-yellow-50 rounded-xl p-3 md:p-2 mb-4 md:mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <span className="text-xs text-yellow-800">Delivered today if you order before 3PM</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 md:py-2.5 rounded-xl font-semibold text-base md:text-sm flex items-center justify-center gap-2 transition-colors mb-3 md:mb-2"
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-600 py-2 md:py-1 text-center font-medium text-sm"
            data-testid="button-close-modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}