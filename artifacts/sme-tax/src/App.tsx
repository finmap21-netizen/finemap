import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Penalties from "@/pages/Penalties";
import Reminders from "@/pages/Reminders";
import Knowledge from "@/pages/Knowledge";
import News from "@/pages/News";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import InvoiceRequests from "@/pages/InvoiceRequests";
import ContactAdmin from "@/pages/ContactAdmin";
import LawsLibrary from "@/pages/LawsLibrary";
import { ChatBot } from "@/components/ChatBot";
import { OnboardingModal } from "@/components/OnboardingModal";
import { FinancialTips } from "@/components/FinancialTips";
import { isAuthenticated } from "@/lib/auth";

import InvoiceGenerator from "@/pages/InvoiceGenerator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const [location] = useLocation();
  const authenticated = isAuthenticated();
  const isApp = authenticated && location !== "/" && location !== "/login" && location !== "/register";

  return (
    <Layout>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/penalties" component={Penalties} />
        <Route path="/reminders" component={Reminders} />
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/news" component={News} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route path="/invoice-requests" component={InvoiceRequests} />
        <Route path="/invoice-generator" component={InvoiceGenerator} />
        <Route path="/contact-admin" component={ContactAdmin} />
        <Route path="/laws-library" component={LawsLibrary} />
        <Route component={NotFound} />
      </Switch>

      {isApp && (
        <>
          <ChatBot />
          <OnboardingModal />
          <FinancialTips />
        </>
      )}
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
