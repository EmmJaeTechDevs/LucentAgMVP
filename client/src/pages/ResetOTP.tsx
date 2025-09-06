import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield } from "lucide-react";
import { BaseUrl } from "../../../Baseconfig";
import axios from "axios";

export function ResetOTP() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [hasError, setHasError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  // Helper function to get userId for password change
  const getUserId = () => {
    return sessionStorage.getItem("userIdforPasswordChange");
  };

  // Countdown timer for resend
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check for userId on mount
  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      // If no userId, redirect back to forgot password
      setLocation("/forgot-password");
    }
  }, [setLocation]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    // Clear error state when user starts typing
    if (hasError) {
      setHasError(false);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join("");
    
    if (enteredCode.length !== 6) {
      setHasError(true);
      toast({
        variant: "destructive",
        title: "Invalid Code",
        description: "Please enter the complete 6-digit verification code.",
      });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Session expired. Please start the password reset process again.",
      });
      setLocation("/forgot-password");
      return;
    }

    setIsVerifying(true);

    try {
      console.log("=== VERIFY RESET OTP REQUEST ===");
      console.log("User ID:", userId);
      console.log("Code:", enteredCode);

      const requestData = {
        userId: userId,
        code: enteredCode,
        type: "sms"
      };

      console.log("Request Data:", requestData);

      const response = await axios.post(
        `${BaseUrl}/api/auth/verify-reset-otp`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000
        }
      );

      console.log("=== VERIFY RESET OTP RESPONSE ===");
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success && responseData.token) {
          // Store reset password token
          sessionStorage.setItem("reset password token", responseData.token);
          
          console.log("✅ RESET OTP VERIFICATION SUCCESSFUL");
          console.log("Reset token stored");

          toast({
            title: "✅ Verification Successful",
            description: responseData.message || "Verification successful. You can now reset your password.",
          });

          // Redirect to password reset page
          setLocation("/reset-password");
        } else {
          console.log("❌ RESET OTP VERIFICATION FAILED - Invalid Response");
          setHasError(true);
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Invalid response from server. Please try again.",
          });
        }
      }
    } catch (error: any) {
      console.error("=== VERIFY RESET OTP ERROR ===");
      console.error("Error:", error);

      setHasError(true);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "Verification failed";
        
        console.log("Error Status:", status);
        console.log("Error Message:", errorMessage);

        if (status === 400) {
          toast({
            variant: "destructive",
            title: "Invalid Code",
            description: errorMessage,
          });
        } else if (status === 404) {
          toast({
            variant: "destructive",
            title: "Code Not Found",
            description: "The verification code is invalid or has expired.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Verification Failed",
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
      setIsVerifying(false);
      console.log("=== VERIFY RESET OTP REQUEST COMPLETED ===");
    }
  };

  const handleResendCode = () => {
    // Reset countdown and code
    setCountdown(45);
    setCode(["", "", "", "", "", ""]);
    setHasError(false);
    
    toast({
      title: "✅ Code Resent",
      description: "A new verification code has been sent to your phone.",
    });
    
    // Focus first input
    inputRefs.current[0]?.focus();
  };

  const handleBack = () => {
    setLocation("/forgot-password");
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
            <h1 className="text-xl font-bold text-gray-900">Verify Reset Code</h1>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Enter Verification Code
            </h2>
            <p className="text-gray-600 text-sm">
              Please enter the 6-digit code sent to your phone number.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg transition-colors ${
                    hasError
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  }`}
                  data-testid={`otp-input-${index}`}
                  disabled={isVerifying}
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying || code.join("").length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-verify"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            {countdown > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend code in {countdown} seconds
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                data-testid="button-resend"
              >
                Resend Code
              </button>
            )}
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
            <h1 className="text-2xl font-bold text-gray-900">Verify Reset Code</h1>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Enter Verification Code
            </h2>
            <p className="text-gray-600">
              Please enter the 6-digit code sent to your phone number.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex justify-center gap-4 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-14 text-center text-2xl font-semibold border-2 rounded-xl transition-colors ${
                    hasError
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  }`}
                  data-testid={`otp-input-desktop-${index}`}
                  disabled={isVerifying}
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying || code.join("").length !== 6}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              data-testid="button-verify-desktop"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            {countdown > 0 ? (
              <p className="text-gray-500">
                Resend code in {countdown} seconds
              </p>
            ) : (
              <button
                onClick={handleResendCode}
                className="text-green-600 hover:text-green-700 font-semibold text-lg transition-colors hover:underline"
                data-testid="button-resend-desktop"
              >
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}