import { useLocation } from "wouter";
import { Home, ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-20 pb-8">
        <div className="max-w-sm mx-auto text-center">
          {/* Large 404 with decorative elements */}
          <div className="relative mb-8">
            <h1 className="text-8xl font-bold text-green-600 opacity-20 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="w-16 h-16 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoHome}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-xl transition-colors"
              data-testid="button-go-home"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 text-base font-medium rounded-xl transition-colors"
              data-testid="button-go-back"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Decorative leaves */}
        <div className="fixed bottom-0 right-0 w-32 h-32 opacity-5">
          <div className="w-full h-full bg-green-600 rounded-tl-full transform rotate-45"></div>
        </div>
        <div className="fixed top-0 left-0 w-24 h-24 opacity-5">
          <div className="w-full h-full bg-green-600 rounded-br-full transform -rotate-45"></div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-2xl text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-32 h-32 bg-green-600 rounded-full"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-green-600 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-600 rounded-full"></div>
          </div>

          <div className="relative z-10">
            {/* Large 404 with decorative elements */}
            <div className="relative mb-12">
              <h1 className="text-9xl font-bold text-green-600 opacity-20 select-none">404</h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <Leaf className="w-20 h-20 text-green-600" />
              </div>
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Oops! Page Not Found
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-md mx-auto">
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleGoHome}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-medium rounded-xl transition-all hover:scale-105"
                data-testid="button-go-home-desktop"
              >
                <Home className="w-6 h-6 mr-3" />
                Go to Home
              </Button>
              
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-medium rounded-xl transition-all hover:scale-105"
                data-testid="button-go-back-desktop"
              >
                <ArrowLeft className="w-6 h-6 mr-3" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
