import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { SessionCrypto } from "@/utils/sessionCrypto";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Leaf, 
  Plus, 
  Package, 
  ShoppingCart, 
  Bell, 
  Settings, 
  User, 
  Headphones,
  LogOut,
  Home
} from "lucide-react";
import lucentLogo from "@assets/image 20_1759571692580.png";

export function FarmerDashboard() {
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState("John");
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showSkipConfirmPopup, setShowSkipConfirmPopup] = useState(false);
  const { toast } = useToast();

  // Validate farmer session
  useSessionValidation("farmer");

  // Check if farmer is a new registration (only show onboarding for new registrations, not logins)
  useEffect(() => {
    const isNewRegistration = sessionStorage.getItem("farmerIsNewRegistration");
    if (isNewRegistration === "true") {
      setShowWelcomePopup(true);
    }
  }, []);

  const handleSkipOnboarding = () => {
    sessionStorage.removeItem("farmerIsNewRegistration");
    setShowWelcomePopup(false);
    setShowSkipConfirmPopup(true);
  };

  const handleCloseSkipConfirm = () => {
    setShowSkipConfirmPopup(false);
  };

  const handleProceedToOnboarding = () => {
    sessionStorage.removeItem("farmerIsNewRegistration");
    setShowWelcomePopup(false);
    setLocation("/farmer-onboarding-tutorial");
  };

  const handleAddNewCrop = () => {
    setLocation("/add-new-crop");
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

  const handleLogout = () => {
    // Clear all session and local storage data
    sessionStorage.clear();
    localStorage.clear();
    
    toast({
      title: "✅ Logged Out Successfully",
      description: "You have been securely logged out.",
    });
    
    // Redirect to logged out page
    setLocation("/logged-out");
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
        const encryptedSessionData = JSON.parse(farmerSession);
        const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
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
      {/* Welcome Popup for New Farmers */}
      <AlertDialog open={showWelcomePopup} onOpenChange={setShowWelcomePopup}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center">
              Welcome to Lucent Ag
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 text-base">
              To help you make the most use of this app, please proceed to the recommended onboarding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <AlertDialogCancel 
              onClick={handleSkipOnboarding}
              className="flex-1 border-gray-300"
              data-testid="button-skip-onboarding"
            >
              Skip onboarding
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleProceedToOnboarding}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-proceed-onboarding"
            >
              Proceed to onboarding
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Skip Confirmation Popup */}
      <AlertDialog open={showSkipConfirmPopup} onOpenChange={setShowSkipConfirmPopup}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center">
              Onboarding Skipped
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600 text-base">
              You can access the onboarding at your convenience in the Help Center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center mt-4">
            <AlertDialogAction 
              onClick={handleCloseSkipConfirm}
              className="bg-green-600 hover:bg-green-700 px-8"
              data-testid="button-ok-skip-confirm"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-24">
        <div className="max-w-sm mx-auto">
          {/* Logo and Greeting */}
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => setLocation("/farmer-dashboard")}
              className="flex-shrink-0"
              data-testid="button-logo-mobile"
            >
              <img 
                src={lucentLogo} 
                alt="Lucent Ag Logo" 
                className="h-20 w-auto object-contain"
              />
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {userName}!
            </h1>
          </div>
          
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
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100 hover:shadow-md transition-all text-center"
                  data-testid="button-logout"
                >
                  <LogOut className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <span className="text-red-600 font-medium text-sm">
                    Log Out
                  </span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    You're about to log out of your account. Your session will end and you'll need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-5 h-20">
          <button
            onClick={() => setLocation("/farmer-dashboard")}
            className="flex flex-col items-center justify-center gap-1 text-green-600 font-medium"
            data-testid="nav-home"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={handleViewCrops}
            className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
            data-testid="nav-crops"
          >
            <Package className="w-6 h-6" />
            <span className="text-xs">Crops</span>
          </button>
          
          <button
            onClick={handleAddNewCrop}
            className="flex flex-col items-center justify-center gap-1 -mt-4"
            data-testid="nav-add-crop"
          >
            <div className="bg-green-600 rounded-full p-3 shadow-lg">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-gray-600 mt-1">Add</span>
          </button>
          
          <button
            onClick={handleCheckOrders}
            className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
            data-testid="nav-orders"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">Orders</span>
          </button>
          
          <button
            onClick={handleEditProfile}
            className="flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-green-600 transition-colors"
            data-testid="nav-profile"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header with Logo and Greeting */}
          <div className="mb-12">
            <div className="flex items-center gap-6 mb-4">
              <button
                onClick={() => setLocation("/farmer-dashboard")}
                className="flex-shrink-0"
                data-testid="button-logo-desktop"
              >
                <img 
                  src={lucentLogo} 
                  alt="Lucent Ag Logo" 
                  className="h-24 w-auto object-contain"
                />
              </button>
              
              <h1 className="text-5xl font-bold text-gray-900">
                {getGreeting()}, {userName}!
              </h1>
            </div>
            
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
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100 hover:shadow-lg transition-all text-center hover:scale-105"
                  data-testid="button-logout-desktop"
                >
                  <LogOut className="w-10 h-10 text-red-600 mx-auto mb-4" />
                  <span className="text-red-600 font-medium text-lg block">
                    Log Out
                  </span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    You're about to log out of your account. Your session will end and you'll need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}