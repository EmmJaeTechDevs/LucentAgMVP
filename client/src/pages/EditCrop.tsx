import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";

interface EditCropFormData {
  totalQuantity: string;
  pricePerUnit: string;
  harvestDate: string;
  description: string;
}

interface Crop {
  id: string;
  plantId: string;
  totalQuantity: number;
  unit: string;
  pricePerUnit: number;
  harvestDate: string;
  state: string;
  lga: string;
  farmAddress: string;
  description: string;
  createdAt: string;
  plant?: {
    id: string;
    name: string;
  };
}

export function EditCrop() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropData, setCropData] = useState<Crop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate farmer session
  useSessionValidation("farmer");

  const [formData, setFormData] = useState<EditCropFormData>({
    totalQuantity: "",
    pricePerUnit: "",
    harvestDate: "",
    description: ""
  });

  const handleGoBack = () => {
    setLocation("/view-crops");
  };

  const handleInputChange = (field: keyof EditCropFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Get crop data from sessionStorage (passed from ViewCrops)
  useEffect(() => {
    const editCropData = sessionStorage.getItem("editCropData");
    if (editCropData) {
      try {
        const crop: Crop = JSON.parse(editCropData);
        setCropData(crop);
        
        // Pre-populate form with existing data
        // Safely handle harvest date formatting - keep it simple as string only
        let harvestDateForInput = "";
        if (crop.harvestDate) {
          if (crop.harvestDate.includes('T')) {
            // ISO format: "2024-12-30T00:00:00Z" -> "2024-12-30"
            harvestDateForInput = crop.harvestDate.split('T')[0];
          } else if (crop.harvestDate.includes('-') && crop.harvestDate.length >= 10) {
            // Already in YYYY-MM-DD format or similar
            harvestDateForInput = crop.harvestDate.substring(0, 10);
          } else {
            // For any other format, just use as-is or leave empty
            harvestDateForInput = "";
          }
        }
        
        setFormData({
          totalQuantity: crop.totalQuantity.toString(),
          pricePerUnit: crop.pricePerUnit.toString(),
          harvestDate: harvestDateForInput,
          description: crop.description
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing crop data:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Crop",
          description: "Could not load crop data. Please try again.",
        });
        setLocation("/view-crops");
      }
    } else {
      toast({
        variant: "destructive",
        title: "No Crop Selected",
        description: "Please select a crop to edit.",
      });
      setLocation("/view-crops");
    }
  }, [setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!cropData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No crop data available.",
      });
      setIsSubmitting(false);
      return;
    }

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
      // Convert date string to a proper Date object for JSON serialization
      let harvestDate: Date | string = "";
      if (formData.harvestDate) {
        // Create a Date object from the YYYY-MM-DD string
        // The API expects a Date object that will be serialized to JSON
        harvestDate = new Date(formData.harvestDate + "T00:00:00.000Z");
      }

      // Prepare request body according to API structure
      const requestBody = {
        totalQuantity: parseInt(formData.totalQuantity),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        harvestDate: harvestDate,
        description: formData.description
      };

      console.log("Updating crop data:", requestBody);

      const response = await fetch(`https://lucent-ag-api-damidek.replit.app/api/farmer/crops/${cropData.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      console.log("API Response Status:", response.status);

      if (response.status === 200) {
        const responseData = await response.json();
        console.log("Crop updated successfully:", responseData);
        
        toast({
          title: "✅ Crop Updated Successfully!",
          description: "Your crop details have been saved.",
        });

        // Clear the editCropData from sessionStorage
        sessionStorage.removeItem("editCropData");
        
        // Navigate back to view crops
        setLocation("/view-crops");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        
        toast({
          variant: "destructive",
          title: "Failed to Update Crop",
          description: errorData.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating crop:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading screen
  if (isLoading || !cropData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Crop Details</h2>
          <p className="text-gray-600">Please wait...</p>
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
              Edit Crop
            </h1>
            <p className="text-gray-600 text-base">
              Update your {cropData.plant?.name || 'crop'} details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* How much will you grow? */}
            <div>
              <label className="block text-base font-medium text-gray-900 mb-3">
                How much will you grow?
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="e.g 25"
                  value={formData.totalQuantity}
                  onChange={(e) => handleInputChange("totalQuantity", e.target.value)}
                  className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-quantity"
                  required
                />
                <div className="flex items-center px-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-700">
                  {cropData.unit}
                </div>
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
                  step="0.01"
                  placeholder="e.g 2500"
                  value={formData.pricePerUnit}
                  onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                  className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  data-testid="input-price"
                  required
                />
                <div className="flex items-center px-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 text-sm">
                  per {cropData.unit.slice(0, -1)}
                </div>
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
                  required
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
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
                disabled={isSubmitting}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors"
                data-testid="button-update-crop"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Updating...
                  </>
                ) : (
                  "Update Crop"
                )}
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
                Edit Crop
              </h1>
              <p className="text-gray-600 text-xl">
                Update your {cropData.plant?.name || 'crop'} details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* How much will you grow? */}
              <div>
                <label className="block text-xl font-medium text-gray-900 mb-4">
                  How much will you grow?
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="e.g 25"
                    value={formData.totalQuantity}
                    onChange={(e) => handleInputChange("totalQuantity", e.target.value)}
                    className="flex-1 px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-quantity-desktop"
                    required
                  />
                  <div className="flex items-center px-6 py-5 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 text-lg min-w-[100px] justify-center">
                    {cropData.unit}
                  </div>
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
                    step="0.01"
                    placeholder="e.g 2500"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                    className="flex-1 px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                    data-testid="input-price-desktop"
                    required
                  />
                  <div className="flex items-center px-6 py-5 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 text-lg min-w-[120px] justify-center">
                    per {cropData.unit.slice(0, -1)}
                  </div>
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
                    className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg text-gray-500"
                    data-testid="input-harvest-date-desktop"
                    required
                  />
                  <Calendar className="w-6 h-6 text-gray-400 absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
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
                  className="w-full px-6 py-5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg resize-none"
                  data-testid="textarea-description-desktop"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-5 rounded-xl font-semibold text-xl transition-colors"
                  data-testid="button-update-crop-desktop"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin inline mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Crop"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}