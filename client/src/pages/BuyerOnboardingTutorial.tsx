import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Home, 
  Search, 
  ShoppingCart, 
  Package, 
  Bell, 
  User,
  Users,
  Headphones,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Home",
    description: "Your central marketplace for discovering fresh farm produce.",
    icon: <Home className="w-16 h-16 text-green-600" />,
    features: [
      "Browse fresh produce from local farmers",
      "See featured and recommended crops",
      "Quick access to all main features",
      "Personalized suggestions based on your preferences"
    ]
  },
  {
    title: "Search & Browse",
    description: "Find exactly what you're looking for with powerful search.",
    icon: <Search className="w-16 h-16 text-green-600" />,
    features: [
      "Search for specific crops or products",
      "Filter by category, price, or location",
      "Sort results by relevance or price",
      "Discover new farmers and produce"
    ]
  },
  {
    title: "Cart",
    description: "Manage your selected items before checkout.",
    icon: <ShoppingCart className="w-16 h-16 text-green-600" />,
    features: [
      "View all items you've added",
      "Adjust quantities as needed",
      "See total price before checkout",
      "Save items for later purchase"
    ]
  },
  {
    title: "Orders",
    description: "Track all your purchases and their delivery status.",
    icon: <Package className="w-16 h-16 text-green-600" />,
    features: [
      "View your order history",
      "Track current order status",
      "See estimated delivery times",
      "Contact sellers about your orders"
    ]
  },
  {
    title: "Communities",
    description: "Connect with other buyers and farmers in your area.",
    icon: <Users className="w-16 h-16 text-green-600" />,
    features: [
      "Join local farming communities",
      "Share tips and recommendations",
      "Participate in group purchases",
      "Stay updated on local produce availability"
    ]
  },
  {
    title: "Notifications",
    description: "Stay informed about your orders and new offerings.",
    icon: <Bell className="w-16 h-16 text-green-600" />,
    features: [
      "Receive alerts for order updates",
      "Get notified about new produce",
      "Stay updated on promotions",
      "Manage your notification preferences"
    ]
  },
  {
    title: "Profile",
    description: "Manage your personal information and preferences.",
    icon: <User className="w-16 h-16 text-green-600" />,
    features: [
      "Update your personal details",
      "Manage delivery addresses",
      "Set your dietary preferences",
      "View your account settings"
    ]
  },
  {
    title: "Help Center",
    description: "Get support and find answers to your questions.",
    icon: <Headphones className="w-16 h-16 text-green-600" />,
    features: [
      "Access frequently asked questions",
      "Contact customer support",
      "View tutorials and guides",
      "Report issues or give feedback"
    ]
  }
];

export function BuyerOnboardingTutorial() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  
  const totalSteps = onboardingSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    setLocation("/buyer-notification-preferences");
  };

  const handleSkip = () => {
    setLocation("/buyer-notification-preferences");
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">App Tour</h2>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700"
              data-testid="button-skip-tutorial"
            >
              Skip Tour
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-white border-b px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-2">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index === currentStep
                    ? "bg-green-600 text-white"
                    : index < currentStep
                    ? "bg-green-200 text-green-700"
                    : "bg-gray-200 text-gray-500"
                }`}
                data-testid={`step-indicator-${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
              {currentStepData.icon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {currentStepData.description}
            </p>
          </div>

          {/* Features List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What you can do here:
            </h3>
            <ul className="space-y-3">
              {currentStepData.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-medium">{index + 1}</span>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white border-t px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex-1 py-6"
            data-testid="button-previous"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>
          
          {isLastStep ? (
            <Button
              onClick={handleFinish}
              className="flex-1 py-6 bg-green-600 hover:bg-green-700"
              data-testid="button-finish"
            >
              Finish
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex-1 py-6 bg-green-600 hover:bg-green-700"
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
