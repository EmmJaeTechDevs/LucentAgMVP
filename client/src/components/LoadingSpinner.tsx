import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "medium", 
  message = "Loading...",
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: "w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16",
    medium: "w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32", 
    large: "w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40"
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses} data-testid="loading-spinner">
      {/* Spinning circle animation */}
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="absolute inset-0 border-4 md:border-6 lg:border-8 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 md:border-6 lg:border-8 border-transparent border-t-green-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Pulsing dot in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-green-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Loading message */}
      {message && (
        <p className="mt-6 md:mt-8 lg:mt-10 text-gray-600 text-base md:text-xl lg:text-2xl font-medium animate-pulse">
          {message}
        </p>
      )}
      
      {/* Loading dots animation */}
      <div className="flex space-x-2 md:space-x-3 lg:space-x-4 mt-3 md:mt-4 lg:mt-6">
        <div className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-green-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};