import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf, Plus, Loader2 } from "lucide-react";
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

  // Crop card component
  const CropCard = ({ crop }: { crop: Crop }) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {crop.plant?.name || `Plant ID: ${crop.plantId}`}
            </h3>
            <p className="text-sm text-gray-600">{crop.description}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              ₦{crop.pricePerUnit.toLocaleString()}/{crop.unit}
            </p>
            <p className="text-sm text-gray-500">
              {crop.totalQuantity} {crop.unit}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Location:</span>
            <p className="font-medium">{crop.lga}, {crop.state}</p>
          </div>
          <div>
            <span className="text-gray-500">Harvest Date:</span>
            <p className="font-medium">
              {new Date(crop.harvestDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <span className="text-gray-500 text-sm">Farm Address:</span>
          <p className="text-sm font-medium">{crop.farmAddress}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
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
            <Button
              onClick={handleAddNewCrop}
              size="sm"
              className="bg-green-700 hover:bg-green-800 text-white rounded-lg"
              data-testid="button-add-new-crop-header"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
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
                Add New Crop
              </Button>
            </div>
          ) : (
            /* Crops list */
            <div className="space-y-4">
              {crops.map((crop) => (
                <CropCard key={crop.id} crop={crop} />
              ))}
              
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
                    <div className="text-center pt-4">
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
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center">
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
            <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600 text-xl">Loading your crops...</p>
            </div>
          ) : crops.length === 0 ? (
            /* Empty state */
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
          ) : (
            /* Crops grid */
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {crops.map((crop) => (
                  <CropCard key={crop.id} crop={crop} />
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
              
              {/* Pagination info */}
              {crops.length > 0 && (
                <div className="text-center text-gray-500 text-sm">
                  Showing {crops.length} of {pagination.total} crops
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}