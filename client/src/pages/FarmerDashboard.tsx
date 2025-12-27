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
  Home,
  Users,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

      {/* Desktop/Tablet Layout */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        {/* Desktop Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <button
                onClick={() => setLocation("/farmer-dashboard")}
                className="flex-shrink-0"
                data-testid="button-logo-desktop"
              >
                <img 
                  src={lucentLogo} 
                  alt="Lucent Ag Logo" 
                  className="h-10 w-auto object-contain"
                />
              </button>
              
              {/* Navigation Links */}
              <nav className="flex items-center gap-8">
                <button
                  onClick={() => setLocation("/farmer-dashboard")}
                  className="text-gray-900 font-medium hover:text-green-600 transition-colors"
                  data-testid="nav-dashboard"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleViewCrops}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                  data-testid="nav-my-produce"
                >
                  My Produce
                </button>
                <button
                  onClick={handleCheckOrders}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                  data-testid="nav-my-orders"
                >
                  My Orders
                </button>
                <button
                  onClick={() => setLocation("/communities")}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                  data-testid="nav-community"
                >
                  Community
                </button>
                <button
                  onClick={handleContactSupport}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                  data-testid="nav-help"
                >
                  Help
                </button>
              </nav>
              
              {/* Right Icons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleNotifications}
                  className="text-gray-600 hover:text-green-600 transition-colors relative"
                  data-testid="button-notifications-desktop"
                >
                  <Bell className="w-5 h-5" />
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors" data-testid="button-user-menu">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleEditProfile}>
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettings}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleContactSupport}>
                      <Headphones className="w-4 h-4 mr-2" />
                      Contact Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-gray-500">
              Start your day by adding your produce!
            </p>
          </div>

          {/* Three Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Tell us what you're planting */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-t-green-100 border-l-[64px] border-l-transparent" />
              </div>
              <div className="relative z-10">
                <div className="mb-4">
                  <Leaf className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Tell us what you're planting
                </h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Add a new crop, how much you expect to grow, and when it will be ready.
                </p>
                <Button
                  onClick={handleAddNewCrop}
                  className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 text-sm font-medium rounded-lg"
                  data-testid="button-add-new-crop-desktop"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Crop
                </Button>
              </div>
            </div>

            {/* My Orders */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-t-green-100 border-l-[64px] border-l-transparent" />
              </div>
              <div className="relative z-10">
                <div className="mb-4">
                  <ShoppingCart className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  My Orders
                </h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  See who has placed orders for your produce and process them
                </p>
                <Button
                  onClick={handleCheckOrders}
                  className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 text-sm font-medium rounded-lg"
                  data-testid="button-check-orders-desktop"
                >
                  Check Orders
                </Button>
              </div>
            </div>

            {/* My Community */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[64px] border-t-green-100 border-l-[64px] border-l-transparent" />
              </div>
              <div className="relative z-10">
                <div className="mb-4">
                  <Users className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  My Community
                </h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Connect with other farmers, access resources and partake in joint deliveries
                </p>
                <Button
                  onClick={() => setLocation("/communities")}
                  className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 text-sm font-medium rounded-lg"
                  data-testid="button-open-community-desktop"
                >
                  Open Community
                </Button>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Today's Summary
            </h2>
            <p className="text-gray-500 text-sm">
              A quick look at what's happening on your farm
            </p>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Crops on your farm */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-4xl font-bold text-gray-900 mb-1">4</div>
              <div className="text-gray-500 text-sm mb-4">Crops on your farm</div>
              <button
                onClick={handleViewCrops}
                className="text-green-700 text-sm font-medium flex items-center gap-1 hover:text-green-800 transition-colors"
                data-testid="link-view-crops"
              >
                View Crops
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-4xl font-bold text-gray-900 mb-1">48</div>
              <div className="text-gray-500 text-sm mb-4">Total Orders</div>
              <button
                onClick={handleCheckOrders}
                className="text-green-700 text-sm font-medium flex items-center gap-1 hover:text-green-800 transition-colors"
                data-testid="link-view-all-orders"
              >
                View All Orders
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* New Orders */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-4xl font-bold text-gray-900 mb-1">2</div>
              <div className="text-gray-500 text-sm mb-4">New Orders</div>
              <button
                onClick={handleCheckOrders}
                className="text-green-700 text-sm font-medium flex items-center gap-1 hover:text-green-800 transition-colors"
                data-testid="link-view-new-orders"
              >
                View New Orders
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pending Deliveries */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-4xl font-bold text-gray-900 mb-1">4</div>
              <div className="text-gray-500 text-sm mb-4">Pending Deliveries</div>
              <button
                onClick={handleCheckOrders}
                className="text-green-700 text-sm font-medium flex items-center gap-1 hover:text-green-800 transition-colors"
                data-testid="link-view-pending-deliveries"
              >
                View Pending Deliveries
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}