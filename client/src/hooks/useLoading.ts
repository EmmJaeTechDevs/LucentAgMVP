import { useState, useEffect } from 'react';

interface UseLoadingOptions {
  initialLoading?: boolean;
  minimumLoadTime?: number;
}

export const useLoading = ({ 
  initialLoading = true, 
  minimumLoadTime = 800 
}: UseLoadingOptions = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [startTime] = useState(Date.now());

  const stopLoading = async () => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
    
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    setIsLoading(false);
  };

  const startLoading = () => {
    setIsLoading(true);
  };

  useEffect(() => {
    if (initialLoading) {
      const timer = setTimeout(() => {
        stopLoading();
      }, minimumLoadTime);
      
      return () => clearTimeout(timer);
    }
  }, [initialLoading, minimumLoadTime]);

  return {
    isLoading,
    startLoading,
    stopLoading
  };
};