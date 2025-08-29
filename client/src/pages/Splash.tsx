import React, { useEffect } from "react";
import { useLocation } from "wouter";

export const Splash = (): JSX.Element => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/language-selector");
    }, 1000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <main className="relative w-[360px] h-[691px] bg-white">
      <img
        className="absolute w-[229px] h-[132px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        alt="Lucent Ag Logo"
        src="/figmaAssets/image-20.png"
      />
    </main>
  );
};
