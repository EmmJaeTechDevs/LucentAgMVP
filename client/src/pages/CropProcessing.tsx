import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf, Check } from "lucide-react";

interface ProcessingMethod {
  id: string;
  name: string;
  checked: boolean;
}

interface CropProcessing {
  cropName: string;
  methods: ProcessingMethod[];
}

export function CropProcessing() {
  const [, setLocation] = useLocation();
  
  // This would normally come from the previous page's selections
  // For demo, showing Maize and Cassava as selected crops
  const [cropProcessing, setCropProcessing] = useState<CropProcessing[]>([
    {
      cropName: "Maize",
      methods: [
        { id: "maize-drying", name: "Drying", checked: false },
        { id: "maize-milling", name: "Milling", checked: false },
        { id: "maize-none", name: "I don't process", checked: false }
      ]
    },
    {
      cropName: "Cassava", 
      methods: [
        { id: "cassava-drying", name: "Drying", checked: false },
        { id: "cassava-garri", name: "Garri Production", checked: false },
        { id: "cassava-flour", name: "Flour Production", checked: false },
        { id: "cassava-none", name: "I don't process", checked: false }
      ]
    }
  ]);

  const handleToggleMethod = (cropIndex: number, methodId: string) => {
    setCropProcessing(prev => 
      prev.map((crop, index) => 
        index === cropIndex 
          ? {
              ...crop,
              methods: crop.methods.map(method =>
                method.id === methodId 
                  ? { ...method, checked: !method.checked }
                  : method
              )
            }
          : crop
      )
    );
  };

  const handleSave = () => {
    console.log("Crop processing data:", cropProcessing);
    // Navigate to dashboard or next step
    setLocation("/dashboard");
  };

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
            Do you process any of your harvest?
          </h1>
          
          <p className="text-gray-600 text-base leading-relaxed mb-8 text-center">
            Let us know which crops you process and how you do it.
          </p>

          {/* Processing sections for each crop */}
          <div className="space-y-8 mb-8">
            {cropProcessing.map((crop, cropIndex) => (
              <div key={crop.cropName} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  How do you process {crop.cropName}?
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select all that apply
                </p>
                
                <div className="space-y-3">
                  {crop.methods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handleToggleMethod(cropIndex, method.id)}
                      className="flex items-center gap-3 cursor-pointer"
                      data-testid={`method-${method.id}`}
                    >
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        method.checked 
                          ? "bg-green-600 border-green-600" 
                          : "border-gray-300 bg-white"
                      }`}>
                        {method.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-gray-900 font-medium">
                        {method.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors"
            data-testid="button-save"
          >
            Save
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
            Do you process any of your harvest?
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-12 text-center max-w-md mx-auto">
            Let us know which crops you process and how you do it.
          </p>

          {/* Processing sections for each crop */}
          <div className="space-y-10 mb-12">
            {cropProcessing.map((crop, cropIndex) => (
              <div key={crop.cropName} className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  How do you process {crop.cropName}?
                </h2>
                <p className="text-gray-600 mb-6">
                  Select all that apply
                </p>
                
                <div className="space-y-4">
                  {crop.methods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handleToggleMethod(cropIndex, method.id)}
                      className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      data-testid={`method-${method.id}-desktop`}
                    >
                      <div className={`w-7 h-7 rounded border-2 flex items-center justify-center transition-colors ${
                        method.checked 
                          ? "bg-green-600 border-green-600" 
                          : "border-gray-300 bg-white"
                      }`}>
                        {method.checked && <Check className="w-5 h-5 text-white" />}
                      </div>
                      <span className="text-gray-900 font-medium text-lg">
                        {method.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="text-center">
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white px-16 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
              data-testid="button-save-desktop"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}