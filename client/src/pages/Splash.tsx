import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

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
    return <div>Loading...</div>;
  }

  return (
    <main className="relative w-[360px] h-[691px] bg-white flex items-center justify-center">
      <div className="text-center">
        <img
          className="w-[229px] h-[132px] mx-auto"
          alt="Lucent Ag Logo"
          src="/figmaAssets/image-20.png"
          onError={(e) => {
            console.log("Image failed to load");
            // Fallback to text if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="mt-4 text-lg font-semibold text-gray-800">
          Lucent Ag
        </div>
      </div>
    </main>
  );
};
