import React, { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import leafImage from "@assets/entypo_leaf_1756517515112.png";
import farmerImage from "@assets/image 4_1756527774206.png";
import connectImage from "@assets/image 11_1756527834945.png";
import harvestImage from "@assets/image 5_1756527846541.png";

export const FarmerOnboarding = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isLoading } = useLoading({ minimumLoadTime: 600 });

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading farmer onboarding..." />;
  }

  const slides = [
    {
      id: 1,
      title: "Grow and Sell Easily",
      description: "Tell us what you're planting and when it will be ready. It helps you find buyers ahead of time!",
      image: farmerImage
    },
    {
      id: 2,
      title: "Get Buyers Before Harvest",
      description: "When you tell us early, customers can order from you before your plants are ready",
      image: connectImage
    },
    {
      id: 3,
      title: "Manage Your Harvest",
      description: "Keep track of your crops, plan your seasons, and maximize your profits with our tools.",
      image: harvestImage
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Navigate to next page or complete onboarding
      alert("Onboarding completed! Ready to proceed.");
    }
  };

  const handleSkip = () => {
    // Navigate to next page
    alert("Skipping onboarding...");
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-8 lg:px-16">
        {/* Mobile Layout */}
        <div className="md:hidden w-full max-w-sm mx-auto animate-fadeInUp">
          {/* Stacked Image Carousel */}
          <div className="relative mb-8 h-80">
            {slides.map((slide, index) => {
              const offset = index - currentSlide;
              const isActive = index === currentSlide;
              const isNext = index === currentSlide + 1;
              const isPrev = index === currentSlide - 1;
              
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    isActive 
                      ? "z-30 transform translate-y-0 scale-100 opacity-100" 
                      : isNext || isPrev
                      ? "z-20 transform translate-y-2 scale-95 opacity-60"
                      : "z-10 transform translate-y-4 scale-90 opacity-30"
                  }`}
                  style={{
                    transform: `translateY(${offset * 8}px) scale(${isActive ? 1 : 0.95 - Math.abs(offset) * 0.05})`,
                  }}
                >
                  <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${slide.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  </div>
                  {/* Additional shadow layers for depth */}
                  <div className="absolute inset-0 rounded-3xl shadow-lg opacity-50 transform translate-y-1"></div>
                  <div className="absolute inset-0 rounded-3xl shadow-md opacity-30 transform translate-y-2"></div>
                </div>
              );
            })}
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center space-x-2 mb-8 animate-slideInUp">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-green-600 w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                data-testid={`carousel-dot-${index}`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8 animate-slideInUp delay-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {slides[currentSlide].title}
            </h1>
            <p className="text-gray-600 text-base leading-relaxed px-4">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-4 animate-slideInUp delay-300">
            <button
              onClick={handleNext}
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 hover:shadow-lg transition-all duration-300 hover:scale-105"
              data-testid="button-next"
            >
              {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full text-gray-600 py-2 font-medium hover:text-gray-800 transition-colors duration-200"
              data-testid="button-skip"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:items-center md:justify-between max-w-6xl mx-auto w-full min-h-[70vh]">
          {/* Left Side - Images */}
          <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0 animate-slideInLeft">
            <div className="relative h-96 lg:h-[500px]">
              {slides.map((slide, index) => {
                const offset = index - currentSlide;
                const isActive = index === currentSlide;
                
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      isActive 
                        ? "z-30 transform translate-y-0 scale-100 opacity-100" 
                        : "z-20 transform scale-95 opacity-40"
                    }`}
                    style={{
                      transform: `translateY(${offset * 12}px) translateX(${offset * 8}px) scale(${isActive ? 1 : 0.9 - Math.abs(offset) * 0.1})`,
                    }}
                  >
                    <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </div>
                    </div>
                    {/* Enhanced shadow layers for desktop */}
                    <div className="absolute inset-0 rounded-3xl shadow-xl opacity-60 transform translate-y-2 translate-x-1"></div>
                    <div className="absolute inset-0 rounded-3xl shadow-lg opacity-40 transform translate-y-4 translate-x-2"></div>
                    <div className="absolute inset-0 rounded-3xl shadow-md opacity-20 transform translate-y-6 translate-x-3"></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:w-1/2 animate-slideInRight">
            {/* Carousel Dots */}
            <div className="flex space-x-3 mb-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? "bg-green-600 w-12 shadow-lg" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  data-testid={`carousel-dot-${index}`}
                />
              ))}
            </div>

            <div className="mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-gray-600 text-xl lg:text-2xl leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* Desktop Buttons */}
            <div className="space-y-6">
              <button
                onClick={handleNext}
                className="bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-xl hover:bg-green-800 hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg"
                data-testid="button-next"
              >
                {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
              </button>
              
              <div>
                <button
                  onClick={handleSkip}
                  className="text-gray-600 py-2 font-medium hover:text-gray-800 transition-colors duration-200 text-lg"
                  data-testid="button-skip"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-8 right-6 w-24 h-24 opacity-40 md:top-8 md:left-8 md:bottom-auto md:right-auto md:w-20 md:h-20 lg:w-24 lg:h-24">
        <img 
          src={leafImage} 
          alt="Decorative leaf"
          className="w-full h-full object-contain"
        />
      </div>
    </main>
  );
};