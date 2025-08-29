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

function Router() {
  return (
    <Switch>
      {/* Add pages below */}
      <Route path="/" component={Splash} />
      <Route path="/language-selector" component={LanguageSelector} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/farmer-onboarding" component={FarmerOnboarding} />
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
