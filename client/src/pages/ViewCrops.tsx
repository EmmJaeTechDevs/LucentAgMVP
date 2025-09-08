import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";

export function ViewCrops() {
  const [, setLocation] = useLocation();

  // Validate farmer session
  useSessionValidation("farmer");

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