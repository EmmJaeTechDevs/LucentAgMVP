import React, { useState } from "react";
import { useLocation } from "wouter";
import { api } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";
import { Eye, EyeOff } from "lucide-react";
import { PasswordValidator, validatePasswordStrength } from "@/components/PasswordValidator";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  // Home Address
  homeHouseNumber: string;
  homeStreet: string;
  homeBusStop: string;
  homeAdditionalDesc: string;
  homeCountry: string;
  homeState: string;
  homeLocalGov: string;
  homePostcode: string;
  // Farm Address
  farmHouseNumber: string;
  farmStreet: string;
  farmBusStop: string;
  farmAdditionalDesc: string;
  farmCountry: string;
  farmState: string;
  farmLocalGov: string;
  farmPostcode: string;
}

export const FarmerAccountCreation = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    // Home Address
    homeHouseNumber: "",
    homeStreet: "",
    homeBusStop: "",
    homeAdditionalDesc: "",
    homeCountry: "",
    homeState: "",
    homeLocalGov: "",
    homePostcode: "",
    // Farm Address
    farmHouseNumber: "",
    farmStreet: "",
    farmBusStop: "",
    farmAdditionalDesc: "",
    farmCountry: "",
    farmState: "",
    farmLocalGov: "",
    farmPostcode: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password strength before submitting
    if (!validatePasswordStrength(formData.password, formData.email || formData.firstName)) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const backendData = {
        userType: "farmer",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        homeStreet: formData.homeStreet,
        homeHouseNumber: formData.homeHouseNumber,
        homeAdditionalDesc: formData.homeAdditionalDesc,
        homeBusStop: formData.homeBusStop,
        homeLocalGov: formData.homeLocalGov,
        homePostcode: formData.homePostcode,
        homeState: formData.homeState,
        homeCountry: formData.homeCountry,
        farmStreet: formData.farmStreet,
        farmHouseNumber: formData.farmHouseNumber,
        farmAdditionalDesc: formData.farmAdditionalDesc,
        farmBusStop: formData.farmBusStop,
        farmLocalGov: formData.farmLocalGov,
        farmPostcode: formData.farmPostcode,
        farmState: formData.farmState,
        farmCountry: formData.farmCountry
      };

      const response = await api.farmers.register(backendData) as any;
      console.log("Registration successful:", response);
      
      // Store complete user data in sessionStorage with 24-hour expiry
      const userId = response?.userId || response?.user?.userId || response?.user?.id;
      const token = response?.token || response?.accessToken || "";
      
      if (userId) {
        const now = new Date().getTime();
        const expiryTime = now + (8 * 60 * 60 * 1000); // 8 hours from now
        
        const sessionData = {
          userId: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          token: token,
          userType: "farmer",
          expiry: expiryTime
        };
        
        // Encrypt sensitive session data before storing
        const encryptedSessionData = SessionCrypto.encryptSessionData(sessionData);
        sessionStorage.setItem("farmerSession", JSON.stringify(encryptedSessionData));
        // Also store in localStorage for backward compatibility (encrypted)
        localStorage.setItem("farmerUserId", SessionCrypto.encrypt(userId));
      }
      
      setLocation("/farmer-verification");
      
    } catch (error) {
      console.error("Error creating account:", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "Error creating account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🌱 Create Farmer Account
          </h1>
          <p className="text-gray-600">
            Fill in all required fields to create your farmer account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative mb-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                  data-testid="input-password-farmer"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-500 hover:text-gray-700 focus:outline-none"
                  data-testid="toggle-password-visibility-farmer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <PasswordValidator 
                password={formData.password} 
                username={formData.email || formData.firstName}
                className="mb-2"
              />
            </div>
          </div>

          {/* Home Address */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🏠 Home Address</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home House Number</label>
                <input
                  type="text"
                  value={formData.homeHouseNumber}
                  onChange={(e) => handleInputChange("homeHouseNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Street</label>
                <input
                  type="text"
                  value={formData.homeStreet}
                  onChange={(e) => handleInputChange("homeStreet", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Bus Stop</label>
              <input
                type="text"
                value={formData.homeBusStop}
                onChange={(e) => handleInputChange("homeBusStop", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Home Additional Description</label>
              <input
                type="text"
                value={formData.homeAdditionalDesc}
                onChange={(e) => handleInputChange("homeAdditionalDesc", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Country</label>
                <select
                  value={formData.homeCountry}
                  onChange={(e) => handleInputChange("homeCountry", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home State</label>
                <input
                  type="text"
                  value={formData.homeState}
                  onChange={(e) => handleInputChange("homeState", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Local Government</label>
                <input
                  type="text"
                  value={formData.homeLocalGov}
                  onChange={(e) => handleInputChange("homeLocalGov", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Postcode</label>
                <input
                  type="text"
                  value={formData.homePostcode}
                  onChange={(e) => handleInputChange("homePostcode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Farm Address */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚜 Farm Address</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm House Number</label>
                <input
                  type="text"
                  value={formData.farmHouseNumber}
                  onChange={(e) => handleInputChange("farmHouseNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Street</label>
                <input
                  type="text"
                  value={formData.farmStreet}
                  onChange={(e) => handleInputChange("farmStreet", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm Bus Stop</label>
              <input
                type="text"
                value={formData.farmBusStop}
                onChange={(e) => handleInputChange("farmBusStop", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm Additional Description</label>
              <input
                type="text"
                value={formData.farmAdditionalDesc}
                onChange={(e) => handleInputChange("farmAdditionalDesc", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Country</label>
                <select
                  value={formData.farmCountry}
                  onChange={(e) => handleInputChange("farmCountry", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Country</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm State</label>
                <input
                  type="text"
                  value={formData.farmState}
                  onChange={(e) => handleInputChange("farmState", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Local Government</label>
                <input
                  type="text"
                  value={formData.farmLocalGov}
                  onChange={(e) => handleInputChange("farmLocalGov", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Postcode</label>
                <input
                  type="text"
                  value={formData.farmPostcode}
                  onChange={(e) => handleInputChange("farmPostcode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Farmer Account"}
          </button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-3">
              Already have an account?
            </p>
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold text-lg hover:bg-green-600 hover:text-white transition-colors"
            >
              Login to Your Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};