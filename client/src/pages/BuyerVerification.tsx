import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export function BuyerVerification() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleGoBack = () => {
    setLocation("/buyer-account-creation");
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(""); // Clear error when user types

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    const newCode = pastedData.split("").concat(["", "", "", ""]).slice(0, 4);
    setCode(newCode);
    setError("");
    
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length - 1, 3);
    inputRefs[lastIndex].current?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    
    if (fullCode.length !== 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo validation - reject specific code to show error state
      if (fullCode === "1234") {
        setError("Invalid verification code. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Navigate to buyer welcome page
      setLocation("/buyer-welcome");
      
    } catch (error) {
      setError("Verification failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    // TODO: Implement resend logic
    console.log("Resend verification code");
    setError("");
    setCode(["", "", "", ""]);
    inputRefs[0].current?.focus();
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
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verify Phone Number
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              We sent a 4-digit code to your number.{" "}
              <br />
              Enter it below
            </p>
          </div>

          {/* Code Input */}
          <div className="mb-8">
            <div className="flex gap-4 justify-center mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-xl transition-all ${
                    error 
                      ? "border-red-400 bg-red-50" 
                      : digit 
                        ? "border-green-500 bg-green-50" 
                        : "border-gray-300 bg-white"
                  } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  data-testid={`input-code-${index}`}
                />
              ))}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center mb-4" data-testid="text-error">
                {error}
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isSubmitting || code.join("").length !== 4}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            data-testid="button-verify"
          >
            {isSubmitting ? "Verifying..." : "Verify and Continue"}
          </button>

          {/* Resend Link */}
          <div className="text-center">
            <button
              onClick={handleResend}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              data-testid="button-resend"
            >
              Didn't get the code? Resend
            </button>
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
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Verify Phone Number
              </h1>
              <p className="text-gray-600 text-xl leading-relaxed">
                We sent a 4-digit code to your number.{" "}
                <br />
                Enter it below
              </p>
            </div>

            {/* Code Input */}
            <div className="mb-12">
              <div className="flex gap-6 justify-center mb-8">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`w-20 h-20 text-center text-3xl font-bold border-2 rounded-xl transition-all ${
                      error 
                        ? "border-red-400 bg-red-50" 
                        : digit 
                          ? "border-green-500 bg-green-50" 
                          : "border-gray-300 bg-white"
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    data-testid={`input-code-desktop-${index}`}
                  />
                ))}
              </div>

              {error && (
                <div className="text-red-600 text-lg text-center mb-6" data-testid="text-error-desktop">
                  {error}
                </div>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isSubmitting || code.join("").length !== 4}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-6 rounded-xl font-semibold text-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-8"
              data-testid="button-verify-desktop"
            >
              {isSubmitting ? "Verifying..." : "Verify and Continue"}
            </button>

            {/* Resend Link */}
            <div className="text-center">
              <button
                onClick={handleResend}
                className="text-gray-600 hover:text-gray-800 transition-colors text-lg"
                data-testid="button-resend-desktop"
              >
                Didn't get the code? Resend
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative leaf at bottom */}
      <div className="fixed bottom-0 right-0 w-32 h-32 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gray-300">
          <path
            d="M20,50 Q30,20 50,30 Q70,20 80,50 Q70,80 50,70 Q30,80 20,50"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}