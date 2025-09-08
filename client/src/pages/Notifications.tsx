import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";

export function Notifications() {
  const [, setLocation] = useLocation();

  // Validate session (can be used by both farmers and buyers)
  useSessionValidation();

  const handleGoBack = () => {
    setLocation("/farmer-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleGoBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 ml-4">
              Notifications
            </h1>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex flex-col items-center justify-center text-center mt-24">
            {/* Bell icon */}
            <div className="w-16 h-16 mb-8 text-6xl">🔔</div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Notifications Yet
            </h2>
            
            <p className="text-gray-600 text-base leading-relaxed text-center">
              You don't have any messages yet. We'll let you know when something important comes in.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen p-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center mb-12">
            <button
              onClick={handleGoBack}
              className="p-3 -ml-3 hover:bg-gray-100 rounded-xl transition-colors"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-8 h-8 text-gray-900" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 ml-6">
              Notifications
            </h1>
          </div>

          {/* Empty state */}
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            {/* Bell icon */}
            <div className="w-20 h-20 mx-auto mb-10 text-8xl">🔔</div>

            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              No Notifications Yet
            </h2>
            
            <p className="text-gray-600 text-xl leading-relaxed max-w-md mx-auto">
              You don't have any messages yet. We'll let you know when something important comes in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}