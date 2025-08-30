import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function FarmerVerification() {
  const [location, setLocation] = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [hasError, setHasError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) return;

    setIsVerifying(true);
    setHasError(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate validation - for demo, reject code "123456"
      if (verificationCode === "123456") {
        setHasError(true);
        return;
      }
      
      // Show success message on successful verification
      setShowSuccess(true);
    } catch (error) {
      setHasError(true);
    } finally {
      setIsVerifying(false);
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

  const handleResend = () => {
    setCountdown(45);
    setHasError(false); // Clear error on resend
    setCode(["", "", "", "", "", ""]); // Clear code inputs
    // Simulate resend API call
    console.log("Resending verification code...");
  };

  const isCodeComplete = code.every(digit => digit !== "");

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
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">✨</div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-300">🎊</div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Lucent Ag
            </h1>
            
            <p className="text-gray-600 text-base leading-relaxed mb-12">
              We're glad to have you here. We'll show you how to use the app, step by step. It's quick and easy.
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
                <div className="absolute -top-4 -right-4 text-3xl animate-bounce">✨</div>
                <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce delay-300">🎊</div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to Lucent Ag
            </h1>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-12">
              We're glad to have you here. We'll show you how to use the app, step by step. It's quick and easy.
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
            We've sent a 6-digit code to your email or phone number. Enter the code below to verify your account and continue.
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
                maxLength={1}
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
            We've sent a 6-digit code to your email or phone number. Enter the code below to verify your account and continue.
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
                maxLength={1}
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