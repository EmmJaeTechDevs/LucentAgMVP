import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

export function BuyerVerification() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"initial" | "verify">("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem("buyerUserId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // If no userId, redirect back to registration
      setLocation("/buyer-account-creation");
    }
  }, [setLocation]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "verify" && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleGoBack = () => {
    setLocation("/buyer-account-creation");
  };

  const sendOTP = async () => {
    if (!userId || userId === "") return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        "https://lucent-ag-api-damidek.replit.app/api/auth/request-otp",
        {
          userId: userId,
          type: "sms",
          purpose: "verification"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000
        }
      );

      setStep("verify");
      setCountdown(30);
      setCanResend(false);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      
      if (error.response) {
        setError(error.response.data?.message || "Failed to send OTP");
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!userId || userId === "" || !otpCode) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        "https://lucent-ag-api-damidek.replit.app/api/auth/verify-otp",
        {
          userId: userId,
          code: otpCode,
          type: "sms"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          timeout: 10000
        }
      );

      // Success response (200)
      if (response.data.message === "OTP verified successfully") {
        setShowSuccessAlert(true);
        // Clear stored userId
        localStorage.removeItem("buyerUserId");
        // Redirect after showing success message
        setTimeout(() => {
          setLocation("/");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      
      if (error.response && error.response.status === 400) {
        if (error.response.data?.message === "Invalid or expired OTP code") {
          setError("Invalid or expired OTP code");
        } else {
          setError(error.response.data?.message || "Verification failed");
        }
      } else if (error.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setCountdown(30);
    setCanResend(false);
    sendOTP();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      {/* Success Alert Modal */}
      {showSuccessAlert && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "15px",
            textAlign: "center",
            maxWidth: "400px",
            margin: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#4caf50",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "40px",
              color: "white"
            }}>
              ✓
            </div>
            <h2 style={{
              color: "#2e7d32",
              marginBottom: "15px",
              fontSize: "1.5rem"
            }}>
              Verification Successful!
            </h2>
            <p style={{
              color: "#666",
              marginBottom: "20px"
            }}>
              Your account has been verified successfully. You will be redirected shortly.
            </p>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "450px"
      }}>
        
        {/* Back Button */}
        <button 
          onClick={handleGoBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "#2e7d32",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "30px",
            padding: "5px"
          }}
          data-testid="button-back"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ 
            fontSize: "1.8rem", 
            fontWeight: "bold", 
            color: "#2e7d32", 
            marginBottom: "15px" 
          }}>
            VERIFY YOUR ACCOUNT
          </h1>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>
            {step === "initial" 
              ? "Click the button below to receive an OTP verification code"
              : "Enter the 6-digit code sent to your phone"
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* OTP Input Field (only show in verify step) */}
        {step === "verify" && (
          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#2e7d32",
              fontWeight: "600"
            }}>
              Verification Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              style={{
                width: "100%",
                padding: "15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "18px",
                textAlign: "center",
                letterSpacing: "3px"
              }}
              data-testid="input-otp-code"
            />
          </div>
        )}

        {/* Main Action Button */}
        <button
          onClick={step === "initial" ? sendOTP : verifyOTP}
          disabled={isLoading || (step === "verify" && otpCode.length !== 6)}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: step === "verify" && otpCode.length !== 6 ? "#cccccc" : "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: step === "verify" && otpCode.length !== 6 ? "not-allowed" : "pointer",
            marginBottom: "20px"
          }}
          data-testid={step === "initial" ? "button-send-otp" : "button-verify-otp"}
        >
          {isLoading 
            ? "Processing..." 
            : step === "initial" 
              ? "SEND OTP" 
              : "VERIFY OTP"
          }
        </button>

        {/* Resend Button (only show in verify step) */}
        {step === "verify" && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleResend}
              disabled={!canResend}
              style={{
                background: "none",
                border: "none",
                color: canResend ? "#2e7d32" : "#cccccc",
                fontSize: "16px",
                cursor: canResend ? "pointer" : "not-allowed",
                textDecoration: canResend ? "underline" : "none"
              }}
              data-testid="button-resend-otp"
            >
              Resend OTP {!canResend && `(${countdown}s)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}