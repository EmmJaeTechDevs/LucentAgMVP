import React, { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";
import leafImage from "@assets/entypo_leaf_1756517515112.png";

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
      image: "https://images.unsplash.com/photo-1595515106969-2670b4df4e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "buyer", 
      title: "I'm a Buyer",
      description: "I want to find and purchase fresh produce from local farmers.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // For now, just show an alert - you can navigate to the next page later
      alert(`Selected role: ${roles.find(r => r.id === selectedRole)?.title}`);
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Content */}
      <div className="flex-1 px-6 pt-[60px] pb-4 md:px-8 md:pt-16 md:pb-6 lg:px-16 lg:pt-20 lg:pb-8">
        <div className="max-w-md mx-auto w-full md:max-w-lg lg:max-w-xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl lg:text-4xl md:mb-4">
            Hi! What would you like to do?
          </h1>
          <p className="text-gray-600 mb-8 md:text-lg lg:text-xl md:mb-12">
            Select your role to begin!
          </p>

          {/* Role Options */}
          <div className="space-y-4 mb-8 md:space-y-6 md:mb-12">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`relative w-full h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  selectedRole === role.id
                    ? "ring-4 ring-green-600 shadow-lg"
                    : "ring-2 ring-gray-200 hover:ring-gray-300"
                }`}
                data-testid={`role-option-${role.id}`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${role.image})` }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-xl font-bold text-white mb-2 md:text-2xl lg:text-3xl">
                    {role.title}
                  </h3>
                  <p className="text-gray-200 text-sm md:text-base lg:text-lg">
                    {role.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                {selectedRole === role.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center md:w-10 md:h-10">
                    <svg className="w-5 h-5 text-white md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Continue Button */}
          {selectedRole && (
            <div className="flex justify-center">
              <button
                onClick={handleContinue}
                className="w-full max-w-md bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 hover:shadow-lg transition-all duration-200 md:py-5 md:text-xl lg:text-xl"
                data-testid="button-continue"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-8 right-6 w-24 h-24 opacity-40 md:bottom-12 md:right-8 md:w-20 md:h-20 lg:w-24 lg:h-24">
        <img 
          src={leafImage} 
          alt="Decorative leaf"
          className="w-full h-full object-contain"
        />
      </div>
    </main>
  );
};