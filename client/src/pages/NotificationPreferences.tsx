import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";

interface PreferenceOption {
  id: string;
  title: string;
  description: string;
  checked: boolean;
}

interface FarmerPlant {
  id: string;
  farmerId: string;
  plantId: string;
  landSize: string;
  notes: string;
  plant: {
    name: string;
    category: string;
  };
}

export function NotificationPreferences() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

  const getAuthToken = () => {
    try {
      const sessionData = sessionStorage.getItem("farmerSession");
      if (sessionData) {
        const encryptedData = JSON.parse(sessionData);
        const parsed = SessionCrypto.decryptSessionData(encryptedData);
        return parsed.token;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return null;
  };

  const fetchFarmerPlants = async () => {
    const token = getAuthToken();
    
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in again.",
      });
      setLocation("/login");
      return null;
    }

    try {
      const response = await fetch(`${BaseUrl}/api/farmer/plants`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      console.log("Farmer plants API response:", response.status);

      if (response.status === 200) {
        const plantsData: FarmerPlant[] = await response.json();
        console.log("Farmer plants data:", plantsData);
        
        // Store the plants data in sessionStorage for CropSelection page
        sessionStorage.setItem("farmerPlantsData", JSON.stringify(plantsData));
        
        return plantsData;
      } else if (response.status === 401) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "token required",
        });
        return null;
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch farmer plants data.",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching farmer plants:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
      return null;
    }
  };

  const handleSaveChoices = async () => {
    console.log("Notification preferences saved:", preferences);
    setIsLoading(true);
    
    // Fetch farmer plants data before navigating
    await fetchFarmerPlants();
    
    setIsLoading(false);
    // Navigate to crop selection
    setLocation("/crop-selection");
  };

  const handleSkipForNow = async () => {
    console.log("Skipped notification preferences");
    setIsLoading(true);
    
    // Fetch farmer plants data before navigating
    await fetchFarmerPlants();
    
    setIsLoading(false);
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
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-save-choices"
            >
              {isLoading ? "Loading..." : "Save My Choices"}
            </Button>
            
            <Button
              onClick={handleSkipForNow}
              disabled={isLoading}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 py-4 text-lg font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-skip-for-now"
            >
              {isLoading ? "Loading..." : "Skip for Now"}
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
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="button-save-choices-desktop"
            >
              {isLoading ? "Loading..." : "Save My Choices"}
            </Button>
            
            <Button
              onClick={handleSkipForNow}
              disabled={isLoading}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-600 hover:bg-gray-50 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="button-skip-for-now-desktop"
            >
              {isLoading ? "Loading..." : "Skip for Now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}