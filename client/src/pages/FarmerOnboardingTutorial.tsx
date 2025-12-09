import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Home, 
  Plus, 
  Package, 
  ShoppingCart, 
  Bell, 
  User,
  Settings,
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
    title: "Dashboard",
    description: "Your central hub for managing your farming business on Lucent Ag.",
    icon: <Home className="w-16 h-16 text-green-600" />,
    features: [
      "View a quick overview of your account",
      "Access all main features from one place",
      "See personalized greetings and updates",
      "Quick navigation to add crops or check orders"
    ]
  },
  {
    title: "Add New Crop",
    description: "List your fresh produce for buyers to discover and purchase.",
    icon: <Plus className="w-16 h-16 text-green-600" />,
    features: [
      "Add details about your crops (name, quantity, price)",
      "Upload photos of your produce",
      "Set availability and delivery options",
      "Reach buyers looking for fresh farm products"
    ]
  },
  {
    title: "View Crops",
    description: "Manage all your listed produce in one convenient place.",
    icon: <Package className="w-16 h-16 text-green-600" />,
    features: [
      "See all your active crop listings",
      "Edit crop details and pricing",
      "Remove listings that are sold out",
      "Track which crops are getting attention"
    ]
  },
  {
    title: "Check Orders",
    description: "Stay on top of buyer orders and manage deliveries.",
    icon: <ShoppingCart className="w-16 h-16 text-green-600" />,
    features: [
      "View incoming orders from buyers",
      "Accept or decline order requests",
      "Track order status and delivery",
      "Communicate with buyers about their orders"
    ]
  },
  {
    title: "Notifications",
    description: "Never miss important updates about your farm business.",
    icon: <Bell className="w-16 h-16 text-green-600" />,
    features: [
      "Receive alerts for new orders",
      "Get notified about buyer messages",
      "Stay updated on app announcements",
      "Manage your notification preferences"
    ]
  },
  {
    title: "Profile",
    description: "Manage your personal and farm information.",
    icon: <User className="w-16 h-16 text-green-600" />,
    features: [
      "Update your personal details",
      "Edit your farm information",
      "Change your profile picture",
      "Manage your account settings"
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

export function FarmerOnboardingTutorial() {
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
    setLocation("/farmer-notification-preferences");
  };

  const handleSkip = () => {
    setLocation("/farmer-notification-preferences");
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
