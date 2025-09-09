import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Crop {
  id: string;
  name: string;
  selected: boolean;
  category?: string;
  landSize?: string;
  notes?: string;
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
  
  console.log("📋 Raw server response structure:", JSON.stringify(farmerPlantsData, null, 2));
  
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
    if (plant && typeof plant === 'object') {
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
          category: category || 'Unknown',
          landSize: landSize || 'Unknown',
          notes: notes || '',
        });
      } else {
        console.error(`❌ Could not extract plant name from:`, plant);
        console.error(`Available properties:`, Object.keys(plant));
      }
    } else {
      console.error(`❌ Invalid plant data at index ${index}:`, plant);
    }
  });
  
  console.log(`✅ Successfully mapped ${mappedCrops.length} out of ${farmerPlantsData.length} plants`);
  console.log("Final mapped crops:", mappedCrops.map(c => c.name));
  return mappedCrops;
};

// Default crops to merge with farmer's existing plants
const getDefaultCrops = (): Crop[] => [
  { id: "maize", name: "Maize", selected: false },
  { id: "tomatoes", name: "Tomatoes", selected: false },
  { id: "yam", name: "Yam", selected: false },
  { id: "beans", name: "Beans", selected: false },
  { id: "groundnuts", name: "Groundnuts", selected: false },
  { id: "rice", name: "Rice", selected: false },
  { id: "cassava", name: "Cassava", selected: false },
  { id: "pepper", name: "Pepper", selected: false }
];

// Function to merge farmer crops with default crops, avoiding duplicates
const mergeCropsWithDefaults = (farmerCrops: Crop[], defaultCrops: Crop[]): Crop[] => {
  const existingCropNames = farmerCrops.map(crop => crop.name.toLowerCase());
  const additionalCrops = defaultCrops.filter(
    defaultCrop => !existingCropNames.includes(defaultCrop.name.toLowerCase())
  );
  
  console.log("Merging", farmerCrops.length, "farmer crops with", additionalCrops.length, "additional crops");
  return [...farmerCrops, ...additionalCrops];
};

export function CropSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load and process farmer plants data from sessionStorage on component mount
  useEffect(() => {
    const loadFarmerPlants = () => {
      console.log("Starting to load farmer plants data from sessionStorage...");
      
      try {
        const farmerPlantsData = sessionStorage.getItem("farmerPlantsData");
        
        if (farmerPlantsData) {
          // Parse the server response
          const serverResponse: FarmerPlant[] = JSON.parse(farmerPlantsData);
          console.log("✅ Found farmer plants data from server:", serverResponse);
          
          // Use mapping function to convert server response to crop format
          const farmerCrops = mapFarmerPlantsTocrops(serverResponse);
          
          if (farmerCrops.length > 0) {
            // Only show farmer's actual crops from API response
            console.log("✅ Successfully populated crops dynamically:", farmerCrops.map(c => c.name));
            setCrops(farmerCrops);
          } else {
            // No farmer plants found, show empty state or minimal default
            console.log("No valid farmer plants to map, showing empty crop list");
            setCrops([]);
          }
        } else {
          // No data in sessionStorage, show empty state
          console.log("❌ No farmer plants data found in sessionStorage, showing empty crop list");
          setCrops([]);
        }
      } catch (error) {
        console.error("❌ Error processing farmer plants data:", error);
        // Error occurred, show empty state
        setCrops([]);
      } finally {
        setIsLoading(false);
        console.log("✅ Crop selection page populated successfully");
      }
    };

    loadFarmerPlants();
  }, []);

  const handleToggleCrop = (id: string) => {
    setCrops(prev => 
      prev.map(crop => 
        crop.id === id ? { ...crop, selected: !crop.selected } : crop
      )
    );
  };

  const handleAddNew = () => {
    // For now, just show a toast - this could open a modal to add custom crops
    toast({
      title: "Feature Coming Soon",
      description: "Add new crop functionality would be implemented here",
    });
  };

  const handleNext = () => {
    const selectedCrops = crops.filter(crop => crop.selected);
    console.log("Selected crops:", selectedCrops);
    // Navigate to crop processing page
    setLocation("/crop-processing");
  };

  const hasSelectedCrops = crops.some(crop => crop.selected);

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
            What do you grow on your farm?
          </h1>
          
          <p className="text-gray-600 text-base leading-relaxed mb-8 text-center">
            Tell us what you produce. This helps us connect you with the right buyers.
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
                  <Leaf className={`w-6 h-6 mb-2 ${crop.selected ? "text-green-600" : "text-gray-400"}`} />
                  <span className={`text-sm font-medium ${crop.selected ? "text-green-600" : "text-gray-700"}`}>
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

          {/* Next button */}
          <Button
            onClick={handleNext}
            disabled={!hasSelectedCrops}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-next"
          >
            Next
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
            What do you grow on your farm?
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-12 text-center max-w-md mx-auto">
            Tell us what you produce. This helps us connect you with the right buyers.
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
                  <Leaf className={`w-8 h-8 mb-3 ${crop.selected ? "text-green-600" : "text-gray-400"}`} />
                  <span className={`text-lg font-medium ${crop.selected ? "text-green-600" : "text-gray-700"}`}>
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

          {/* Next button */}
          <div className="text-center">
            <Button
              onClick={handleNext}
              disabled={!hasSelectedCrops}
              className="bg-green-600 hover:bg-green-700 text-white px-16 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="button-next-desktop"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}