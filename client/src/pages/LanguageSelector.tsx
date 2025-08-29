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
      flag: "🇬🇧"
    },
    {
      id: "yoruba",
      name: "Yoruba",
      subtitle: "Èdè Yorùbá",
      flag: "🇳🇬"
    },
    {
      id: "igbo",
      name: "Igbo",
      subtitle: "Asụsụ Igbo",
      flag: "🇳🇬"
    },
    {
      id: "hausa",
      name: "Hausa",
      subtitle: "Harshen Hausa",
      flag: "🇳🇬"
    }
  ];

  const handleContinue = () => {
    // For now, just show an alert - you can navigate to the next page later
    alert(`Selected language: ${languages.find(l => l.id === selectedLanguage)?.name}`);
  };

  return (
    <main className="relative w-[360px] h-[691px] bg-gray-50">
      {/* Header with status bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-6">
        <span className="text-sm font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          <div className="ml-2">📶</div>
          <div className="ml-1">📶</div>
          <div className="ml-1">🔋</div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your<br />Preferred Language
        </h1>
        <p className="text-gray-600 mb-8">
          Select the language you're most comfortable with.<br />
          You can always change it later
        </p>

        {/* Language Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {languages.map((language) => (
            <button
              key={language.id}
              onClick={() => setSelectedLanguage(language.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                selectedLanguage === language.id
                  ? "border-green-600 bg-white"
                  : "border-gray-200 bg-white"
              }`}
              data-testid={`language-option-${language.id}`}
            >
              {selectedLanguage === language.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="text-3xl mb-2">{language.flag}</div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">{language.name}</h3>
                <p className="text-sm text-gray-500">{language.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-800 transition-colors"
          data-testid="button-continue"
        >
          Continue
        </button>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20,80 Q50,20 80,80" fill="none" stroke="currentColor" strokeWidth="20" opacity="0.3"/>
        </svg>
      </div>
    </main>
  );
};