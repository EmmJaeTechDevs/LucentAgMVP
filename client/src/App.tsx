import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";

import { Splash } from "@/pages/Splash";
import { LanguageSelector } from "@/pages/LanguageSelector";
import { RoleSelection } from "@/pages/RoleSelection";
import { FarmerOnboarding } from "@/pages/FarmerOnboarding";
import { BuyerOnboarding } from "@/pages/BuyerOnboarding";
import { FarmerAccountCreation } from "@/pages/FarmerAccountCreation";
import { BuyerAccountCreation } from "@/pages/BuyerAccountCreation";
import { FarmerVerification } from "@/pages/FarmerVerification";
import { NotificationPreferences } from "@/pages/NotificationPreferences";
import { CropSelection } from "@/pages/CropSelection";
import { CropProcessing } from "@/pages/CropProcessing";
import { FarmerDashboard } from "@/pages/FarmerDashboard";
import { ViewCrops } from "@/pages/ViewCrops";
import { CheckOrders } from "@/pages/CheckOrders";
import { Notifications } from "@/pages/Notifications";
import { AddNewCrop } from "@/pages/AddNewCrop";
import { BuyerVerification } from "@/pages/BuyerVerification";
import { BuyerWelcome } from "@/pages/BuyerWelcome";
import { BuyerNotificationPreferences } from "@/pages/BuyerNotificationPreferences";
import { BuyerHome } from "@/pages/BuyerHome";

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
      <Route path="/crop-selection" component={CropSelection} />
      <Route path="/crop-processing" component={CropProcessing} />
      <Route path="/farmer-dashboard" component={FarmerDashboard} />
      <Route path="/view-crops" component={ViewCrops} />
      <Route path="/check-orders" component={CheckOrders} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/add-new-crop" component={AddNewCrop} />
      <Route path="/buyer-verification" component={BuyerVerification} />
      <Route path="/buyer-welcome" component={BuyerWelcome} />
      <Route path="/buyer-notification-preferences" component={BuyerNotificationPreferences} />
      <Route path="/buyer-home" component={BuyerHome} />
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
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
