import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [loginType, setLoginType] = useState<"email" | "phone">("email");
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberLogin: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    emailOrPhone: "",
    password: ""
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
      // Validate input format first
      if (!validateInput(formData.emailOrPhone, loginType)) {
        setErrors({
          emailOrPhone: `${loginType === "email" ? "Email address" : "Phone number"} unrecognised. Please check and try again`,
          password: ""
        });
        return;
      }

      // Prepare login data
      const loginData = {
        [loginType]: formData.emailOrPhone,
        password: formData.password,
        rememberLogin: formData.rememberLogin
      };

      console.log("=== LOGIN REQUEST ===");
      console.log("Login Type:", loginType);
      console.log("Login Data:", loginData);

      // Call login API - adjust URL based on your backend
      const response = await fetch(
        "https://cors-anywhere.herokuapp.com/https://lucent-ag-api-damidek.replit.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(loginData),
        }
      );

      console.log("=== LOGIN RESPONSE ===");
      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      let responseData;
      try {
        responseData = await response.json();
        console.log("Response Body:", responseData);
      } catch (parseError) {
        console.log("Failed to parse JSON response:", parseError);
        const textResponse = await response.text();
        console.log("Raw response text:", textResponse);
      }

      if (response.status === 200) {
        console.log("✅ LOGIN SUCCESSFUL");
        
        // Store user session if remember login is checked
        if (formData.rememberLogin && responseData?.user) {
          localStorage.setItem("userSession", JSON.stringify({
            userId: responseData.user.id,
            userType: responseData.user.userType,
            expiry: new Date().getTime() + (30 * 24 * 60 * 60 * 1000) // 30 days
          }));
        } else if (responseData?.user) {
          // Store session for current session only
          sessionStorage.setItem("userSession", JSON.stringify({
            userId: responseData.user.id,
            userType: responseData.user.userType,
            expiry: new Date().getTime() + (2 * 60 * 60 * 1000) // 2 hours
          }));
        }

        toast({
          title: "✅ Login Successful!",
          description: "Welcome back! Redirecting to your dashboard...",
        });

        // Redirect based on user type
        if (responseData?.user?.userType === "farmer") {
          setLocation("/farmer-dashboard");
        } else if (responseData?.user?.userType === "buyer") {
          setLocation("/buyer-home");
        } else {
          // Fallback redirect
          setLocation("/dashboard");
        }

      } else if (response.status === 401) {
        // Unauthorized - wrong credentials
        const errorMessage = responseData?.message || "";
        
        if (errorMessage.toLowerCase().includes("password")) {
          setErrors({
            emailOrPhone: "",
            password: "Wrong Password. Please check and try again"
          });
        } else {
          setErrors({
            emailOrPhone: `${loginType === "email" ? "Email address" : "Phone number"} unrecognised. Please check and try again`,
            password: ""
          });
        }
      } else if (response.status === 404) {
        // User not found
        setErrors({
          emailOrPhone: `${loginType === "email" ? "Email address" : "Phone number"} unrecognised. Please check and try again`,
          password: ""
        });
      } else {
        console.log(`❌ LOGIN FAILED - Status ${response.status}`);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: `Login failed with status: ${response.status}`,
        });
      }
    } catch (error) {
      console.error("=== LOGIN ERROR ===");
      console.error("Error during login:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
      console.log("=== LOGIN REQUEST COMPLETED ===");
    }
  };

  const handleSignupRedirect = () => {
    setLocation("/role-selection");
  };

  const handleForgotPassword = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Password reset functionality will be available soon.",
    });
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
            {/* Login Type Toggle */}
            <div className="flex items-center space-x-3 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="loginType"
                  checked={loginType === "phone"}
                  onChange={() => setLoginType("phone")}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  data-testid="radio-phone-login"
                />
                <span className="text-sm text-gray-700">Login with Phone number instead</span>
              </label>
            </div>

            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === "email" ? "Email Address" : "Phone Number"}
              </label>
              <input
                type={loginType === "email" ? "email" : "tel"}
                value={formData.emailOrPhone}
                onChange={(e) => handleInputChange("emailOrPhone", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  errors.emailOrPhone 
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200" 
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder={loginType === "email" ? "Enter your email address" : "Enter your phone number"}
                required
                data-testid={`input-${loginType}`}
              />
              {errors.emailOrPhone && (
                <p className="mt-2 text-sm text-red-600" data-testid="error-email-phone">
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
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200" 
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600" data-testid="error-password">
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
                  onChange={(e) => handleInputChange("rememberLogin", e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  data-testid="checkbox-remember"
                />
                <span className="text-sm text-gray-700">Remember Login</span>
              </label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.emailOrPhone || !formData.password}
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
            {/* Login Type Toggle */}
            <div className="flex items-center space-x-3 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="loginType"
                  checked={loginType === "phone"}
                  onChange={() => setLoginType("phone")}
                  className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  data-testid="radio-phone-login-desktop"
                />
                <span className="text-gray-700">Login with Phone number instead</span>
              </label>
            </div>

            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === "email" ? "Email Address" : "Phone Number"}
              </label>
              <input
                type={loginType === "email" ? "email" : "tel"}
                value={formData.emailOrPhone}
                onChange={(e) => handleInputChange("emailOrPhone", e.target.value)}
                className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-colors text-lg ${
                  errors.emailOrPhone 
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200" 
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder={loginType === "email" ? "Enter your email address" : "Enter your phone number"}
                required
                data-testid={`input-${loginType}-desktop`}
              />
              {errors.emailOrPhone && (
                <p className="mt-2 text-red-600" data-testid="error-email-phone-desktop">
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
                    ? "border-red-500 focus:border-red-600 focus:ring-red-200" 
                    : "border-gray-300 focus:border-green-600 focus:ring-green-200"
                }`}
                placeholder="Enter your password"
                required
                data-testid="input-password-desktop"
              />
              {errors.password && (
                <p className="mt-2 text-red-600" data-testid="error-password-desktop">
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
                  onChange={(e) => handleInputChange("rememberLogin", e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  data-testid="checkbox-remember-desktop"
                />
                <span className="text-gray-700">Remember Login</span>
              </label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !formData.emailOrPhone || !formData.password}
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