import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";

interface Crop {
  id: string;
  name: string;
  selected: boolean;
  category?: string;
  landSize?: string;
  notes?: string;
}

interface CropDetails {
  [plantId: string]: {
    landSize: string;
    notes: string;
  };
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

// Mapping function to convert server response to crop format
const mapFarmerPlantsTocrops = (farmerPlantsData: any[]): Crop[] => {
  if (!farmerPlantsData || farmerPlantsData.length === 0) {
    console.log("No farmer plants data to map");
    return [];
  }

  console.log(
    "📋 Raw server response structure:",
    JSON.stringify(farmerPlantsData, null, 2),
  );

  // Transform each farmer plant into crop format with safe property access
  const mappedCrops: Crop[] = [];

  farmerPlantsData.forEach((plant, index) => {
    console.log(`🔍 Processing plant ${index + 1}:`, plant);

    // Check different possible data structures
    let plantName = null;
    let plantId = null;
    let category = null;
    let landSize = null;
    let notes = null;

    // Try different ways the server might structure the data
    if (plant && typeof plant === "object") {
      // Case 1: Expected structure { plant: { name: string, category: string }, plantId: string, ... }
      if (plant.plant && plant.plant.name) {
        plantName = plant.plant.name;
        plantId = plant.plantId || plant.id;
        category = plant.plant.category;
        landSize = plant.landSize;
        notes = plant.notes;
      }
      // Case 2: Flattened structure { name: string, category: string, id: string, ... }
      else if (plant.name) {
        plantName = plant.name;
        plantId = plant.id || plant.plantId;
        category = plant.category;
        landSize = plant.landSize;
        notes = plant.notes;
      }
      // Case 3: Different nesting { plantDetails: { name: string }, ... }
      else if (plant.plantDetails && plant.plantDetails.name) {
        plantName = plant.plantDetails.name;
        plantId = plant.id || plant.plantId;
        category = plant.plantDetails.category;
        landSize = plant.landSize;
        notes = plant.notes;
      }

      // If we found a valid plant name, add it to crops
      if (plantName) {
        console.log(`✅ Successfully extracted plant: ${plantName}`);
        mappedCrops.push({
          id: plantId || `plant_${index}`,
          name: plantName,
          selected: true,
          category: category || "Unknown",
          landSize: landSize || "Unknown",
          notes: notes || "",
        });
      } else {
        console.error(`❌ Could not extract plant name from:`, plant);
        console.error(`Available properties:`, Object.keys(plant));
      }
    } else {
      console.error(`❌ Invalid plant data at index ${index}:`, plant);
    }
  });

  console.log(
    `✅ Successfully mapped ${mappedCrops.length} out of ${farmerPlantsData.length} plants`,
  );
  console.log(
    "Final mapped crops:",
    mappedCrops.map((c) => c.name),
  );
  return mappedCrops;
};

// Function to convert backend plants data to crop selection format
const mapBackendPlantsToSelectionCrops = (plantsData: any[]): Crop[] => {
  if (!plantsData || plantsData.length === 0) {
    console.log("No backend plants data to map");
    return [];
  }

  console.log(
    "📋 Raw backend plants data:",
    JSON.stringify(plantsData, null, 2),
  );

  const mappedCrops: Crop[] = [];

  plantsData.forEach((plant, index) => {
    console.log(`🔍 Processing backend plant ${index + 1}:`, plant);

    let plantId = null;
    let plantName = null;
    let category = null;

    // Handle different possible data structures from backend
    if (plant && typeof plant === "object") {
      // Case 1: Direct structure { id: string, name: string, category: string }
      if (plant.id && plant.name) {
        plantId = plant.id;
        plantName = plant.name;
        category = plant.category;
      }
      // Case 2: Nested structure { plant: { id: string, name: string } }
      else if (plant.plant && plant.plant.id && plant.plant.name) {
        plantId = plant.plant.id;
        plantName = plant.plant.name;
        category = plant.plant.category;
      }
      // Case 3: Other naming conventions
      else if (plant.plantId && plant.plantName) {
        plantId = plant.plantId;
        plantName = plant.plantName;
        category = plant.plantCategory;
      }

      if (plantId && plantName) {
        console.log(
          `✅ Successfully extracted plant: ${plantName} (${plantId})`,
        );
        mappedCrops.push({
          id: plantId,
          name: plantName,
          selected: false, // Available for selection, not pre-selected
          category: category || "Unknown",
        });
      } else {
        console.error(`❌ Could not extract plant data from:`, plant);
        console.error(`Available properties:`, Object.keys(plant));
      }
    } else {
      console.error(`❌ Invalid plant data at index ${index}:`, plant);
    }
  });

  console.log(
    `✅ Successfully mapped ${mappedCrops.length} out of ${plantsData.length} backend plants`,
  );
  console.log(
    "Final mapped crops for selection:",
    mappedCrops.map((c) => `${c.name} (${c.id})`),
  );
  return mappedCrops;
};

// Function to merge farmer crops with default crops, avoiding duplicates
const mergeCropsWithDefaults = (
  farmerCrops: Crop[],
  defaultCrops: Crop[],
): Crop[] => {
  const existingCropNames = farmerCrops.map((crop) => crop.name.toLowerCase());
  const additionalCrops = defaultCrops.filter(
    (defaultCrop) =>
      !existingCropNames.includes(defaultCrop.name.toLowerCase()),
  );

  console.log(
    "Merging",
    farmerCrops.length,
    "farmer crops with",
    additionalCrops.length,
    "additional crops",
  );
  return [...farmerCrops, ...additionalCrops];
};

export function CropSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cropDetails, setCropDetails] = useState<CropDetails>({});

  // Fetch plants data directly from API on component mount
  useEffect(() => {
    const fetchPlantsFromAPI = async () => {
      console.log("Fetching plants data directly from API...");

      const token = getAuthToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again.",
        });
        setLocation("/login");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BaseUrl}/api/plants`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("Plants API response status:", response.status);

        if (response.status === 200) {
          const plantsData = await response.json();
          console.log("✅ Fetched plants data:", plantsData);

          // Convert backend plants to crop selection format
          const backendCrops = mapBackendPlantsToSelectionCrops(plantsData);

          if (backendCrops.length > 0) {
            console.log(
              "✅ Successfully loaded backend crops for selection:",
              backendCrops.map((c) => c.name),
            );
            setCrops(backendCrops);
          } else {
            console.log("❌ No valid backend crops found, showing empty state");
            setCrops([]);
          }
        } else if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Unauthorized",
            description: "Please log in again.",
          });
          setLocation("/login");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load available crops.",
          });
          setCrops([]);
        }
      } catch (error) {
        console.error("❌ Error fetching plants from API:", error);
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your connection and try again.",
        });
        setCrops([]);
      } finally {
        setIsLoading(false);
        console.log("✅ Crop selection page loaded successfully");
      }
    };

    fetchPlantsFromAPI();
  }, []);

  const handleToggleCrop = (id: string) => {
    setCrops((prev) =>
      prev.map((crop) => {
        if (crop.id === id) {
          const newSelected = !crop.selected;
          // If deselecting, remove the crop details
          if (!newSelected && cropDetails[id]) {
            setCropDetails((prevDetails) => {
              const newDetails = { ...prevDetails };
              delete newDetails[id];
              return newDetails;
            });
          }
          // If selecting, initialize crop details
          else if (newSelected && !cropDetails[id]) {
            setCropDetails((prevDetails) => ({
              ...prevDetails,
              [id]: { landSize: "", notes: "" },
            }));
          }
          return { ...crop, selected: newSelected };
        }
        return crop;
      }),
    );
  };

  const handleCropDetailChange = (
    plantId: string,
    field: "landSize" | "notes",
    value: string,
  ) => {
    setCropDetails((prev) => ({
      ...prev,
      [plantId]: {
        ...prev[plantId],
        [field]: value,
      },
    }));
  };

  const handleAddNew = () => {
    // For now, just show a toast - this could open a modal to add custom crops
    toast({
      title: "Feature Coming Soon",
      description: "Add new crop functionality would be implemented here",
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

  const fetchQuestionsForSelectedCrops = async (plantIds: string[]) => {
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
      const requestBody = { plantIds };
      console.log(
        "🌱 Sending generic plant IDs to questions API:",
        requestBody,
      );

      const response = await fetch(`${BaseUrl}/api/farmer/plants/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📊 Questions API response status:", response.status);

      if (response.status === 200) {
        const questionsData = await response.json();
        console.log("✅ Questions API Response:", questionsData);

        // Store the questions data in sessionStorage for CropProcessing page
        sessionStorage.setItem(
          "cropQuestionsData",
          JSON.stringify(questionsData),
        );

        return questionsData;
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
          description: "Failed to fetch questions for selected crops.",
        });
        return null;
      }
    } catch (error) {
      console.error("❌ Error fetching crop questions:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
      return null;
    }
  };

  const addPlantToFarm = async (
    plantId: string,
    landSize: string,
    notes: string,
  ): Promise<string | null> => {
    const token = getAuthToken();

    if (!token) {
      console.error("❌ No auth token found");
      return null;
    }

    // Get farmer ID from sessionStorage
    const getUserId = () => {
      try {
        const sessionData = sessionStorage.getItem("farmerSession");
        if (sessionData) {
          const encryptedData = JSON.parse(sessionData);
          const parsed = SessionCrypto.decryptSessionData(encryptedData);
          return parsed.userId;
        }
      } catch (error) {
        console.error("Error getting user ID:", error);
      }
      return null;
    };

    const farmerId = getUserId();

    if (!farmerId) {
      console.error("❌ No farmer ID found in session");
      return null;
    }

    try {
      const requestBody = {
        plantId,
        landSize,
        notes,
        farmerId,
      };

      console.log(`🌱 Adding plant to farm:`, requestBody);

      const response = await fetch(`${BaseUrl}/api/farmer/plants`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📊 Plant ${plantId} add response status:`, response.status);

      if (response.status === 200 || response.status === 201) {
        const responseData = await response.json();
        console.log(`✅ Successfully added plant ${plantId}:`, responseData);

        // Extract the farmer plant ID from the response
        // Based on console output, the server returns { message: "...", farmerPlant: { id: "..." } }
        let farmerPlantId = null;

        if (responseData.farmerPlant && responseData.farmerPlant.id) {
          farmerPlantId = responseData.farmerPlant.id;
        } else if (responseData.id) {
          farmerPlantId = responseData.id;
        } else if (responseData.farmerPlantId) {
          farmerPlantId = responseData.farmerPlantId;
        } else if (responseData.plantId) {
          farmerPlantId = responseData.plantId;
        }

        if (farmerPlantId) {
          console.log(`📋 Extracted farmer plant ID: ${farmerPlantId}`);
          return farmerPlantId;
        } else {
          console.error(
            `❌ No farmer plant ID found in response:`,
            responseData,
          );
          // Log the structure to help with debugging
          console.error(`Response structure:`, Object.keys(responseData));
          if (responseData.farmerPlant) {
            console.error(
              `FarmerPlant object structure:`,
              Object.keys(responseData.farmerPlant),
            );
          }
          return null;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Failed to add plant ${plantId}:`, errorData);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error adding plant ${plantId}:`, error);
      return null;
    }
  };

  const handleNext = async () => {
    const selectedCrops = crops.filter((crop) => crop.selected);
    console.log("🎯 Selected crops:", selectedCrops);

    if (selectedCrops.length === 0) {
      toast({
        variant: "destructive",
        title: "No Crops Selected",
        description: "Please select at least one crop to continue.",
      });
      return;
    }

    // Validate that all selected crops have required land size (notes are optional)
    const invalidCrops = selectedCrops.filter((crop) => {
      const details = cropDetails[crop.id];
      return !details || !details.landSize.trim();
    });

    if (invalidCrops.length > 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Information",
        description: "Please fill in land size for all selected crops.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Step 1: Add all selected plants to farmer's account and collect farmer plant IDs
      console.log("🌱 Step 1: Adding plants to farmer's account...");
      const plantAddResults: {
        plantId: string;
        farmerPlantId: string | null;
      }[] = [];

      for (const crop of selectedCrops) {
        const details = cropDetails[crop.id];
        const farmerPlantId = await addPlantToFarm(
          crop.id,
          details.landSize,
          details.notes || "",
        );
        plantAddResults.push({ plantId: crop.id, farmerPlantId });
      }

      const failedPlants = plantAddResults.filter(
        (result) => !result.farmerPlantId,
      );

      if (failedPlants.length > 0) {
        console.error("❌ Some plants failed to add:", failedPlants);
        toast({
          variant: "destructive",
          title: "Error Adding Plants",
          description:
            "Some plants could not be added to your farm. Please try again.",
        });
        setIsSaving(false);
        return;
      }

      // Use the original generic plant IDs (not farmer plant IDs) for the questions API
      const genericPlantIds = plantAddResults
        .map((result) => result.plantId)
        .filter((id): id is string => id !== null);

      console.log("✅ All plants successfully added to farmer's account");
      console.log(
        "📋 Using generic plant IDs for questions API:",
        genericPlantIds,
      );

      // Step 2: Fetch questions for the selected plant types (using generic IDs)
      console.log("📋 Step 2: Fetching questions for selected plant types...");
      const questionsResult =
        await fetchQuestionsForSelectedCrops(genericPlantIds);

      if (questionsResult) {
        console.log(
          "✅ Successfully completed both steps: plants added and questions fetched",
        );
        // Navigate to crop processing page with questions data
        setLocation("/crop-processing");
      } else {
        console.error("❌ Failed to fetch questions after adding plants");
        toast({
          variant: "destructive",
          title: "Error",
          description:
            "Plants were added but failed to load questions. Please try again.",
        });
      }
    } catch (error) {
      console.error("❌ Error in handleNext:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "An error occurred while processing your request. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasSelectedCrops = crops.some((crop) => crop.selected);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your crops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-20 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Plant icon */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            What do you want to grow?
          </h1>

          <p className="text-gray-600 text-base leading-relaxed mb-8 text-center">
            Select the crops you want to add to your farm. This helps us connect
            you with the right buyers.
          </p>

          {/* Crop selection grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {crops.map((crop) => (
              <button
                key={crop.id}
                onClick={() => handleToggleCrop(crop.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  crop.selected
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                data-testid={`crop-${crop.id}`}
              >
                {/* Checkmark for selected */}
                {crop.selected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}

                <div className="flex flex-col items-center">
                  <Leaf
                    className={`w-6 h-6 mb-2 ${crop.selected ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span
                    className={`text-sm font-medium ${crop.selected ? "text-green-600" : "text-gray-700"}`}
                  >
                    {crop.name}
                  </span>
                </div>
              </button>
            ))}

            {/* Add New button */}
            <button
              onClick={handleAddNew}
              className="p-4 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all"
              data-testid="button-add-new"
            >
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Add New
                </span>
              </div>
            </button>
          </div>

          {/* Selected crops details section */}
          {hasSelectedCrops && (
            <div className="mb-8 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 text-center">
                Add Details for Selected Crops
              </h2>

              {crops
                .filter((crop) => crop.selected)
                .map((crop) => (
                  <div
                    key={crop.id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Leaf className="w-5 h-5 text-green-600" />
                      <h3 className="font-medium text-gray-900">{crop.name}</h3>
                    </div>

                    {/* <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Land Size
                        </label>
                        <input
                          type="text"
                          value={cropDetails[crop.id]?.landSize || ""}
                          onChange={(e) =>
                            handleCropDetailChange(
                              crop.id,
                              "landSize",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 2 acres"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          data-testid={`input-landsize-${crop.id}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={cropDetails[crop.id]?.notes || ""}
                          onChange={(e) =>
                            handleCropDetailChange(
                              crop.id,
                              "notes",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Located in north field, good soil quality"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          data-testid={`textarea-notes-${crop.id}`}
                        />
                      </div>
                    </div> */}
                  </div>
                ))}
            </div>
          )}

          {/* Next button */}
          <Button
            onClick={handleNext}
            disabled={!hasSelectedCrops || isSaving}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-next"
          >
            {isSaving ? "Adding Plants & Loading Questions..." : "Next"}
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-2xl">
          {/* Plant icon */}
          <div className="mb-10 text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Leaf className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            What do you want to grow?
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-12 text-center max-w-md mx-auto">
            Select the crops you want to add to your farm. This helps us connect
            you with the right buyers.
          </p>

          {/* Crop selection grid */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {crops.map((crop) => (
              <button
                key={crop.id}
                onClick={() => handleToggleCrop(crop.id)}
                className={`relative p-6 rounded-3xl border-2 transition-all hover:scale-105 ${
                  crop.selected
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                data-testid={`crop-${crop.id}-desktop`}
              >
                {/* Checkmark for selected */}
                {crop.selected && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                )}

                <div className="flex flex-col items-center">
                  <Leaf
                    className={`w-8 h-8 mb-3 ${crop.selected ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span
                    className={`text-lg font-medium ${crop.selected ? "text-green-600" : "text-gray-700"}`}
                  >
                    {crop.name}
                  </span>
                </div>
              </button>
            ))}

            {/* Add New button */}
            <button
              onClick={handleAddNew}
              className="p-6 rounded-3xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all hover:scale-105"
              data-testid="button-add-new-desktop"
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-700">
                  Add New
                </span>
              </div>
            </button>
          </div>

          {/* Selected crops details section - Desktop */}
          {hasSelectedCrops && (
            <div className="mb-12 space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Add Details for Selected Crops
              </h2>

              {crops
                .filter((crop) => crop.selected)
                .map((crop) => (
                  <div
                    key={crop.id}
                    className="bg-gray-50 rounded-2xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <Leaf className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {crop.name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Land Size
                        </label>
                        <input
                          type="text"
                          value={cropDetails[crop.id]?.landSize || ""}
                          onChange={(e) =>
                            handleCropDetailChange(
                              crop.id,
                              "landSize",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., 2 acres"
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          data-testid={`input-landsize-${crop.id}-desktop`}
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Notes
                        </label>
                        <textarea
                          value={cropDetails[crop.id]?.notes || ""}
                          onChange={(e) =>
                            handleCropDetailChange(
                              crop.id,
                              "notes",
                              e.target.value,
                            )
                          }
                          placeholder="e.g., Located in north field, good soil quality"
                          rows={3}
                          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                          data-testid={`textarea-notes-${crop.id}-desktop`}
                        />
                      </div> */}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Next button */}
          <div className="text-center">
            <Button
              onClick={handleNext}
              disabled={!hasSelectedCrops || isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-16 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="button-next-desktop"
            >
              {isSaving ? "Loading Questions..." : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
