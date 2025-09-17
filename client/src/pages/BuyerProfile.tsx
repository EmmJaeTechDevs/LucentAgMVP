import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Phone, Mail, MapPin, Edit3 } from "lucide-react";
import { useSessionValidation } from "@/hooks/useSessionValidation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { SessionCrypto } from "@/utils/sessionCrypto";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
  expiry: number;
}

export function BuyerProfile() {
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate buyer session
  useSessionValidation("buyer");

  // Load user data from session storage
  useEffect(() => {
    const buyerSession = sessionStorage.getItem("buyerSession");
    if (buyerSession) {
      try {
        const encryptedSessionData = JSON.parse(buyerSession);
        const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
        const now = new Date().getTime();
        
        if (now < sessionData.expiry) {
          setUserData({
            firstName: sessionData.firstName || "",
            lastName: sessionData.lastName || "",
            email: sessionData.email || "",
            phone: sessionData.phone || "",
            userType: sessionData.userType || "buyer",
            expiry: sessionData.expiry
          });
        } else {
          // Session expired, redirect to login
          setLocation("/login");
          return;
        }
      } catch (error) {
        console.error("Error parsing buyer session:", error);
        setLocation("/login");
        return;
      }
    } else {
      // No session data, redirect to login
      setLocation("/login");
      return;
    }
    setIsLoading(false);
  }, [setLocation]);

  const handleBack = () => {
    setLocation("/buyer-home");
  };

  const handleEditProfile = () => {
    // TODO: Implement edit profile functionality
    console.log("Edit profile clicked");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No user data found</p>
          <Button onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Layout */}
      <div className="block md:hidden flex-1 px-6 pt-16 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <HamburgerMenu userType="buyer" />
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userData.firstName} {userData.lastName}
              </h2>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)}
              </span>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">{userData.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleEditProfile}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-base font-medium rounded-xl transition-colors"
              data-testid="button-edit-profile"
            >
              Edit Profile
            </Button>
            
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 text-base font-medium rounded-xl transition-colors"
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <HamburgerMenu userType="buyer" />
          </div>

          {/* Profile Content */}
          <div className="text-center mb-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-16 h-16 text-white" />
            </div>

            {/* User Info */}
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {userData.firstName} {userData.lastName}
            </h2>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full text-lg">
              {userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 font-medium">Email</p>
                <p className="text-gray-900 font-semibold text-lg">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-500 font-medium">Phone</p>
                <p className="text-gray-900 font-semibold text-lg">{userData.phone}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleEditProfile}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
              data-testid="button-edit-profile-desktop"
            >
              Edit Profile
            </Button>
            
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 text-xl font-medium rounded-xl transition-all hover:scale-105"
              data-testid="button-back-home-desktop"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}