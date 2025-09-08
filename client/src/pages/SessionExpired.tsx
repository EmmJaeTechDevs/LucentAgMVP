import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";

export function SessionExpired() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear any remaining session data
    sessionStorage.clear();
    localStorage.clear();
    
    // Auto redirect to login after 10 seconds
    const timer = setTimeout(() => {
      setLocation("/login");
    }, 10000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  const handleLoginRedirect = () => {
    setLocation("/login");
  };

  const handleHomeRedirect = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Clock className="w-16 h-16 text-orange-500" />
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Session Expired
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your session has expired for security reasons. 
          Please log in again to continue using the app.
        </p>

        {/* Auto redirect notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-700">
            <Clock className="w-4 h-4 inline mr-2" />
            You will be automatically redirected to login in 10 seconds
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleLoginRedirect}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base"
            data-testid="button-login-now"
          >
            Log In Now
          </Button>
          
          <Button
            onClick={handleHomeRedirect}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 text-base"
            data-testid="button-go-home"
          >
            Go to Home Page
          </Button>
        </div>

        {/* Security notice */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Sessions expire after 8 hours of inactivity for your security
          </p>
        </div>
      </div>
    </div>
  );
}