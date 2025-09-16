import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";

interface Plant {
  id: string;
  name: string;
  description: string;
  category: string;
  growthDuration: string;
  isActive: boolean;
  createdAt: string;
}

export function ViewCrops() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Validate farmer session
  useSessionValidation("farmer");

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

  // Fetch plants on component mount
  useEffect(() => {
    const fetchPlants = async () => {
      const token = getAuthToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again.",
        });
        setLocation("/login");
        return;
      }

      try {
        console.log("Fetching plants from API...");
        const response = await fetch("https://lucent-ag-api-damidek.replit.app/api/plants", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        console.log("Plants API Response Status:", response.status);

        if (response.status === 200) {
          const plants: Plant[] = await response.json();
          console.log("Plants fetched successfully:", plants);

          // Store plant IDs in sessionStorage
          const plantIds = plants.map(plant => ({
            id: plant.id,
            name: plant.name
          }));
          
          sessionStorage.setItem("availablePlants", JSON.stringify(plantIds));
          console.log("Plant IDs stored in sessionStorage:", plantIds);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("API Error:", errorData);
          
          toast({
            variant: "destructive",
            title: "Failed to Load Plants",
            description: errorData.message || "Could not fetch available plants.",
          });
        }
      } catch (error) {
        console.error("Error fetching plants:", error);
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your connection and try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlants();
  }, [toast, setLocation]);

  const handleGoBack = () => {
    setLocation("/farmer-dashboard");
  };

  const handleAddNewCrop = () => {
    setLocation("/add-new-crop");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 ml-4">
              Your Crops
            </h1>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-24">
            {/* Plant icon with background */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-8">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Crops Yet
            </h2>
            
            <p className="text-gray-600 text-base leading-relaxed mb-12">
              You have not added any crop yet.
            </p>

            <Button
              onClick={handleAddNewCrop}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 text-lg font-medium rounded-xl transition-colors"
              data-testid="button-add-new-crop"
            >
              Add New Crop
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-12">
            <button
              onClick={handleGoBack}
              className="p-3 -ml-3 hover:bg-gray-100 rounded-xl transition-colors"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-8 h-8 text-gray-900" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 ml-6">
              Your Crops
            </h1>
          </div>

          {/* Empty state */}
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            {/* Plant icon with background */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10">
              <Leaf className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              No Crops Yet
            </h2>
            
            <p className="text-gray-600 text-xl leading-relaxed mb-16">
              You have not added any crop yet.
            </p>

            <Button
              onClick={handleAddNewCrop}
              className="bg-green-700 hover:bg-green-800 text-white px-12 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
              data-testid="button-add-new-crop-desktop"
            >
              Add New Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}