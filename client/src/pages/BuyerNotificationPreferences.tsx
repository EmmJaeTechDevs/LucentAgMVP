import React, { useState } from "react";
import { useLocation } from "wouter";

interface NotificationSettings {
  sms: boolean;
  whatsapp: boolean;
  inApp: boolean;
}

export function BuyerNotificationPreferences() {
  const [, setLocation] = useLocation();
  
  const [preferences, setPreferences] = useState<NotificationSettings>({
    sms: true, // Default to enabled as shown in design
    whatsapp: false,
    inApp: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (type: keyof NotificationSettings) => {
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Buyer notification preferences:", preferences);
      
      // Navigate to buyer home/dashboard
      setLocation("/buyer-home");
      
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Navigate to buyer home/dashboard without saving preferences
    setLocation("/buyer-home");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Bell icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 text-6xl">🔔</div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Updated!
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              Choose how you want to get important messages from us.
            </p>
          </div>

          {/* Notification Options */}
          <div className="space-y-6 mb-12">
            {/* SMS */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <button
                  onClick={() => handleToggle("sms")}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.sms
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-sms"
                >
                  {preferences.sms && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">SMS</h3>
                <p className="text-gray-600 text-sm">Get text messages on your phone</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <button
                  onClick={() => handleToggle("whatsapp")}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.whatsapp
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-whatsapp"
                >
                  {preferences.whatsapp && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp</h3>
                <p className="text-gray-600 text-sm">We'll message you directly on WhatsApp</p>
              </div>
            </div>

            {/* In App */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <button
                  onClick={() => handleToggle("inApp")}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.inApp
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-in-app"
                >
                  {preferences.inApp && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">In App</h3>
                <p className="text-gray-600 text-sm">See messages here in the app</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
              data-testid="button-save-choices"
            >
              {isSubmitting ? "Saving..." : "Save My Choices"}
            </button>

            <button
              onClick={handleSkip}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-medium text-lg transition-colors"
              data-testid="button-skip"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            {/* Bell icon */}
            <div className="w-20 h-20 mx-auto mb-8 text-8xl">🔔</div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Stay Updated!
            </h1>
            <p className="text-gray-600 text-xl leading-relaxed mb-12">
              Choose how you want to get important messages from us.
            </p>

            {/* Notification Options */}
            <div className="space-y-8 mb-16 text-left">
              {/* SMS */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 mt-2">
                  <button
                    onClick={() => handleToggle("sms")}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors ${
                      preferences.sms
                        ? "bg-green-600 border-green-600"
                        : "border-gray-300 bg-white"
                    }`}
                    data-testid="toggle-sms-desktop"
                  >
                    {preferences.sms && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">SMS</h3>
                  <p className="text-gray-600 text-lg">Get text messages on your phone</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 mt-2">
                  <button
                    onClick={() => handleToggle("whatsapp")}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors ${
                      preferences.whatsapp
                        ? "bg-green-600 border-green-600"
                        : "border-gray-300 bg-white"
                    }`}
                    data-testid="toggle-whatsapp-desktop"
                  >
                    {preferences.whatsapp && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">WhatsApp</h3>
                  <p className="text-gray-600 text-lg">We'll message you directly on WhatsApp</p>
                </div>
              </div>

              {/* In App */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 mt-2">
                  <button
                    onClick={() => handleToggle("inApp")}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors ${
                      preferences.inApp
                        ? "bg-green-600 border-green-600"
                        : "border-gray-300 bg-white"
                    }`}
                    data-testid="toggle-in-app-desktop"
                  >
                    {preferences.inApp && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">In App</h3>
                  <p className="text-gray-600 text-lg">See messages here in the app</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-6">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-6 rounded-xl font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50"
                data-testid="button-save-choices-desktop"
              >
                {isSubmitting ? "Saving..." : "Save My Choices"}
              </button>

              <button
                onClick={handleSkip}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-6 rounded-xl font-medium text-xl transition-colors"
                data-testid="button-skip-desktop"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}