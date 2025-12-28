import React, { useState } from "react";
import { useLocation } from "wouter";

interface NotificationSettings {
  sms: boolean;
  email: boolean;
  whatsapp: boolean;
  inApp: boolean;
}

export function BuyerNotificationPreferences() {
  const [, setLocation] = useLocation();
  
  const [preferences, setPreferences] = useState<NotificationSettings>({
    sms: true,
    email: true,
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

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <button
                  onClick={() => handleToggle("email")}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.email
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-email"
                >
                  {preferences.email && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                <p className="text-gray-600 text-sm">Receive updates in your inbox</p>
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
      <div className="hidden md:flex min-h-screen items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          {/* Bell icon */}
          <div className="mb-4 text-center">
            <div className="w-12 h-12 mx-auto text-5xl">🔔</div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Stay Updated!
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed mb-6 text-center">
            Choose how you want to get important messages from us.
          </p>

          {/* Notification Options */}
          <div className="space-y-3 mb-6">
            {/* SMS */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <button
                  onClick={() => handleToggle("sms")}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.sms
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-sms-desktop"
                >
                  {preferences.sms && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">SMS</h3>
                <p className="text-gray-600 text-sm">Get text messages on your phone</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <button
                  onClick={() => handleToggle("email")}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.email
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-email-desktop"
                >
                  {preferences.email && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">Email</h3>
                <p className="text-gray-600 text-sm">Receive updates in your inbox</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <button
                  onClick={() => handleToggle("whatsapp")}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.whatsapp
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-whatsapp-desktop"
                >
                  {preferences.whatsapp && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">WhatsApp</h3>
                <p className="text-gray-600 text-sm">We'll message you directly on WhatsApp</p>
              </div>
            </div>

            {/* In App */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <button
                  onClick={() => handleToggle("inApp")}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    preferences.inApp
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300 bg-white"
                  }`}
                  data-testid="toggle-in-app-desktop"
                >
                  {preferences.inApp && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">In App</h3>
                <p className="text-gray-600 text-sm">See messages here in the app</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium text-base transition-all hover:scale-105 disabled:opacity-50"
              data-testid="button-save-choices-desktop"
            >
              {isSubmitting ? "Saving..." : "Save My Choices"}
            </button>

            <button
              onClick={handleSkip}
              className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-600 py-3 rounded-lg font-medium text-base transition-all hover:scale-105"
              data-testid="button-skip-desktop"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}