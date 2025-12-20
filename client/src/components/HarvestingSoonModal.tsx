import { Bell, X, Heart, Star, Clock } from "lucide-react";

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
      if (product.image.startsWith("http") || product.image.startsWith("/")) {
        return product.image;
      }
    }
    return null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all"
          data-testid="button-close-harvesting-modal-x"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        <div className="p-6">
          {/* Product Details - Image on left, info on right */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="md:w-2/5">
              <div className="rounded-lg overflow-hidden bg-gray-100 aspect-square">
                {getImageSrc() ? (
                  <img
                    src={getImageSrc()!}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-gray-200">
                    {product.image}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-3/5">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                <button className="p-2 text-gray-400 hover:text-red-500" data-testid="button-favorite">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {product.farm}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-gray-500 text-sm ml-1">(134 Reviews)</span>
              </div>

              {/* Price */}
              <p className="text-2xl font-bold text-gray-900 mb-4">
                {product.price || "₦2,200"}{" "}
                <span className="font-normal text-base text-gray-600">{product.unit || "per Kg"}</span>
              </p>

              {/* Harvest Date */}
              <div className="flex items-center gap-2 mb-6 bg-amber-50 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-amber-700 font-medium">
                  {product.harvestDate || "Ready by September 23, 2025"}
                </span>
              </div>

              {/* Notify Me Button */}
              <button
                onClick={handleNotifyMe}
                className="w-full bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                data-testid="button-notify-me"
              >
                <Bell className="w-5 h-5" />
                Notify Me When Ready
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2 text-center font-medium"
                data-testid="button-close-harvesting-modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
