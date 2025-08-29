import React, { useState } from "react";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useLoading } from "@/hooks/useLoading";

export const LanguageSelector = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const { isLoading } = useLoading({ minimumLoadTime: 600 });

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading language options..." />;
  }

  const languages = [
    {
      id: "english",
      name: "English",
      subtitle: "English (UK)",
      flagUrl: "https://flagcdn.com/w80/gb.png",
      flagAlt: "United Kingdom flag"
    },
    {
      id: "yoruba",
      name: "Yoruba",
      subtitle: "Èdè Yorùbá",
      flagUrl: "https://flagcdn.com/w80/ng.png",
      flagAlt: "Nigeria flag"
    },
    {
      id: "igbo",
      name: "Igbo",
      subtitle: "Asụsụ Igbo",
      flagUrl: "https://flagcdn.com/w80/ng.png",
      flagAlt: "Nigeria flag"
    },
    {
      id: "hausa",
      name: "Hausa",
      subtitle: "Harshen Hausa",
      flagUrl: "https://flagcdn.com/w80/ng.png",
      flagAlt: "Nigeria flag"
    }
  ];

  const handleContinue = () => {
    // For now, just show an alert - you can navigate to the next page later
    alert(`Selected language: ${languages.find(l => l.id === selectedLanguage)?.name}`);
  };

  return (
    <main className="relative w-full min-h-screen max-w-md mx-auto bg-gray-50 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl flex flex-col">

      {/* Content */}
      <div className="flex-1 px-6 pt-[10px] pb-4 md:px-8 md:pt-6 md:pb-6 lg:px-16 lg:pt-8 lg:pb-8 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl lg:text-5xl md:mb-4 lg:mb-6 text-center">
            Choose Your Preferred Language
          </h1>
          <p className="text-gray-600 mb-8 md:text-lg lg:text-xl md:mb-8 lg:mb-12 text-center max-w-2xl mx-auto">
            Select the language you're most comfortable with. You can always change it later
          </p>

          {/* Language Options */}
          <div className="grid grid-cols-2 gap-4 mb-6 md:gap-6 md:mb-8 lg:gap-8 lg:mb-10 max-w-2xl mx-auto">
            {languages.map((language) => (
              <button
                key={language.id}
                onClick={() => setSelectedLanguage(language.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 md:p-6 lg:p-8 ${
                  selectedLanguage === language.id
                    ? "border-green-600 bg-white shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                data-testid={`language-option-${language.id}`}
              >
                {selectedLanguage === language.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center md:w-7 md:h-7 lg:w-8 lg:h-8">
                    <svg className="w-4 h-4 text-white md:w-4 md:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="mb-3 flex justify-center">
                  <img 
                    src={language.flagUrl} 
                    alt={language.flagAlt}
                    className="w-12 h-8 md:w-14 md:h-9 lg:w-16 lg:h-10 object-cover rounded-sm shadow-sm"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 md:text-lg lg:text-xl mb-1">{language.name}</h3>
                  <p className="text-sm text-gray-500 md:text-sm lg:text-base">{language.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              className="w-full max-w-md bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 hover:shadow-lg transition-all duration-200 md:py-5 md:text-xl lg:text-xl"
              data-testid="button-continue"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-4 right-4 w-24 h-24 opacity-5 md:w-32 md:h-32 lg:w-40 lg:h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20,80 Q50,20 80,80" fill="none" stroke="currentColor" strokeWidth="15" opacity="0.3"/>
        </svg>
      </div>
    </main>
  );
};