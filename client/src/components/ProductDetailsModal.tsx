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
    if (typeof product.image === 'string' && product.image.startsWith('/')) {
      return product.image;
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
          data-testid="button-close-modal-x"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>

          {/* Price */}
          <p className="text-xl font-bold text-gray-900 mb-2">
            {product.price} <span className="font-normal text-base text-gray-600">{product.unit}</span>
          </p>

          {/* Stock */}
          <p className="text-gray-600 mb-6">{product.stockLeft}</p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <p className="text-gray-900 font-medium mb-3">
              How many do you want? <span className="text-gray-500">(1 basket ≈ 10kg)</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              <span className="text-xl font-semibold min-w-[2rem] text-center" data-testid="text-quantity">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-12 h-12 bg-green-700 hover:bg-green-800 rounded-xl flex items-center justify-center transition-colors"
                data-testid="button-increase-quantity"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Truck className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">Delivered today if you order before 3PM</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors mb-4"
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full text-gray-600 py-2 text-center font-medium"
            data-testid="button-close-modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}