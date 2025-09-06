import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { BaseUrl } from "../../../Baseconfig";
import axios from "axios";

export function ResetPassword() {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();

  // Helper function to get reset token
  const getResetToken = () => {
    return sessionStorage.getItem("reset password token");
  };

  // Helper function to get userId
  const getUserId = () => {
    return sessionStorage.getItem("userIdforPasswordChange");
  };

  // Check for required data on mount
  useEffect(() => {
    const token = getResetToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Session expired. Please start the password reset process again.",
      });
      setLocation("/forgot-password");
    }
  }, [setLocation, toast]);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    
    if (errors.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({ newPassword: "", confirmPassword: "" });
    
    let hasError = false;
    const newErrors = { newPassword: "", confirmPassword: "" };

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      hasError = true;
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters long";
      hasError = true;
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const token = getResetToken();
    const userId = getUserId();

    if (!token || !userId) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: "Session expired. Please start the password reset process again.",
      });
      setLocation("/forgot-password");
      return;
    }

    setIsLoading(true);

    try {
      console.log("=== RESET PASSWORD REQUEST ===");
      console.log("User ID:", userId);
      console.log("Token present:", !!token);

      const requestData = {
        token: token,
        password: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      };

      console.log("Request Data:", { ...requestData, password: "[HIDDEN]", confirmPassword: "[HIDDEN]" });

      const response = await axios.post(
        `${BaseUrl}/api/auth/reset-password`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000
        }
      );

      console.log("=== RESET PASSWORD RESPONSE ===");
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);

      if (response.status === 200) {
        const responseData = response.data;
        
        if (responseData.success) {
          console.log("✅ PASSWORD RESET SUCCESSFUL");

          // Clear session storage
          sessionStorage.removeItem("userIdforPasswordChange");
          sessionStorage.removeItem("reset password token");

          toast({
            title: "✅ Password Reset Successful",
            description: responseData.message,
          });

          // Redirect to login page
          setLocation("/login");
        } else {
          console.log("❌ PASSWORD RESET FAILED - Invalid Response");
          toast({
            variant: "destructive",
            title: "Reset Failed",
            description: "Invalid response from server. Please try again.",
          });
        }
      }
    } catch (error: any) {
      console.error("=== RESET PASSWORD ERROR ===");
      console.error("Error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || "Password reset failed";
        
        console.log("Error Status:", status);
        console.log("Error Message:", errorMessage);

        if (status === 400) {
          toast({
            variant: "destructive",
            title: "Invalid Request",
            description: errorMessage,
          });
        } else if (status === 401) {
          toast({
            variant: "destructive",
            title: "Invalid Token",
            description: "Reset token is invalid or has expired. Please start the process again.",
          });
          setLocation("/forgot-password");
        } else {
          toast({
            variant: "destructive",
            title: "Reset Failed",
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
      console.log("=== RESET PASSWORD REQUEST COMPLETED ===");
    }
  };

  const handleBack = () => {
    setLocation("/reset-otp");
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
            <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Create New Password
            </h2>
            <p className="text-gray-600 text-sm">
              Please enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 transition-colors ${
                    errors.newPassword ? "border-red-500" : "border-gray-300 focus:border-green-500"
                  }`}
                  data-testid="input-new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-testid="toggle-new-password"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1" data-testid="error-new-password">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 transition-colors ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-green-500"
                  }`}
                  data-testid="input-confirm-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  data-testid="toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1" data-testid="error-confirm-password">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium rounded-lg transition-colors disabled:opacity-50"
              data-testid="button-reset-password"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
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
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          </div>

          {/* Instructions */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Create New Password
            </h2>
            <p className="text-gray-600">
              Please enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block font-medium text-gray-700 mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-4 pr-14 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-lg ${
                    errors.newPassword ? "border-red-500" : "border-gray-300 focus:border-green-500"
                  }`}
                  data-testid="input-new-password-desktop"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  data-testid="toggle-new-password-desktop"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 mt-2" data-testid="error-new-password-desktop">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-medium text-gray-700 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-4 pr-14 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-lg ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-green-500"
                  }`}
                  data-testid="input-confirm-password-desktop"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  data-testid="toggle-confirm-password-desktop"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 mt-2" data-testid="error-confirm-password-desktop">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              data-testid="button-reset-password-desktop"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}