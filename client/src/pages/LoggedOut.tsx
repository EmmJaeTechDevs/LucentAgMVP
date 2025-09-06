import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

export function LoggedOut() {
  const [, setLocation] = useLocation();

  const handleBackToApp = () => {
    setLocation("/language-selector");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-20 pb-8">
        <div className="max-w-sm mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            You've Been Logged Out
          </h1>
          
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            Thanks for using our platform! Your session has ended securely. 
            See you again soon! 🌱
          </p>

          {/* Action Button */}
          <Button
            onClick={handleBackToApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-lg transition-all hover:scale-105"
            data-testid="button-back-to-start"
          >
            <span>Start Fresh</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Additional Message */}
          <p className="text-gray-500 text-sm mt-6">
            Ready to continue? You can sign in anytime to access your account.
          </p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            You've Been Logged Out
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Thanks for using our platform! Your session has ended securely. 
            See you again soon! 🌱
          </p>

          {/* Action Button */}
          <Button
            onClick={handleBackToApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            data-testid="button-back-to-start-desktop"
          >
            <span>Start Fresh</span>
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>

          {/* Additional Message */}
          <p className="text-gray-500 mt-8">
            Ready to continue? You can sign in anytime to access your account.
          </p>
        </div>
      </div>
    </div>
  );
}