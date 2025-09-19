import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";

interface CropFormData {
  cropType: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  priceUnit: string;
  harvestDate: string;
  state: string;
  lga: string;
  farmAddress: string;
  description: string;
}

interface Plant {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export function AddNewCrop() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [availablePlants, setAvailablePlants] = useState<Plant[]>([]);
  const [hasValidPlants, setHasValidPlants] = useState(false);

  // Validate farmer session
  useSessionValidation("farmer");
  
  const [formData, setFormData] = useState<CropFormData>({
    cropType: "",
    quantity: "",
    unit: "bags",
    pricePerUnit: "",
    priceUnit: "Per Bag",
    harvestDate: "",
    state: "",
    lga: "",
    farmAddress: "",
    description: ""
  });

  const handleGoBack = () => {
    setLocation("/view-crops");
  };

  const handleInputChange = (field: keyof CropFormData, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Reset LGA when state changes
      if (field === 'state') {
        newData.lga = '';
      }
      
      return newData;
    });
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

  // Get plant ID from stored plants data - NO FALLBACK GENERATION
  const getPlantId = (cropType: string): string | null => {
    try {
      const matchingPlant = availablePlants.find((plant: Plant) => 
        plant.name.toLowerCase() === cropType.toLowerCase()
      );
      
      if (matchingPlant) {
        console.log(`Found plant ID ${matchingPlant.id} for crop ${cropType}`);
        return matchingPlant.id;
      } else {
        console.warn(`No plant ID found for crop type: ${cropType}`);
        return null; // Return null instead of generating synthetic ID
      }
    } catch (error) {
      console.error("Error getting plant ID:", error);
      return null;
    }
  };

  // Fetch plants from API
  const fetchPlants = async (): Promise<Plant[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(`${BaseUrl}/api/plants`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (response.status !== 200) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch plants");
    }

    return await response.json();
  };

  // Check for plants data and fetch if needed
  useEffect(() => {
    const initializePlants = async () => {
      setIsLoadingPlants(true);
      
      try {
        // First check if plants are already in sessionStorage
        const storedPlants = sessionStorage.getItem("availablePlants");
        
        if (storedPlants) {
          const plants: Plant[] = JSON.parse(storedPlants);
          if (plants && plants.length > 0) {
            console.log("Using cached plants data:", plants);
            setAvailablePlants(plants);
            setHasValidPlants(true);
            setIsLoadingPlants(false);
            return;
          }
        }

        // If no cached plants, fetch from API
        console.log("No cached plants found, fetching from API...");
        const plants = await fetchPlants();
        
        if (plants && plants.length > 0) {
          console.log("Plants fetched successfully:", plants);
          setAvailablePlants(plants);
          setHasValidPlants(true);
          
          // Store in sessionStorage for future use
          sessionStorage.setItem("availablePlants", JSON.stringify(plants));
        } else {
          console.warn("No plants available from API");
          setHasValidPlants(false);
          toast({
            variant: "destructive",
            title: "No Crops Available",
            description: "No crop types are currently available. Please try again later.",
          });
        }
      } catch (error) {
        console.error("Error initializing plants:", error);
        setHasValidPlants(false);
        toast({
          variant: "destructive",
          title: "Failed to Load Crops",
          description: error instanceof Error ? error.message : "Could not load available crop types. Please try again.",
        });
        
        // Redirect back to view crops after a delay
        setTimeout(() => setLocation("/view-crops"), 2000);
      } finally {
        setIsLoadingPlants(false);
      }
    };

    initializePlants();
  }, [toast, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = getAuthToken();
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in again.",
      });
      setLocation("/login");
      setIsSubmitting(false);
      return;
    }

    try {
      // Format harvest date to exact string format server expects: "2024-03-15T00:00:00Z"
      const formatDateForServer = (dateString: string): string => {
        // HTML date input provides YYYY-MM-DD format, just append the time portion
        return `${dateString}T00:00:00Z`;
      };
      
      // Get today's date in YYYY-MM-DD format as fallback
      const getTodayDateString = (): string => {
        const today = new Date();
        const year = today.getUTCFullYear();
        const month = String(today.getUTCMonth() + 1).padStart(2, '0');
        const day = String(today.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const harvestDate = formData.harvestDate 
        ? formatDateForServer(formData.harvestDate)
        : formatDateForServer(getTodayDateString());

      const plantId = getPlantId(formData.cropType);
      if (!plantId) {
        toast({
          variant: "destructive",
          title: "Invalid Crop Selection",
          description: "The selected crop type is not recognized. Please choose a different crop or try refreshing the page.",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare request body according to API structure
      const requestBody = {
        plantId: plantId,
        totalQuantity: parseInt(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        harvestDate: harvestDate,
        state: formData.state,
        lga: formData.lga,
        farmAddress: formData.farmAddress,
        description: formData.description
      };

      console.log("Sending crop data:", requestBody);

      const response = await fetch(`${BaseUrl}/api/farmer/crops`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      console.log("API Response Status:", response.status);

      if (response.status === 201) {
        const responseData = await response.json();
        console.log("Crop created successfully:", responseData);
        
        toast({
          title: "✅ Crop Added Successfully!",
          description: "Your crop has been saved to your farm.",
        });

        // Navigate back to view crops
        setLocation("/view-crops");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        
        toast({
          variant: "destructive",
          title: "Failed to Add Crop",
          description: errorData.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error saving crop:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get dynamic crop types from fetched plants data
  const getCropTypes = (): string[] => {
    return availablePlants.map(plant => plant.name).sort();
  };

  // Units
  const units = ["Bags", "Tonnes", "Kilograms", "Pieces", "Bunches", "Baskets"];

  // Price units
  const priceUnits = ["Per Bag", "Per Tonne", "Per Kilogram", "Per Piece", "Per Bunch", "Per Basket"];

  // Nigerian states
  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
    "Yobe", "Zamfara"
  ];

  // Get LGAs based on state
  const getStateLGAs = (state: string): string[] => {
    switch (state) {
      case "Lagos":
        return ["Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry", "Epe", "Eti-Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"];
      case "Ogun":
        return ["Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", "Ijebu East", "Ijebu North", "Ijebu Ode", "Ikenne", "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Remo North", "Sagamu"];
      case "Kano":
        return ["Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Dala", "Dambatta", "Fagge", "Gabasawa", "Garko", "Gaya", "Gezawa", "Gwale", "Kano Municipal", "Karaye", "Kiru", "Kumbotso", "Madobi", "Nasarawa", "Rano", "Tarauni", "Ungogo"];
      case "FCT":
        return ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Municipal Area Council", "Kwali"];
      default:
        return ["Municipal", "Central", "North", "South", "East", "West"];
    }
  };

  // Show loading screen while fetching plants
  if (isLoadingPlants) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Available Crops</h2>
          <p className="text-gray-600">Please wait while we fetch the latest crop types...</p>
        </div>
      </div>
    );
  }

  // Show error screen if no valid plants
  if (!hasValidPlants) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Crops Available</h2>
          <p className="text-gray-600 mb-6">We couldn't load the available crop types. Please try again later.</p>
          <button
            onClick={handleGoBack}
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            data-testid="button-back-error"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-6">
            <button
              onClick={handleGoBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Add a New Crop
            </h1>
            <p className="text-gray-600 text-base">
              Tell us what you're planting!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* What are you planting? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                What are you planting?
              </label>
              <select
                value={formData.cropType}
                onChange={(e) => handleInputChange("cropType", e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-gray-900"
                data-testid="select-crop-type"
                required
                disabled={isLoadingPlants || !hasValidPlants}
              >
                <option value="">
                  {isLoadingPlants ? "Loading crops..." : (hasValidPlants ? "Select a crop" : "No crops available")}
                </option>
                {hasValidPlants && getCropTypes().map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* How much will you grow? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                How much will you grow?
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="e.g 25 Bags"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-quantity"
                  required
                />
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className="w-24 px-3 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  data-testid="select-unit"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* What's the price per unit? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                What's the price per unit?
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="e.g 2,500"
                  value={formData.pricePerUnit}
                  onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                  className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-price"
                  required
                />
                <select
                  value={formData.priceUnit}
                  onChange={(e) => handleInputChange("priceUnit", e.target.value)}
                  className="w-28 px-3 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-sm"
                  data-testid="select-price-unit"
                >
                  {priceUnits.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* When will it be ready to harvest? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                When will it be ready to harvest?
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-500"
                  data-testid="input-harvest-date"
                  placeholder="Tell us when your crop will be ready"
                  required
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Where is your crop growing? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                Where is your crop growing?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    State (e.g Lagos)
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    data-testid="select-state"
                    required
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    LGA (e.g Ikeja)
                  </label>
                  <select
                    value={formData.lga}
                    onChange={(e) => handleInputChange("lga", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    data-testid="select-lga"
                    required
                    disabled={!formData.state}
                  >
                    <option value="">Select LGA</option>
                    {formData.state && getStateLGAs(formData.state).map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Farm Address */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                Farm Address
              </label>
              <input
                type="text"
                placeholder="e.g Plot 123, Farm Road, Ikeja"
                value={formData.farmAddress}
                onChange={(e) => handleInputChange("farmAddress", e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                data-testid="input-farm-address"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                Description
              </label>
              <textarea
                placeholder="e.g High-quality maize, organic farming"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                data-testid="textarea-description"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingPlants || !hasValidPlants}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                data-testid="button-save-crop"
              >
                {isSubmitting ? "Saving..." : (isLoadingPlants ? "Loading..." : (!hasValidPlants ? "No Crops Available" : "Save My Crop"))}
              </button>
            </div>
          </form>
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
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Add a New Crop
              </h1>
              <p className="text-gray-600 text-xl">
                Tell us what you're planting!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* What are you planting? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  What are you planting?
                </label>
                <select
                  value={formData.cropType}
                  onChange={(e) => handleInputChange("cropType", e.target.value)}
                  className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-gray-900 text-lg"
                  data-testid="select-crop-type-desktop"
                  required
                  disabled={isLoadingPlants || !hasValidPlants}
                >
                  <option value="">
                    {isLoadingPlants ? "Loading crops..." : (hasValidPlants ? "Select a crop" : "No crops available")}
                  </option>
                  {hasValidPlants && getCropTypes().map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              {/* How much will you grow? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  How much will you grow?
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="e.g 25 Bags"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange("quantity", e.target.value)}
                    className="flex-1 px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-quantity-desktop"
                    required
                  />
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                    className="w-32 px-4 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                    data-testid="select-unit-desktop"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* What's the price per unit? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  What's the price per unit?
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="e.g 2,500"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                    className="flex-1 px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-price-desktop"
                    required
                  />
                  <select
                    value={formData.priceUnit}
                    onChange={(e) => handleInputChange("priceUnit", e.target.value)}
                    className="w-36 px-4 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                    data-testid="select-price-unit-desktop"
                  >
                    {priceUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* When will it be ready to harvest? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  When will it be ready to harvest?
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                    className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-500 text-lg"
                    data-testid="input-harvest-date-desktop"
                    placeholder="Tell us when your crop will be ready"
                    required
                  />
                  <Calendar className="w-6 h-6 text-gray-400 absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Where is your crop growing? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  Where is your crop growing?
                </label>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      State (e.g Lagos)
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                      data-testid="select-state-desktop"
                      required
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      LGA (e.g Ikeja)
                    </label>
                    <select
                      value={formData.lga}
                      onChange={(e) => handleInputChange("lga", e.target.value)}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white text-lg"
                      data-testid="select-lga-desktop"
                      required
                      disabled={!formData.state}
                    >
                      <option value="">Select LGA</option>
                      {formData.state && getStateLGAs(formData.state).map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Farm Address */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  Farm Address
                </label>
                <input
                  type="text"
                  placeholder="e.g Plot 123, Farm Road, Ikeja"
                  value={formData.farmAddress}
                  onChange={(e) => handleInputChange("farmAddress", e.target.value)}
                  className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                  data-testid="input-farm-address-desktop"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  Description
                </label>
                <textarea
                  placeholder="e.g High-quality maize, organic farming"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-lg"
                  data-testid="textarea-description-desktop"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingPlants || !hasValidPlants}
                  className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-6 rounded-xl font-semibold text-xl transition-all hover:scale-105 disabled:hover:scale-100"
                  data-testid="button-save-crop-desktop"
                >
                  {isSubmitting ? "Saving..." : (isLoadingPlants ? "Loading..." : (!hasValidPlants ? "No Crops Available" : "Save My Crop"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}