import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { BaseUrl } from "../../../Baseconfig";

export function FarmerVerification() {
  const [location, setLocation] = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [hasError, setHasError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile device detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(userAgent.substr(0,4));
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Clipboard detection for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        // User returned to the app, check if they have a verification code in clipboard
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            // Check if clipboard contains a 6-digit number
            const sixDigitMatch = clipboardText.match(/^(\d{6})$/);
            if (sixDigitMatch) {
              const digits = sixDigitMatch[1].split('');
              setCode(digits);
              // Focus on the last input
              setTimeout(() => {
                inputRefs.current[5]?.focus();
              }, 100);
              toast({
                title: "Code Auto-filled",
                description: "Verification code detected and filled from clipboard!",
              });
            }
          }
        } catch (error) {
          // Clipboard access failed, ignore silently
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMobile, toast]);

  // Countdown timer for resend
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Handle paste operations (for SMS auto-fill)
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      const newCode = [...code];
      
      // Fill all inputs with pasted digits
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || '';
      }
      setCode(newCode);
      
      // Focus on the last filled input or next empty one
      const lastFilledIndex = Math.min(digits.length - 1, 5);
      setTimeout(() => {
        inputRefs.current[lastFilledIndex]?.focus();
      }, 50);
      return;
    }

    // Clear error state when user starts typing
    if (hasError) {
      setHasError(false);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Enhanced auto-focus for mobile
    if (value && index < 5) {
      // Use timeout for better mobile experience
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        // For mobile, also trigger the keyboard
        if (isMobile) {
          inputRefs.current[index + 1]?.click();
        }
      }, isMobile ? 100 : 50);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Helper function to get farmer ID from sessionStorage or localStorage
  const getFarmerId = () => {
    // First try sessionStorage with expiry check
    const sessionData = sessionStorage.getItem("farmerSession");
    if (sessionData) {
      try {
        const encryptedData = JSON.parse(sessionData);
        const parsed = SessionCrypto.decryptSessionData(encryptedData);
        const now = new Date().getTime();
        if (now < parsed.expiry) {
          return parsed.userId;
        } else {
          // Session expired, remove it
          sessionStorage.removeItem("farmerSession");
        }
      } catch (error) {
        console.error("Error decrypting farmer session:", error);
      }
    }
    // Fallback to localStorage
    const encryptedUserId = localStorage.getItem("farmerUserId");
    if (encryptedUserId) {
      try {
        return SessionCrypto.decrypt(encryptedUserId);
      } catch (error) {
        console.error("Error decrypting farmer userId:", error);
      }
    }
    return null;
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) return;

    setIsVerifying(true);
    setHasError(false);

    try {
      // Get farmer ID from sessionStorage or localStorage
      const farmerId = getFarmerId();

      // Prepare request data
      const requestData = {
        userId: farmerId,
        code: verificationCode,
        type: "sms",
      };

      console.log("=== VERIFY OTP REQUEST ===");
      console.log("URL:", `${BaseUrl}/api/auth/verify-otp`);
      console.log("Method:", "POST");
      console.log("Headers:", {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      });
      console.log("Request Body:", JSON.stringify(requestData, null, 2));
      console.log("Farmer ID:", farmerId);
      console.log("OTP Code:", verificationCode);

      // Send POST request to verify OTP using CORS proxy
      const response = await fetch(`${BaseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(requestData),
      });

      console.log("=== VERIFY OTP RESPONSE ===");
      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);
      console.log(
        "Response Headers:",
        Object.fromEntries(response.headers.entries()),
      );

      // Parse response data
      let responseData;
      try {
        responseData = await response.json();
        console.log("Response Body:", responseData);
      } catch (parseError) {
        console.log("Failed to parse JSON response:", parseError);
        console.log("Raw response text:", await response.text());
      }

      if (response.status === 200) {
        console.log("✅ VERIFICATION SUCCESSFUL - Status 200");
        toast({
          title: "✅ Verification Successful!",
          description: "Your account has been verified successfully.",
        });
        setShowSuccess(true);
      } else if (response.status === 400) {
        console.log("❌ VERIFICATION FAILED - Status 400 (Invalid OTP)");
        toast({
          variant: "destructive",
          title: "Invalid OTP",
          description:
            "Invalid or wrong OTP. Please check your code and try again.",
        });
        setHasError(true);
      } else {
        console.log(`❌ VERIFICATION FAILED - Status ${response.status}`);
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: `Verification failed with status: ${response.status}`,
        });
        setHasError(true);
      }
    } catch (error: any) {
      console.error("=== VERIFY OTP ERROR ===");
      console.error("Error verifying OTP:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
      setHasError(true);
    } finally {
      setIsVerifying(false);
      console.log("=== VERIFY OTP REQUEST COMPLETED ===");
    }
  };

  const handleShowMeHow = () => {
    // Navigate to onboarding/tutorial
    setLocation("/dashboard");
  };

  const handleSkip = () => {
    // Navigate to notification preferences
    setLocation("/notification-preferences");
  };

  const handleResend = async () => {
    try {
      // Get farmer ID from sessionStorage or localStorage
      const farmerId = getFarmerId();

      if (!farmerId) {
        console.log("❌ RESEND OTP FAILED - No farmer ID found");
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "User session expired. Please register again.",
        });
        return;
      }

      // Prepare request data
      const requestData = {
        userId: farmerId,
        type: "sms",
        purpose: "verification",
      };

      console.log("=== RESEND OTP REQUEST ===");
      console.log("URL:", `${BaseUrl}/api/auth/request-otp`);
      console.log("Method:", "POST");
      console.log("Headers:", {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      });
      console.log("Request Body:", JSON.stringify(requestData, null, 2));
      console.log("Farmer ID:", farmerId);

      // Send POST request to resend OTP
      const response = await fetch(`${BaseUrl}/api/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(requestData),
      });

      console.log("=== RESEND OTP RESPONSE ===");
      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);
      console.log(
        "Response Headers:",
        Object.fromEntries(response.headers.entries()),
      );

      // Parse response data
      let responseData;
      try {
        responseData = await response.json();
        console.log("Response Body:", responseData);
      } catch (parseError) {
        console.log("Failed to parse JSON response:", parseError);
        const textResponse = await response.text();
        console.log("Raw response text:", textResponse);
      }

      if (response.ok) {
        console.log("✅ RESEND OTP SUCCESSFUL");
        // Reset countdown and clear inputs on successful resend
        setCountdown(45);
        setHasError(false);
        setCode(["", "", "", "", "", ""]);
        toast({
          title: "✅ Code Resent",
          description: "Verification code resent successfully!",
        });
      } else {
        console.log(`❌ RESEND OTP FAILED - Status ${response.status}`);
        toast({
          variant: "destructive",
          title: "Resend Failed",
          description: "Failed to resend verification code. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("=== RESEND OTP ERROR ===");
      console.error("Error resending OTP:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
    } finally {
      console.log("=== RESEND OTP REQUEST COMPLETED ===");
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  // Show success message if verification successful
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Mobile Success Layout */}
        <div className="block md:hidden flex-1 px-6 pt-20 pb-8">
          <div className="max-w-sm mx-auto text-center">
            {/* Celebration icon */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto relative">
                {/* Party/celebration emoji style icon */}
                <div className="text-6xl">🎉</div>
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                  ✨
                </div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-300">
                  🎊
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Lucent Ag
            </h1>

            <p className="text-gray-600 text-base leading-relaxed mb-12">
              We're glad to have you here. We'll show you how to use the app,
              step by step. It's quick and easy.
            </p>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleShowMeHow}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl transition-colors"
                data-testid="button-show-me-how"
              >
                Show Me How
              </Button>

              <div className="relative group">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-4 text-lg font-medium rounded-xl transition-colors"
                  data-testid="button-skip"
                >
                  Skip
                </Button>
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  You can access this later in the help section
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Success Layout */}
        <div className="hidden md:flex min-h-screen items-center justify-center p-8">
          <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-md text-center">
            {/* Celebration icon */}
            <div className="mb-8">
              <div className="w-40 h-40 mx-auto relative">
                {/* Party/celebration emoji style icon */}
                <div className="text-8xl">🎉</div>
                <div className="absolute -top-4 -right-4 text-3xl animate-bounce">
                  ✨
                </div>
                <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce delay-300">
                  🎊
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to Lucent Ag
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-12">
              We're glad to have you here. We'll show you how to use the app,
              step by step. It's quick and easy.
            </p>

            {/* Action buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleShowMeHow}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
                data-testid="button-show-me-how-desktop"
              >
                Show Me How
              </Button>

              <div className="relative group">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
                  data-testid="button-skip-desktop"
                >
                  Skip
                </Button>
                {/* Tooltip */}
                <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  You can access this later in the help section
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify your account
          </h1>

          <p className="text-base font-medium text-gray-900 mb-6">
            Almost There!
          </p>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            We've sent a 6-digit code to your email or phone number. Enter the
            code below to verify your account and continue.
          </p>

          {/* 6-digit code input */}
          <div className="flex gap-3 mb-4 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none transition-colors ${
                  hasError
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-200 focus:border-green-600"
                }`}
                maxLength={index === 0 ? 6 : 1}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                data-testid={`input-code-${index}`}
              />
            ))}
          </div>

          {/* Error message */}
          {hasError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium">
                Invalid code. Please check and try again.
              </p>
            </div>
          )}

          {/* Resend code */}
          <div className="text-center mb-8">
            {countdown > 0 ? (
              <p className="text-gray-600 text-sm">
                Didn't receive the code? (Resend in {countdown}s)
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
                data-testid="button-resend"
              >
                Didn't receive the code? Resend
              </button>
            )}
          </div>

          {/* Verify button */}
          <Button
            onClick={handleVerify}
            disabled={!isCodeComplete || isVerifying}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="button-verify"
          >
            {isVerifying ? "Verifying..." : "Verify and Continue"}
          </Button>
        </div>

        {/* Decorative leaf */}
        <div className="fixed bottom-0 right-0 w-32 h-32 opacity-10">
          <div className="w-full h-full bg-green-600 rounded-tl-full transform rotate-45"></div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Verify your account
          </h1>

          <p className="text-lg font-medium text-gray-900 mb-6">
            Almost There!
          </p>

          <p className="text-gray-600 leading-relaxed mb-8">
            We've sent a 6-digit code to your email or phone number. Enter the
            code below to verify your account and continue.
          </p>

          {/* 6-digit code input */}
          <div className="flex gap-4 mb-4 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-14 h-14 text-center text-xl font-semibold border-2 rounded-xl focus:outline-none transition-colors ${
                  hasError
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-200 focus:border-green-600"
                }`}
                maxLength={index === 0 ? 6 : 1}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                data-testid={`input-code-${index}`}
              />
            ))}
          </div>

          {/* Error message */}
          {hasError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <p className="text-red-700 font-medium">
                Invalid code. Please check and try again.
              </p>
            </div>
          )}

          {/* Resend code */}
          <div className="text-center mb-8">
            {countdown > 0 ? (
              <p className="text-gray-600">
                Didn't receive the code? (Resend in {countdown}s)
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-green-600 font-medium hover:text-green-700 transition-colors"
                data-testid="button-resend"
              >
                Didn't receive the code? Resend
              </button>
            )}
          </div>

          {/* Verify button */}
          <Button
            onClick={handleVerify}
            disabled={!isCodeComplete || isVerifying}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="button-verify"
          >
            {isVerifying ? "Verifying..." : "Verify and Continue"}
          </Button>

          {/* Decorative leaf */}
          <div className="absolute bottom-8 right-8 w-24 h-24 opacity-10">
            <div className="w-full h-full bg-green-600 rounded-tl-full transform rotate-45"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
