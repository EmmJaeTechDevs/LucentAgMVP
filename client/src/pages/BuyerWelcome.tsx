import React, { useState } from "react";
import { useLocation } from "wouter";

export function BuyerWelcome() {
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: "firstName" | "lastName", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      return; // First name is required
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Buyer welcome data:", formData);
      
      // Navigate to buyer notification preferences
      setLocation("/buyer-notification-preferences");
      
    } catch (error) {
      console.error("Error saving welcome data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    console.log("Buyer skipped welcome form");
    // Navigate to buyer notification preferences
    setLocation("/buyer-notification-preferences");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              You're In!
            </h1>
            <p className="text-gray-600 text-base">
              Tell us a little about you
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {/* First Name */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                data-testid="input-first-name"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                Last Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                data-testid="input-last-name"
              />
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.firstName.trim()}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-12"
              data-testid="button-continue"
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </button>

            {/* Skip Button */}
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-gray-600 hover:text-gray-800 py-4 font-medium text-lg transition-colors"
              data-testid="button-skip"
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                You're In!
              </h1>
              <p className="text-gray-600 text-xl">
                Tell us a little about you
              </p>
            </div>

            <form onSubmit={handleContinue} className="space-y-8">
              {/* First Name */}
              <div className="text-left">
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  data-testid="input-first-name-desktop"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="text-left">
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  data-testid="input-last-name-desktop"
                />
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.firstName.trim()}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-6 rounded-xl font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-16"
                data-testid="button-continue-desktop"
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </button>

              {/* Skip Button */}
              <button
                type="button"
                onClick={handleSkip}
                className="w-full text-gray-600 hover:text-gray-800 py-4 font-medium text-xl transition-colors"
                data-testid="button-skip-desktop"
              >
                Skip for now
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Decorative leaf at bottom */}
      <div className="fixed bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gray-300">
          <path
            d="M20,50 Q30,20 50,30 Q70,20 80,50 Q70,80 50,70 Q30,80 20,50"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}