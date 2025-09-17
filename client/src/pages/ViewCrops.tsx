import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf, Plus, Loader2, ChevronRight, MapPin, Calendar, Edit, Trash2, X } from "lucide-react";
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
  plant?: Plant;
}

interface CropsResponse {
  crops: Crop[];
  total: number;
  page: number;
  totalPages: number;
}

export function ViewCrops() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showCropDetails, setShowCropDetails] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 0,
    total: 0,
    limit: 20
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // Fetch crops with pagination
  const fetchCrops = useCallback(async (page: number = 1, append: boolean = false) => {
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
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      console.log(`Fetching crops - page: ${page}, limit: ${pagination.limit}`);
      const response = await fetch(
        `https://lucent-ag-api-damidek.replit.app/api/farmer/crops?page=${page}&limit=${pagination.limit}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );

      console.log("Crops API Response Status:", response.status);

      if (response.status === 200) {
        const data: CropsResponse = await response.json();
        console.log("Crops fetched successfully:", data);

        setCrops(prev => append ? [...prev, ...data.crops] : data.crops);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
          limit: pagination.limit
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Crops API Error:", errorData);
        
        toast({
          variant: "destructive",
          title: "Failed to Load Crops",
          description: errorData.message || "Could not fetch your crops.",
        });
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast, setLocation, pagination.limit]);

  // Fetch plants and store in sessionStorage
  const fetchPlants = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

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

      if (response.status === 200) {
        const plants: Plant[] = await response.json();
        console.log("Plants fetched successfully:", plants);

        // Store plant IDs in sessionStorage for AddNewCrop page
        const plantIds = plants.map(plant => ({
          id: plant.id,
          name: plant.name
        }));
        
        sessionStorage.setItem("availablePlants", JSON.stringify(plantIds));
        console.log("Plant IDs stored in sessionStorage:", plantIds);
      }
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  }, []);

  // Load more crops for infinite scroll
  const loadMoreCrops = () => {
    if (pagination.page < pagination.totalPages && !isLoadingMore) {
      fetchCrops(pagination.page + 1, true);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchPlants(); // Fetch plants for sessionStorage
    fetchCrops(1); // Fetch first page of crops
    
    // Clear any edit crop data from sessionStorage on page load
    // This ensures clean state when returning from edit page
    const editCropData = sessionStorage.getItem("editCropData");
    if (editCropData) {
      sessionStorage.removeItem("editCropData");
    }
  }, [fetchPlants, fetchCrops]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && !isLoadingMore && pagination.page < pagination.totalPages) {
          loadMoreCrops();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "20px"
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isLoading, isLoadingMore, pagination.page, pagination.totalPages]);

  const handleGoBack = () => {
    setLocation("/farmer-dashboard");
  };

  const handleAddNewCrop = () => {
    setLocation("/add-new-crop");
  };

  const handleCropClick = (crop: Crop) => {
    setSelectedCrop(crop);
    setShowCropDetails(true);
  };

  const handleCloseCropDetails = () => {
    setShowCropDetails(false);
    setSelectedCrop(null);
  };

  const handleEditCrop = () => {
    if (selectedCrop) {
      // Store crop data in sessionStorage for EditCrop page
      sessionStorage.setItem("editCropData", JSON.stringify(selectedCrop));
      setLocation("/edit-crop");
    }
  };

  const handleRemoveCrop = async () => {
    if (!selectedCrop) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete your ${selectedCrop.plant?.name || 'crop'}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
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

      const response = await fetch(
        `https://lucent-ag-api-damidek.replit.app/api/farmer/crops/${selectedCrop.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        toast({
          title: "✅ Crop Deleted Successfully!",
          description: "Your crop has been removed from your farm.",
        });

        // Close popup
        setShowCropDetails(false);
        setSelectedCrop(null);

        // Refresh the crop list by re-fetching from page 1
        setCrops([]); // Clear existing crops first
        setPagination(prev => ({ ...prev, page: 1, totalPages: 0, total: 0 }));
        fetchCrops(1, false); // Fetch fresh data without appending
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "Failed to Delete Crop",
          description: errorData.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting crop:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
    }
  };

  // Crop list item component matching the design
  const CropListItem = ({ crop }: { crop: Crop }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };

    return (
      <div 
        className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleCropClick(crop)}
        data-testid={`crop-item-${crop.id}`}
      >
        <div className="flex items-center space-x-4">
          {/* Plant icon */}
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          
          {/* Crop info */}
          <div>
            <h3 className="font-semibold text-gray-900 text-base">
              {crop.plant?.name || `Plant ID: ${crop.plantId}`} - {crop.totalQuantity} {crop.unit}
            </h3>
            <p className="text-gray-600 text-sm">
              Ready by {formatDate(crop.harvestDate)}
            </p>
          </div>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    );
  };

  // Crop details popup component
  const CropDetailsPopup = ({ crop }: { crop: Crop }) => {
    if (!crop) return null;

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const formatAddedDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short', 
        year: 'numeric'
      });
    };

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCloseCropDetails}
        />
        
        {/* Mobile Popup - Half screen */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 ease-out h-[50vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">Added: {formatAddedDate(crop.createdAt)}</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {crop.plant?.name || `Plant ID: ${crop.plantId}`} - {crop.totalQuantity} {crop.unit}
              </h2>
              <p className="text-gray-600">
                Ready by {formatDate(crop.harvestDate)} | ₦{crop.pricePerUnit.toLocaleString()} per {crop.unit}
              </p>
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-700">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{crop.lga} LGA, {crop.state} State</span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleEditCrop}
                variant="outline"
                className="flex items-center justify-center py-3 text-green-600 border-green-200 hover:bg-green-50"
                data-testid="button-edit-crop"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Crop
              </Button>
              <Button
                onClick={handleRemoveCrop}
                variant="outline"
                className="flex items-center justify-center py-3 text-red-600 border-red-200 hover:bg-red-50"
                data-testid="button-remove-crop"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Crop
              </Button>
            </div>

            {/* Close button */}
            <Button
              onClick={handleCloseCropDetails}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold transition-colors"
              data-testid="button-close-popup"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Desktop Popup - Modal style */}
        <div className="hidden md:block fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 space-y-6 relative">
            {/* Close button */}
            <button
              onClick={handleCloseCropDetails}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              data-testid="button-close-popup-desktop"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="flex items-start justify-between pr-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">Added: {formatAddedDate(crop.createdAt)}</span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900">
                {crop.plant?.name || `Plant ID: ${crop.plantId}`} - {crop.totalQuantity} {crop.unit}
              </h2>
              <p className="text-gray-600 text-lg">
                Ready by {formatDate(crop.harvestDate)} | ₦{crop.pricePerUnit.toLocaleString()} per {crop.unit}
              </p>
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-700 text-lg">
              <MapPin className="w-6 h-6 mr-3" />
              <span>{crop.lga} LGA, {crop.state} State</span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleEditCrop}
                variant="outline"
                className="flex items-center justify-center py-4 text-green-600 border-green-200 hover:bg-green-50 text-lg"
                data-testid="button-edit-crop-desktop"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit Crop
              </Button>
              <Button
                onClick={handleRemoveCrop}
                variant="outline"
                className="flex items-center justify-center py-4 text-red-600 border-red-200 hover:bg-red-50 text-lg"
                data-testid="button-remove-crop-desktop"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Remove Crop
              </Button>
            </div>

            {/* Close button */}
            <Button
              onClick={handleCloseCropDetails}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors"
              data-testid="button-close-popup-desktop-main"
            >
              Close
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Layout */}
        <div className="block md:hidden px-6 pt-16 pb-8">
          <div className="max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={handleGoBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            {/* Title and subtitle */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your Crops
              </h1>
              <p className="text-gray-600">
                See what you're growing right now
              </p>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading your crops...</span>
              </div>
            ) : crops.length === 0 ? (
              /* Empty state */
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
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Crop
                </Button>
              </div>
            ) : (
              <>
                {/* Summary card */}
                <div className="bg-green-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-green-700" />
                    </div>
                    <span className="text-gray-900 font-semibold">
                      You have {pagination.total || crops.length} crop{(pagination.total || crops.length) !== 1 ? 's' : ''} growing!
                    </span>
                  </div>
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>

                {/* Crops list */}
                <div className="bg-white rounded-2xl overflow-hidden mb-6">
                  {crops.map((crop, index) => (
                    <div key={crop.id}>
                      <CropListItem crop={crop} />
                      {index < crops.length - 1 && <div className="border-b border-gray-100 mx-4" />}
                    </div>
                  ))}
                </div>

                {/* Infinite scroll trigger and loading indicator */}
                {pagination.page < pagination.totalPages && (
                  <>
                    {/* Invisible sentinel div for intersection observer */}
                    <div ref={loadMoreRef} className="h-1" />
                    
                    {/* Loading indicator */}
                    {isLoadingMore && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-green-600 mr-2" />
                        <span className="text-gray-600">Loading more crops...</span>
                      </div>
                    )}
                    
                    {/* Manual load more button as fallback */}
                    {!isLoadingMore && (
                      <div className="text-center mb-6">
                        <Button
                          onClick={loadMoreCrops}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
                          data-testid="button-load-more"
                        >
                          Load More ({Math.max(0, pagination.total - crops.length)} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Add New Crop button */}
                <Button
                  onClick={handleAddNewCrop}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-4 text-lg font-medium rounded-xl transition-colors"
                  data-testid="button-add-new-crop-mobile"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Crop
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex min-h-screen p-8">
          <div className="w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className="p-3 -ml-3 hover:bg-gray-100 rounded-xl transition-colors"
                  data-testid="button-back-desktop"
                >
                  <ArrowLeft className="w-8 h-8 text-gray-900" />
                </button>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Your Crops
                  </h1>
                  <p className="text-gray-600 text-lg">
                    See what you're growing right now
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAddNewCrop}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 text-lg font-medium rounded-xl transition-all hover:scale-105"
                data-testid="button-add-new-crop-desktop-header"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Crop
              </Button>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                <p className="text-gray-600 text-xl">Loading your crops...</p>
              </div>
            ) : crops.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
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
                  <Plus className="w-6 h-6 mr-2" />
                  Add New Crop
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary card */}
                <div className="bg-green-100 rounded-3xl p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                      <Leaf className="w-8 h-8 text-green-700" />
                    </div>
                    <span className="text-gray-900 font-bold text-xl">
                      You have {pagination.total || crops.length} crop{(pagination.total || crops.length) !== 1 ? 's' : ''} growing!
                    </span>
                  </div>
                  <Leaf className="w-12 h-12 text-green-600" />
                </div>

                {/* Crops list */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  {crops.map((crop, index) => (
                    <div key={crop.id}>
                      <div className="p-6">
                        <CropListItem crop={crop} />
                      </div>
                      {index < crops.length - 1 && <div className="border-b border-gray-100" />}
                    </div>
                  ))}
                </div>

                {/* Infinite scroll trigger and loading indicator */}
                {pagination.page < pagination.totalPages && (
                  <>
                    {/* Invisible sentinel div for intersection observer */}
                    <div ref={loadMoreRef} className="h-1" />
                    
                    {/* Loading indicator */}
                    {isLoadingMore && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-3" />
                        <span className="text-gray-600 text-lg">Loading more crops...</span>
                      </div>
                    )}
                    
                    {/* Manual load more button as fallback */}
                    {!isLoadingMore && (
                      <div className="text-center">
                        <Button
                          onClick={loadMoreCrops}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 text-lg rounded-xl transition-all hover:scale-105"
                          data-testid="button-load-more-desktop"
                        >
                          Load More ({Math.max(0, pagination.total - crops.length)} remaining)
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Add New Crop button */}
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <Button
                    onClick={handleAddNewCrop}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
                    data-testid="button-add-new-crop-desktop"
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    Add New Crop
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop Details Popup */}
      {showCropDetails && selectedCrop && (
        <CropDetailsPopup crop={selectedCrop} />
      )}
    </>
  );
}