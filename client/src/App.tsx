import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { retrieveSession, clearSession, updateSessionTimestamp } from "@/lib/storage";
import { Loader2 } from "lucide-react";
import { BaseUrl } from "../../Baseconfig";
import { SessionCrypto } from "@/utils/sessionCrypto";

import { Splash } from "@/pages/Splash";
import { LanguageSelector } from "@/pages/LanguageSelector";
import { RoleSelection } from "@/pages/RoleSelection";
import { FarmerOnboarding } from "@/pages/FarmerOnboarding";
import { BuyerOnboarding } from "@/pages/BuyerOnboarding";
import { FarmerAccountCreation } from "@/pages/FarmerAccountCreation";
import { BuyerAccountCreation } from "@/pages/BuyerAccountCreation";
import { FarmerVerification } from "@/pages/FarmerVerification";
import { NotificationPreferences } from "@/pages/NotificationPreferences";
import { FarmerNotificationPreferences } from "@/pages/FarmerNotificationPreferences";
import { CropSelection } from "@/pages/CropSelection";
import { CropProcessing } from "@/pages/CropProcessing";
import { FarmerDashboard } from "@/pages/FarmerDashboard";
import { ViewCrops } from "@/pages/ViewCrops";
import { CheckOrders } from "@/pages/CheckOrders";
import { Notifications } from "@/pages/Notifications";
import { AddNewCrop } from "@/pages/AddNewCrop";
import { EditCrop } from "@/pages/EditCrop";
import { BuyerVerification } from "@/pages/BuyerVerification";
import { BuyerExplanation } from "@/pages/BuyerExplanation";
import { BuyerWelcome } from "@/pages/BuyerWelcome";
import { BuyerNotificationPreferences } from "@/pages/BuyerNotificationPreferences";
import { BuyerHome } from "@/pages/BuyerHome";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { Login } from "@/pages/Login";
import { BuyerProfile } from "@/pages/BuyerProfile";
import { FarmerProfile } from "@/pages/FarmerProfile";
import { BuyerOrders } from "@/pages/BuyerOrders";
import { Communities } from "@/pages/Communities";
import { CommunityDetail } from "@/pages/CommunityDetail";
import { PostDetail } from "@/pages/PostDetail";
import { ReportContent } from "@/pages/ReportContent";
import { JointDeliveryRequest } from "@/pages/JointDeliveryRequest";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ResetOTP } from "@/pages/ResetOTP";
import { ResetPassword } from "@/pages/ResetPassword";
import { LoggedOut } from "@/pages/LoggedOut";
import { SessionExpired } from "@/pages/SessionExpired";

function AutoLoginCheck({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked) return;

    const checkAutoLogin = async () => {
      try {
        const session = retrieveSession();
        
        if (!session) {
          setIsChecking(false);
          return;
        }

        console.log("Found stored session for:", session.userType);

        if (session.userType === "buyer" && session.token) {
          try {
            const response = await fetch(`${BaseUrl}/api/auth/validate-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.token}`,
              },
              body: JSON.stringify({
                userId: session.userId,
                userType: "buyer",
              }),
            });

            if (response.ok) {
              const now = new Date().getTime();
              const expiryTime = now + (8 * 60 * 60 * 1000);
              
              const sessionData = {
                userId: session.userId,
                email: session.email,
                token: session.token,
                userType: "buyer",
                expiry: expiryTime
              };
              
              // Encrypt session data before storing
              const encryptedSessionData = SessionCrypto.encryptSessionData(sessionData);
              sessionStorage.setItem("buyerSession", JSON.stringify(encryptedSessionData));
              updateSessionTimestamp();
              
              console.log("Auto-login successful for buyer, redirecting to dashboard");
              setLocation("/buyer-home");
            } else {
              console.log("Token validation failed, clearing session");
              clearSession();
              setLocation("/login");
            }
          } catch (error) {
            console.error("Token validation error:", error);
            clearSession();
            setLocation("/login");
          }
        } else if (session.userType === "farmer") {
          console.log("Farmer detected, redirecting to login page");
          setLocation("/login");
        } else {
          console.log("No valid session data");
          clearSession();
        }
      } catch (error) {
        console.error("Error checking auto-login:", error);
        clearSession();
      } finally {
        setIsChecking(false);
        setHasChecked(true);
      }
    };

    checkAutoLogin();
  }, [hasChecked, setLocation]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={Splash} />
      <Route path="/language-selector" component={LanguageSelector} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/farmer-onboarding" component={FarmerOnboarding} />
      <Route path="/buyer-onboarding" component={BuyerOnboarding} />
      <Route path="/farmer-account-creation" component={FarmerAccountCreation} />
      <Route path="/buyer-account-creation" component={BuyerAccountCreation} />
      <Route path="/farmer-verification" component={FarmerVerification} />
      <Route path="/notification-preferences" component={NotificationPreferences} />
      <Route path="/farmer-notification-preferences" component={FarmerNotificationPreferences} />
      <Route path="/crop-selection" component={CropSelection} />
      <Route path="/crop-processing" component={CropProcessing} />
      <Route path="/farmer-dashboard" component={FarmerDashboard} />
      <Route path="/view-crops" component={ViewCrops} />
      <Route path="/check-orders" component={CheckOrders} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/add-new-crop" component={AddNewCrop} />
      <Route path="/edit-crop" component={EditCrop} />
      <Route path="/buyer-verification" component={BuyerVerification} />
      <Route path="/buyer-explanation" component={BuyerExplanation} />
      <Route path="/buyer-welcome" component={BuyerWelcome} />
      <Route path="/buyer-notification-preferences" component={BuyerNotificationPreferences} />
      <Route path="/buyer-home" component={BuyerHome} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/buyer-profile" component={BuyerProfile} />
      <Route path="/farmer-profile" component={FarmerProfile} />
      <Route path="/buyer-orders" component={BuyerOrders} />
      <Route path="/communities" component={Communities} />
      <Route path="/community/:id" component={CommunityDetail} />
      <Route path="/community/:communityId/post/:postId" component={PostDetail} />
      <Route path="/community/:communityId/report-resource/:resourceId" component={ReportContent} />
      <Route path="/community/:communityId/joint-delivery-request" component={JointDeliveryRequest} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-otp" component={ResetOTP} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/logged-out" component={LoggedOut} />
      <Route path="/session-expired" component={SessionExpired} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <AutoLoginCheck>
            <Router />
          </AutoLoginCheck>
          <PWAInstallPrompt />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
