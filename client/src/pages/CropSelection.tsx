import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Plus } from "lucide-react";

interface Crop {
  id: string;
  name: string;
  selected: boolean;
}

export function CropSelection() {
  const [, setLocation] = useLocation();
  const [crops, setCrops] = useState<Crop[]>([
    { id: "maize", name: "Maize", selected: true },
    { id: "tomatoes", name: "Tomatoes", selected: false },
    { id: "yam", name: "Yam", selected: false },
    { id: "beans", name: "Beans", selected: false },
    { id: "groundnuts", name: "Groundnuts", selected: false },
    { id: "rice", name: "Rice", selected: false },
    { id: "cassava", name: "Cassava", selected: false },
    { id: "pepper", name: "Pepper", selected: false }
  ]);

  const handleToggleCrop = (id: string) => {
    setCrops(prev => 
      prev.map(crop => 
        crop.id === id ? { ...crop, selected: !crop.selected } : crop
      )
    );
  };

  const handleAddNew = () => {
    // For now, just show an alert - this could open a modal to add custom crops
    alert("Add new crop functionality would be implemented here");
  };

  const handleNext = () => {
    const selectedCrops = crops.filter(crop => crop.selected);
    console.log("Selected crops:", selectedCrops);
    // Navigate to crop processing page
    setLocation("/crop-processing");
  };

  const hasSelectedCrops = crops.some(crop => crop.selected);

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