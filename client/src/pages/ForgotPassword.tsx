import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { BaseUrl } from "../../../Baseconfig";
import axios from "axios";

export function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateInput = (value: string, type: "email" | "phone"): boolean => {
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    } else {
      const phoneRegex = /^(\+234|234|0)?(70|80|81|90|91)\d{8}$/;
      return phoneRegex.test(value);
    }
  };

  const detectInputType = (value: string): "email" | "phone" => {
    return value.includes("@") ? "email" : "phone";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter your phone number or email address.",
      });
      return;
    }

    const inputType = detectInputType(identifier);
    
    if (!validateInput(identifier, inputType)) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: inputType === "email" 
          ? "Please enter a valid email address" 
          : "Please enter a valid phone number",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("=== FORGOT PASSWORD REQUEST ===");
      console.log("Identifier:", identifier);
      console.log("Input Type:", inputType);

      const requestData = {
        identifier: identifier.trim()
      };

      console.log("Request Data:", requestData);

      const response = await axios.post(
        `${BaseUrl}/api/auth/forgot-password`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000
        }
      );

      console.log("=== FORGOT PASSWORD RESPONSE ===");
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success && responseData.userId) {
          // Store userId for password reset
          sessionStorage.setItem("userIdforPasswordChange", responseData.userId);
          
          console.log("✅ FORGOT PASSWORD REQUEST SUCCESSFUL");
          console.log("User ID stored:", responseData.userId);

          toast({
            title: "✅ Reset Instructions Sent",
            description: responseData.message || "If an account exists, verification instructions have been sent.",
          });

          // Redirect to reset OTP page
          setLocation("/reset-otp");
        } else {
          console.log("❌ FORGOT PASSWORD REQUEST FAILED - Invalid Response");
          toast({
            variant: "destructive",
            title: "Request Failed",
            description: "Invalid response from server. Please try again.",
          });
        }
      }
    } catch (error: any) {
      console.error("=== FORGOT PASSWORD ERROR ===");
      console.error("Error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "Request failed";
        
        console.log("Error Status:", status);
        console.log("Error Message:", errorMessage);

        if (status === 400) {
          toast({
            variant: "destructive",
            title: "Invalid Request",
            description: errorMessage,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Request Failed",
            description: errorMessage,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your connection and try again.",
        });
      }
    } finally {
      setIsLoading(false);
      console.log("=== FORGOT PASSWORD REQUEST COMPLETED ===");
    }
  };

  const handleBack = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Forgot Password</h1>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enter your phone number or email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {detectInputType(identifier) === "email" ? (
                    <Mail className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Phone className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone number or email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  data-testid="input-identifier"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-send-instructions"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending Instructions...
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <button
              onClick={handleBack}
              className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
              data-testid="link-back-to-login"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleBack}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors mr-4"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-gray-600 leading-relaxed">
              Enter your phone number or email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium text-gray-700 mb-3">
                Phone Number or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {detectInputType(identifier) === "email" ? (
                    <Mail className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Phone className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone number or email"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                  data-testid="input-identifier-desktop"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              data-testid="button-send-instructions-desktop"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Sending Instructions...
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-8">
            <button
              onClick={handleBack}
              className="text-green-600 hover:text-green-700 font-semibold text-lg transition-colors hover:underline"
              data-testid="link-back-to-login-desktop"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}