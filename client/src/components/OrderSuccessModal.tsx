import React from "react";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSuccessModal({ isOpen, onClose }: OrderSuccessModalProps) {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleBackToHome = () => {
    onClose();
    setLocation("/buyer-home");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md p-8 text-center max-h-[90vh] md:max-h-[80vh] overflow-y-auto scrollbar-hide md:scrollbar-styled">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Order Placed Successfully!
        </h2>
        
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Thanks! The farmer has received your order and will get it ready soon. We'll update you when it's out for delivery.
        </p>

        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
          data-testid="button-back-to-home"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}