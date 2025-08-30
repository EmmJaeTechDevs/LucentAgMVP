import React, { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import leafImage from "@assets/entypo_leaf_1756517515112.png";

export const BuyerAccountCreation = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { isLoading } = useLoading({ minimumLoadTime: 600 });
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading welcome page..." />;
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call to verify phone number
      console.log("Phone number for verification:", phoneNumber);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to buyer verification page
      setLocation("/buyer-verification");
      
    } catch (error) {
      console.error("Error verifying phone number:", error);
      alert("Error verifying phone number. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsGuest = () => {
    // Navigate to guest experience
    alert("Continuing as guest...");
    // setLocation("/buyer-guest-dashboard");
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-6 py-12 md:px-8 lg:px-16">
        {/* Mobile Layout */}
        <div className="md:hidden max-w-md mx-auto w-full animate-fadeInUp flex flex-col justify-center min-h-[80vh]">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome!
            </h1>
            <p className="text-gray-600 text-lg">
              Enter your phone number to get started
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-8">
            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                data-testid="input-phone-number"
                required
              />
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isSubmitting || !phoneNumber.trim()}
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-continue"
            >
              {isSubmitting ? "Verifying..." : "Continue"}
            </button>

            {/* Continue as Guest */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleContinueAsGuest}
                className="text-gray-600 font-medium hover:text-gray-800 transition-colors duration-200"
                data-testid="button-continue-guest"
              >
                Continue as Guest
              </button>
            </div>
          </form>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-center max-w-4xl mx-auto w-full min-h-[80vh]">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-12 animate-fadeInUp">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Welcome!
              </h1>
              <p className="text-gray-600 text-xl">
                Enter your phone number to get started
              </p>
            </div>

            <form onSubmit={handleContinue} className="space-y-8">
              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-5 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-xl"
                  data-testid="input-phone-number-desktop"
                  required
                />
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isSubmitting || !phoneNumber.trim()}
                className="w-full bg-green-700 text-white py-5 rounded-2xl font-semibold text-xl hover:bg-green-800 hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-continue-desktop"
              >
                {isSubmitting ? "Verifying..." : "Continue"}
              </button>

              {/* Continue as Guest */}
              <div className="text-center pt-6">
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="text-gray-600 font-medium hover:text-gray-800 transition-colors duration-200 text-lg"
                  data-testid="button-continue-guest-desktop"
                >
                  Continue as Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Decorative element - Large leaf at bottom right */}
      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-20 md:w-64 md:h-64 lg:w-80 lg:h-80">
        <img 
          src={leafImage} 
          alt="Decorative leaf"
          className="w-full h-full object-contain"
        />
      </div>
    </main>
  );
};