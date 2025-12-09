import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Search, 
  ShoppingCart, 
  Bell, 
  Heart, 
  Calendar,
  MapPin,
  X
} from "lucide-react";

export function BuyerExplanation() {
  const [, setLocation] = useLocation();
  const [showPopup, setShowPopup] = useState(false);

  const handleContinue = () => {
    setShowPopup(true);
  };

  const handleGoToPreferences = () => {
    setShowPopup(false);
    setLocation("/buyer-home");
  };

  const features = [
    {
      icon: <Search className="w-6 h-6 text-green-600" />,
      title: "Find Fresh Products",
      description: "Browse and search for fresh farm produce in your area"
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-green-600" />,
      title: "Easy Ordering",
      description: "Add items to cart and place orders directly with farmers"
    },
    {
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      title: "Track Harvests",
      description: "See when crops will be ready and pre-order for future harvests"
    },
    {
      icon: <MapPin className="w-6 h-6 text-green-600" />,
      title: "Local Farms",
      description: "Connect with farms and farmers in your local area"
    },
    {
      icon: <Bell className="w-6 h-6 text-green-600" />,
      title: "Stay Updated",
      description: "Get notifications about new products, harvest times, and special offers"
    },
    {
      icon: <Heart className="w-6 h-6 text-green-600" />,
      title: "Save Favorites",
      description: "Keep track of your favorite farms and products for easy reordering"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-12 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Welcome header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-6xl">🌱</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Lucent Ag!
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              Your gateway to fresh, local farm produce
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm"
                data-testid={`feature-${index}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Continue button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors"
            data-testid="button-continue"
          >
            Let's Get Started!
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-2xl">
          {/* Welcome header */}
          <div className="mb-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 text-8xl">🌱</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Lucent Ag!
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your gateway to fresh, local farm produce
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl"
                data-testid={`feature-${index}-desktop`}
              >
                <div className="flex-shrink-0 mt-1">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Continue button */}
          <Button
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
            data-testid="button-continue-desktop"
          >
            Let's Get Started!
          </Button>
        </div>
      </div>

      {/* Settings popup dialog */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Quick Setup
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              Before we begin, let's set up your notification preferences so you never miss important updates about fresh produce and harvest times.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Bell className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can always change these settings later in your account settings.
            </p>
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              onClick={handleGoToPreferences}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-go-to-preferences"
            >
              Set Up Notifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}