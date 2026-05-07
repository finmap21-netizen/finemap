import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
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
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RedirectHome() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (isAuthenticated()) {
      setLocation("/dashboard");
    } else {
      setLocation("/login");
    }
  }, [setLocation]);
  return null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={RedirectHome} />
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
        <Route component={NotFound} />
      </Switch>
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
