import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { config } from "process";
import { BaseUrl } from "../../../Baseconfig";

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberLogin: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    emailOrPhone: "",
    password: "",
  });

  const clearErrors = () => {
    setErrors({ emailOrPhone: "", password: "" });
  };

  const validateInput = (value: string, type: "email" | "phone") => {
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    } else {
      // Basic phone validation - adjust regex as needed for your requirements
      const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
      return phoneRegex.test(value);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (field === "emailOrPhone" || field === "password") {
      clearErrors();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors();

    try {
      // Determine input type and validate format
      const inputType = formData.emailOrPhone.includes("@") ? "email" : "phone";
      if (!validateInput(formData.emailOrPhone, inputType)) {
        setErrors({
          emailOrPhone: `${inputType === "email" ? "Email address" : "Phone number"} unrecognised. Please check and try again`,
          password: "",
        });
        return;
      }

      // Prepare login data in the format expected by the server
      const loginData = {
        identifier: formData.emailOrPhone, // Server expects "identifier" field
        password: formData.password
      };

      console.log("=== LOGIN REQUEST (AXIOS) ===");
      console.log("Input Type:", inputType);
      console.log("Login Data:", loginData);

      // Backend API endpoint (using the same as signup pages)
      const API_BASE_URL = "https://lucent-ag-api-damidek.replit.app";

      // Call login API using axios
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000, // 10 second timeout
        },
      );

      console.log("=== LOGIN RESPONSE (AXIOS) ===");
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      if (response.status === 200) {
        console.log("✅ LOGIN SUCCESSFUL");
        
        const { user, token, message } = response.data;
        const userId = user.userId || user.id;
        
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Login Error",
            description: "User ID not found in response. Please try again.",
          });
          return;
        }

        // Store complete user data in session storage with 24-hour expiry
        const sessionData = {
          userId: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          token: token,
          userType: user.userType,
          isVerified: user.isVerified,
          expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
        };

        if (user.userType === "farmer") {
          sessionStorage.setItem("farmerSession", JSON.stringify(sessionData));
        } else if (user.userType === "buyer") {
          sessionStorage.setItem("buyerSession", JSON.stringify(sessionData));
        }

        // Also store in localStorage if remember login is checked (30 days)
        if (formData.rememberLogin) {
          const longTermSession = {
            ...sessionData,
            expiry: new Date().getTime() + (30 * 24 * 60 * 60 * 1000) // 30 days
          };
          
          if (user.userType === "farmer") {
            localStorage.setItem("farmerUserId", userId);
            localStorage.setItem("farmerSession", JSON.stringify(longTermSession));
          } else if (user.userType === "buyer") {
            localStorage.setItem("buyerUserId", userId);
            localStorage.setItem("buyerSession", JSON.stringify(longTermSession));
          }
        }

        // Check if user is verified
        if (user.isVerified) {
          toast({
            title: "✅ Login Successful!",
            description: `Welcome back, ${user.firstName}!`,
          });

          // Route verified users appropriately
          if (user.userType === "buyer") {
            // Take verified buyer straight to buyer home page
            setLocation("/buyer-home");
          } else if (user.userType === "farmer") {
            // Take verified farmer through normal process (notification -> harvesting method)
            setLocation("/notification-preferences");
          }
        } else {
          // User is not verified - this should not happen with current flow, but handle it
          toast({
            variant: "destructive",
            title: "Account Not Verified",
            description: "Please verify your phone number.",
          });
          
          // Redirect to verification page
          if (user.userType === "farmer") {
            setLocation("/farmer-verification");
          } else if (user.userType === "buyer") {
            setLocation("/buyer-verification");
          }
        }
      }
    } catch (error) {
      console.error("=== LOGIN ERROR (AXIOS) ===");
      console.error("Error during login:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "";

        console.log("Axios Error Status:", status);
        console.log("Axios Error Message:", errorMessage);

        if (status === 401) {
          // Handle 401 - Invalid credentials
          const errorData = error.response?.data;
          if (errorData?.type === "invalid_credentials") {
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: errorData.message || "Invalid credentials",
            });
          } else if (errorData?.type === "account_not_verified") {
            // Account not verified - redirect to verification page
            const userId = errorData.user?.id;
            
            if (userId) {
              // Store user ID for verification with 24-hour expiry
              const verificationData = {
                userId: userId,
                expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
              };
              
              // Determine user type from identifier format (email vs phone)
              const isEmail = validateInput(formData.emailOrPhone, "email");
              const userType = isEmail ? "buyer" : "farmer";
              
              if (userType === "farmer") {
                sessionStorage.setItem("farmerSession", JSON.stringify({
                  ...verificationData,
                  userType: "farmer"
                }));
                localStorage.setItem("farmerUserId", userId);
              } else {
                sessionStorage.setItem("buyerSession", JSON.stringify({
                  ...verificationData,
                  userType: "buyer"
                }));
                localStorage.setItem("buyerUserId", userId);
              }
              
              toast({
                variant: "destructive",
                title: "Account Not Verified",
                description: errorData.message || "Please verify your phone number.",
              });
              
              // Redirect to appropriate verification page
              if (userType === "farmer") {
                setLocation("/farmer-verification");
              } else {
                setLocation("/buyer-verification");
              }
            } else {
              toast({
                variant: "destructive",
                title: "Verification Required",
                description: errorData.message || "Account not verified. Please verify your phone number.",
              });
            }
          } else {
            // Generic 401 handling
            toast({
              variant: "destructive",
              title: "Authentication Failed",
              description: errorMessage || "Invalid credentials. Please try again.",
            });
          }
        } else if (status === 403) {
          // Handle 403 - Account not verified (new response format)
          const errorData = error.response?.data;
          if (errorData?.type === "account_not_verified") {
            const userId = errorData.user?.id;
            
            if (userId) {
              console.log("=== 403 ACCOUNT NOT VERIFIED ===");
              console.log("User ID:", userId);
              
              // Store user ID for verification with 24-hour expiry
              const verificationData = {
                userId: userId,
                expiry: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
              };
              
              // Determine user type from identifier format (email vs phone)
              const isEmail = validateInput(formData.emailOrPhone, "email");
              const userType = isEmail ? "buyer" : "farmer";
              
              if (userType === "farmer") {
                sessionStorage.setItem("farmerSession", JSON.stringify({
                  ...verificationData,
                  userType: "farmer"
                }));
                localStorage.setItem("farmerUserId", userId);
              } else {
                sessionStorage.setItem("buyerSession", JSON.stringify({
                  ...verificationData,
                  userType: "buyer"
                }));
                localStorage.setItem("buyerUserId", userId);
              }
              
              // Send OTP request automatically
              await requestOTPForLogin(userId, userType);
              
              // Show notification and redirect to verification page
              toast({
                title: "✅ Verification Code Sent",
                description: "Please check your phone for the verification code.",
              });
              
              if (userType === "farmer") {
                setLocation("/farmer-verification");
              } else {
                setLocation("/buyer-verification");
              }
            } else {
              toast({
                variant: "destructive",
                title: "Verification Required",
                description: errorData.message || "Account not verified. Please verify your phone number.",
              });
            }
          } else {
            toast({
              variant: "destructive",
              title: "Access Forbidden",
              description: errorMessage || "Access denied. Please try again.",
            });
          }
        } else if (status === 404) {
          // User not found
          setErrors({
            emailOrPhone: "Email address or phone number unrecognised. Please check and try again",
            password: "",
          });
        } else if (status === 400) {
          // Bad request - validation error
          toast({
            variant: "destructive",
            title: "Invalid Input",
            description: errorMessage || "Please check your input and try again.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: errorMessage || `Login failed with status: ${status}`,
          });
        }
      } else {
        // Network error or other error
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your connection and try again.",
        });
      }
    } finally {
      setIsLoading(false);
      console.log("=== LOGIN REQUEST COMPLETED (AXIOS) ===");
    }
  };

  const handleSignupRedirect = () => {
    setLocation("/role-selection");
  };

  const handleForgotPassword = () => {
    setLocation("/forgot-password");
  };

  const requestOTPForLogin = async (userId: string, userType: string) => {
    try {
      console.log("=== REQUEST OTP FOR LOGIN ===");
      console.log("User ID:", userId);
      console.log("User Type:", userType);

      // Prepare OTP request data (same format as signup pages)
      const otpRequestData = {
        userId: userId,
        type: "sms",
        purpose: "verification",
      };

      console.log("OTP Request Data:", otpRequestData);

      // Send OTP request using axios
      const otpResponse = await axios.post(
        `${BaseUrl}/api/auth/request-otp`,
        otpRequestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        },
      );

      console.log("=== OTP REQUEST RESPONSE ===");
      console.log("OTP Response Status:", otpResponse.status);
      console.log("OTP Response Data:", otpResponse.data);

      if (otpResponse.status === 200) {
        console.log("✅ OTP REQUEST SUCCESSFUL");

        toast({
          title: "✅ Verification Code Sent!",
          description: "Please check your phone for the verification code.",
        });

        // Redirect to appropriate verification page
        if (userType === "farmer") {
          setLocation("/farmer-verification");
        } else if (userType === "buyer") {
          setLocation("/buyer-verification");
        } else {
          toast({
            variant: "destructive",
            title: "Unknown User Type",
            description: "Unable to determine verification page.",
          });
        }
      } else {
        console.log("❌ OTP REQUEST FAILED");
        toast({
          variant: "destructive",
          title: "OTP Request Failed",
          description: "Failed to send verification code. Please try again.",
        });
      }
    } catch (error) {
      console.error("=== OTP REQUEST ERROR ===");
      console.error("Error requesting OTP:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to send verification code";
        toast({
          variant: "destructive",
          title: "OTP Request Failed",
          description: errorMessage,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Network Error",
          description:
            "Failed to send verification code. Please check your connection.",
        });
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-20 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl">🌱</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-base">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <input
                type="text"
                value={formData.emailOrPhone}
                onChange={(e) =>
                  handleInputChange("emailOrPhone", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.emailOrPhone
                    ? "border-orange-500 focus:border-orange-600 focus:ring-orange-200"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder="Please input your email or phone number here"
                required
                data-testid="input-email-phone"
              />
              {errors.emailOrPhone && (
                <p
                  className="mt-2 text-sm text-orange-600"
                  data-testid="error-email-phone"
                >
                  {errors.emailOrPhone}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.password
                    ? "border-orange-500 focus:border-orange-600 focus:ring-orange-200"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
              {errors.password && (
                <p
                  className="mt-2 text-sm text-orange-600"
                  data-testid="error-password"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Login Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberLogin}
                  onChange={(e) =>
                    handleInputChange("rememberLogin", e.target.checked)
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  data-testid="checkbox-remember"
                />
                <span className="text-sm text-gray-700">Remember Login</span>
              </label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={
                isLoading || !formData.emailOrPhone || !formData.password
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Signup Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account yet? We invite you to{" "}
                <button
                  type="button"
                  onClick={handleSignupRedirect}
                  className="text-green-600 font-medium hover:text-green-700 transition-colors"
                  data-testid="link-signup"
                >
                  Signup
                </button>
              </p>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
                data-testid="link-forgot-password"
              >
                Forgotten Password?
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <div className="text-3xl">🌱</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <input
                type="text"
                value={formData.emailOrPhone}
                onChange={(e) =>
                  handleInputChange("emailOrPhone", e.target.value)
                }
                className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-colors text-lg ${
                  errors.emailOrPhone
                    ? "border-orange-500 focus:border-orange-600 focus:ring-orange-200"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder="Please input your email or phone number here"
                required
                data-testid="input-email-phone-desktop"
              />
              {errors.emailOrPhone && (
                <p
                  className="mt-2 text-orange-600"
                  data-testid="error-email-phone-desktop"
                >
                  {errors.emailOrPhone}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-colors text-lg ${
                  errors.password
                    ? "border-orange-500 focus:border-orange-600 focus:ring-orange-200"
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder="Enter your password"
                required
                data-testid="input-password-desktop"
              />
              {errors.password && (
                <p
                  className="mt-2 text-orange-600"
                  data-testid="error-password-desktop"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Login Checkbox */}
            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberLogin}
                  onChange={(e) =>
                    handleInputChange("rememberLogin", e.target.checked)
                  }
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  data-testid="checkbox-remember-desktop"
                />
                <span className="text-gray-700">Remember Login</span>
              </label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={
                isLoading || !formData.emailOrPhone || !formData.password
              }
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              data-testid="button-login-desktop"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Signup Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account yet? We invite you to{" "}
                <button
                  type="button"
                  onClick={handleSignupRedirect}
                  className="text-green-600 font-medium hover:text-green-700 transition-colors"
                  data-testid="link-signup-desktop"
                >
                  Signup
                </button>
              </p>
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-green-600 hover:text-green-700 transition-colors"
                data-testid="link-forgot-password-desktop"
              >
                Forgotten Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
