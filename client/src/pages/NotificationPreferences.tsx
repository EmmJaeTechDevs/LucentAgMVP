import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PreferenceOption {
  id: string;
  title: string;
  description: string;
  checked: boolean;
}

export function NotificationPreferences() {
  const [, setLocation] = useLocation();
  const [preferences, setPreferences] = useState<PreferenceOption[]>([
    {
      id: "sms",
      title: "SMS",
      description: "Get text messages on your phone",
      checked: true
    },
    {
      id: "email",
      title: "Email",
      description: "Receive updates in your inbox",
      checked: true
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      description: "We'll message you directly on WhatsApp",
      checked: false
    },
    {
      id: "inapp",
      title: "In App",
      description: "See messages here in the app",
      checked: false
    }
  ]);

  const handleTogglePreference = (id: string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, checked: !pref.checked } : pref
      )
    );
  };

  const handleSaveChoices = () => {
    console.log("Notification preferences saved:", preferences);
    // Navigate to crop selection
    setLocation("/crop-selection");
  };

  const handleSkipForNow = () => {
    console.log("Skipped notification preferences");
    // Navigate to crop selection
    setLocation("/crop-selection");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-20 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Bell icon */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto text-6xl">🔔</div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Stay Updated!
          </h1>
          
          <p className="text-gray-600 text-base leading-relaxed mb-8 text-center">
            Choose how you want to get important messages from us.
          </p>

          {/* Preference options */}
          <div className="space-y-4 mb-8">
            {preferences.map((pref) => (
              <div
                key={pref.id}
                onClick={() => handleTogglePreference(pref.id)}
                className="flex items-start gap-3 cursor-pointer"
                data-testid={`preference-${pref.id}`}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  pref.checked 
                    ? "bg-green-600 border-green-600" 
                    : "border-gray-300 bg-white"
                }`}>
                  {pref.checked && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {pref.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {pref.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSaveChoices}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors"
              data-testid="button-save-choices"
            >
              Save My Choices
            </Button>
            
            <Button
              onClick={handleSkipForNow}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 py-4 text-lg font-medium rounded-xl transition-colors"
              data-testid="button-skip-for-now"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-md">
          {/* Bell icon */}
          <div className="mb-8 text-center">
            <div className="w-20 h-20 mx-auto text-8xl">🔔</div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Stay Updated!
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-10 text-center">
            Choose how you want to get important messages from us.
          </p>

          {/* Preference options */}
          <div className="space-y-6 mb-10">
            {preferences.map((pref) => (
              <div
                key={pref.id}
                onClick={() => handleTogglePreference(pref.id)}
                className="flex items-start gap-4 cursor-pointer"
                data-testid={`preference-${pref.id}-desktop`}
              >
                <div className={`w-7 h-7 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  pref.checked 
                    ? "bg-green-600 border-green-600" 
                    : "border-gray-300 bg-white"
                }`}>
                  {pref.checked && <Check className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-xl">
                    {pref.title}
                  </h3>
                  <p className="text-gray-600">
                    {pref.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleSaveChoices}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
              data-testid="button-save-choices-desktop"
            >
              Save My Choices
            </Button>
            
            <Button
              onClick={handleSkipForNow}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
              data-testid="button-skip-for-now-desktop"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}