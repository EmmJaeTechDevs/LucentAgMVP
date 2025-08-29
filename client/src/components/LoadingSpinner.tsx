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
    small: "w-6 h-6",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={containerClasses} data-testid="loading-spinner">
      {/* Spinning circle animation */}
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
        </div>
        
        {/* Pulsing dot in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Loading message */}
      {message && (
        <p className="mt-4 text-gray-600 text-sm font-medium animate-pulse">
          {message}
        </p>
      )}
      
      {/* Loading dots animation */}
      <div className="flex space-x-1 mt-2">
        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};