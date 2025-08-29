import React, { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import leafImage from "@assets/entypo_leaf_1756517515112.png";
import farmerImage from "@assets/image 2_1756522296288.jpg";
import buyerImage from "@assets/image 3_1756527456608.png";

export const RoleSelection = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { isLoading } = useLoading({ minimumLoadTime: 600 });

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading role selection..." />;
  }

  const roles = [
    {
      id: "farmer",
      title: "I'm a Farmer",
      description: "I want to share my produce and connect with buyers.",
      image: farmerImage
    },
    {
      id: "buyer", 
      title: "I'm a Buyer",
      description: "I want to find and purchase fresh produce from local farmers.",
      image: buyerImage
    }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole === "farmer") {
        setLocation("/farmer-onboarding");
      } else {
        // For now, just show an alert for buyer - you can add buyer onboarding later
        alert(`Selected role: ${roles.find(r => r.id === selectedRole)?.title}`);
      }
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Content */}
      <div className="flex-1 px-6 pt-[60px] pb-4 md:px-8 md:pt-8 md:pb-6 lg:px-16 lg:pt-12 lg:pb-8">
        {/* Mobile Layout */}
        <div className="md:hidden max-w-md mx-auto w-full animate-fadeInUp">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-slideInLeft">
            Welcome! Let's get started
          </h1>
          <p className="text-gray-600 mb-8 animate-slideInLeft delay-100">
            Select your role to begin!
          </p>

          {/* Mobile Role Options */}
          <div className="space-y-4 mb-8">
            {roles.map((role, index) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`relative w-full h-48 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 animate-slideInUp ${
                  selectedRole === role.id
                    ? "ring-4 ring-green-600 shadow-lg"
                    : "ring-2 ring-gray-200 hover:ring-gray-300"
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
                data-testid={`role-option-${role.id}`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-top transition-transform duration-300 hover:scale-110"
                  style={{ backgroundImage: `url(${role.image})` }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {role.title}
                  </h3>
                  <p className="text-gray-200 text-sm">
                    {role.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                {selectedRole === role.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center animate-bounceIn">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Continue Button */}
          {selectedRole && (
            <div className="flex justify-center animate-fadeInUp">
              <button
                onClick={handleContinue}
                className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 hover:shadow-lg transition-all duration-300 hover:scale-105"
                data-testid="button-continue"
              >
                Continue
              </button>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col lg:flex-row lg:items-center lg:justify-between max-w-7xl mx-auto w-full min-h-[80vh]">
          {/* Left Side - Text Content */}
          <div className="lg:w-2/5 lg:pr-12 mb-8 lg:mb-0 animate-slideInLeft">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 lg:text-5xl xl:text-6xl leading-tight">
              Welcome!<br />
              <span className="text-green-700">Let's get started</span>
            </h1>
            <p className="text-gray-600 text-xl lg:text-2xl mb-8 leading-relaxed">
              Choose your role to begin your journey with our platform. Connect with the agricultural community today.
            </p>
            
            {/* Desktop Continue Button */}
            {selectedRole && (
              <div className="animate-fadeInUp">
                <button
                  onClick={handleContinue}
                  className="bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-xl hover:bg-green-800 hover:shadow-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  data-testid="button-continue"
                >
                  Continue as {roles.find(r => r.id === selectedRole)?.title?.replace("I'm a ", "")}
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Role Cards */}
          <div className="lg:w-3/5 space-y-6 animate-slideInRight">
            {roles.map((role, index) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`relative w-full h-64 lg:h-72 xl:h-80 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 group ${
                  selectedRole === role.id
                    ? "ring-4 ring-green-600 shadow-2xl scale-105"
                    : "ring-2 ring-gray-200 hover:ring-green-300 shadow-lg"
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
                data-testid={`role-option-${role.id}`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-top transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${role.image})` }}
                >
                  {/* Enhanced Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/70 lg:via-black/30 lg:to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-8 h-full flex flex-col justify-center text-left lg:justify-end">
                  <h3 className="text-2xl font-bold text-white mb-3 lg:text-3xl xl:text-4xl">
                    {role.title}
                  </h3>
                  <p className="text-gray-200 text-lg lg:text-xl max-w-md">
                    {role.description}
                  </p>
                </div>

                {/* Enhanced Selection Indicator */}
                {selectedRole === role.id && (
                  <div className="absolute top-6 right-6 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center animate-bounceIn shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ))}
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