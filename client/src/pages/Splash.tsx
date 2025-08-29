import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";

export const Splash = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setLocation("/language-selector");
      }, 100);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  if (!isVisible) {
    return <LoadingSpinner fullScreen message="Transitioning..." />;
  }

  return (
    <main className="relative w-full min-h-screen max-w-md mx-auto bg-white flex items-center justify-center md:max-w-lg lg:max-w-xl xl:max-w-2xl">
      <div className="text-center px-4">
        <img
          className="w-48 h-28 mx-auto md:w-56 md:h-32 lg:w-64 lg:h-36"
          alt="Lucent Ag Logo"
          src="/figmaAssets/image-20.png"
          onError={(e) => {
            console.log("Image failed to load");
            // Fallback to text if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="mt-4 text-lg font-semibold text-gray-800 md:text-xl lg:text-2xl">
          Lucent Ag
        </div>
      </div>
    </main>
  );
};
