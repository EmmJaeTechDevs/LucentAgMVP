import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  Plus, 
  Package, 
  ShoppingCart, 
  Bell, 
  Settings, 
  User, 
  Headphones 
} from "lucide-react";

export function FarmerDashboard() {
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState("John");

  const handleAddNewCrop = () => {
    // Navigate to add crop page or open modal
    console.log("Add new crop clicked");
  };

  const handleViewCrops = () => {
    setLocation("/view-crops");
  };

  const handleCheckOrders = () => {
    setLocation("/check-orders");
  };

  const handleNotifications = () => {
    setLocation("/notifications");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleEditProfile = () => {
    setLocation("/farmer-profile");
  };

  const handleContactSupport = () => {
    console.log("Contact support clicked");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Load user data from session storage
  useEffect(() => {
    const farmerSession = sessionStorage.getItem("farmerSession");
    if (farmerSession) {
      try {
        const sessionData = JSON.parse(farmerSession);
        const now = new Date().getTime();
        if (now < sessionData.expiry && sessionData.lastName) {
          setUserName(sessionData.lastName);
        }
      } catch (error) {
        console.error("Error parsing farmer session:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Greeting */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {userName}!
          </h1>
          
          <p className="text-gray-600 text-base mb-8">
            Start your day by adding your produce!
          </p>

          {/* Main action card */}
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl p-6 mb-8 relative overflow-hidden">
            {/* Decorative leaf background */}
            <div className="absolute top-4 right-4 opacity-20">
              <Leaf className="w-24 h-24 text-green-600" />
            </div>
            
            <div className="relative z-10">
              <div className="mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Tell us what you're planting
              </h2>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                Add a new crop, how much you expect to grow, and when it will be ready.
              </p>
              
              <Button
                onClick={handleAddNewCrop}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3 text-base font-medium rounded-xl transition-colors"
                data-testid="button-add-new-crop"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Crop
              </Button>
            </div>
          </div>

          {/* Quick actions grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleViewCrops}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
              data-testid="button-view-crops"
            >
              <Package className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <span className="text-gray-900 font-medium text-sm">
                View Your Crops
              </span>
            </button>
            
            <button
              onClick={handleCheckOrders}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
              data-testid="button-check-orders"
            >
              <ShoppingCart className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <span className="text-gray-900 font-medium text-sm">
                Check Orders
              </span>
            </button>
          </div>

          {/* Secondary actions grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleNotifications}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
              data-testid="button-notifications"
            >
              <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <span className="text-gray-900 font-medium text-sm">
                Notifications
              </span>
            </button>
            
            <button
              onClick={handleSettings}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
              data-testid="button-settings"
            >
              <Settings className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <span className="text-gray-900 font-medium text-sm">
                Settings
              </span>
            </button>
          </div>

          {/* Profile and support actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleEditProfile}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
              data-testid="button-edit-profile"
            >
              <User className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <span className="text-gray-900 font-medium text-sm">
                Edit Your Profile
              </span>
            </button>
            
            <button
              onClick={handleContactSupport}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
              data-testid="button-contact-support"
            >
              <Headphones className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <span className="text-gray-900 font-medium text-sm">
                Contact Support
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {getGreeting()}, {userName}!
            </h1>
            
            <p className="text-gray-600 text-xl">
              Start your day by adding your produce!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Main action card - spans 2 columns */}
            <div className="col-span-2 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl p-8 relative overflow-hidden">
              {/* Decorative leaf background */}
              <div className="absolute top-6 right-6 opacity-20">
                <Leaf className="w-32 h-32 text-green-600" />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6">
                  <Leaf className="w-12 h-12 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Tell us what you're planting
                </h2>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-md">
                  Add a new crop, how much you expect to grow, and when it will be ready.
                </p>
                
                <Button
                  onClick={handleAddNewCrop}
                  className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all hover:scale-105"
                  data-testid="button-add-new-crop-desktop"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Add New Crop
                </Button>
              </div>
            </div>

            {/* Side actions column */}
            <div className="space-y-6">
              <button
                onClick={handleViewCrops}
                className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-center hover:scale-105"
                data-testid="button-view-crops-desktop"
              >
                <Package className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <span className="text-gray-900 font-semibold text-lg block">
                  View Your Crops
                </span>
              </button>
              
              <button
                onClick={handleCheckOrders}
                className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-center hover:scale-105"
                data-testid="button-check-orders-desktop"
              >
                <ShoppingCart className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <span className="text-gray-900 font-semibold text-lg block">
                  Check Orders
                </span>
              </button>
            </div>
          </div>

          {/* Secondary actions grid */}
          <div className="grid grid-cols-4 gap-6 mt-12">
            <button
              onClick={handleNotifications}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-center hover:scale-105"
              data-testid="button-notifications-desktop"
            >
              <Bell className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <span className="text-gray-900 font-medium text-lg block">
                Notifications
              </span>
            </button>
            
            <button
              onClick={handleSettings}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-center hover:scale-105"
              data-testid="button-settings-desktop"
            >
              <Settings className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <span className="text-gray-900 font-medium text-lg block">
                Settings
              </span>
            </button>
            
            <button
              onClick={handleEditProfile}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-center hover:scale-105"
              data-testid="button-edit-profile-desktop"
            >
              <User className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <span className="text-gray-900 font-medium text-lg block">
                Edit Your Profile
              </span>
            </button>
            
            <button
              onClick={handleContactSupport}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all text-center hover:scale-105"
              data-testid="button-contact-support-desktop"
            >
              <Headphones className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <span className="text-gray-900 font-medium text-lg block">
                Contact Support
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}