import React, { useState } from "react";
import { useLocation } from "wouter";

export const LanguageSelector = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("english");

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
    <main className="relative w-full min-h-screen max-w-md mx-auto bg-gray-50 md:max-w-lg lg:max-w-xl xl:max-w-2xl">

      {/* Content */}
      <div className="px-6 py-4 mt-[30px] md:px-8 md:py-8 lg:px-12 lg:py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl lg:text-4xl md:mb-4">
          Choose Your<br className="md:hidden" /><span className="hidden md:inline"> </span>Preferred Language
        </h1>
        <p className="text-gray-600 mb-8 md:text-lg lg:text-xl md:mb-12">
          Select the language you're most comfortable with.<br className="md:hidden" /><span className="hidden md:inline"> </span>
          You can always change it later
        </p>

        {/* Language Options */}
        <div className="grid grid-cols-2 gap-4 mb-8 md:gap-6 md:mb-12 lg:grid-cols-4 lg:gap-8">
          {languages.map((language) => (
            <button
              key={language.id}
              onClick={() => setSelectedLanguage(language.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md md:p-6 lg:p-8 ${
                selectedLanguage === language.id
                  ? "border-green-600 bg-white"
                  : "border-gray-200 bg-white"
              }`}
              data-testid={`language-option-${language.id}`}
            >
              {selectedLanguage === language.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center md:w-8 md:h-8">
                  <svg className="w-4 h-4 text-white md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="mb-2 flex justify-center">
                <img 
                  src={language.flagUrl} 
                  alt={language.flagAlt}
                  className="w-12 h-8 md:w-16 md:h-10 lg:w-20 lg:h-12 object-cover rounded-sm"
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 md:text-lg lg:text-xl">{language.name}</h3>
                <p className="text-sm text-gray-500 md:text-base">{language.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 transition-colors md:py-6 md:text-xl lg:text-2xl"
          data-testid="button-continue"
        >
          Continue
        </button>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 md:w-40 md:h-40 lg:w-48 lg:h-48">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20,80 Q50,20 80,80" fill="none" stroke="currentColor" strokeWidth="20" opacity="0.3"/>
        </svg>
      </div>
    </main>
  );
};