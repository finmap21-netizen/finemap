import { ReactNode, useEffect, useState } from "react";
import { Sidebar, SidebarContent } from "./Sidebar";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { isAuthenticated, removeToken } from "@/lib/auth";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const authenticated = isAuthenticated();
  const [open, setOpen] = useState(false);

  const { data: user, isLoading, isError } = useGetMe({
    query: {
      enabled: authenticated,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  useEffect(() => {
    if (isError && authenticated) {
      removeToken();
      setLocation("/login");
    }
  }, [isError, authenticated, setLocation]);

  const isAuthPage = location === "/login" || location === "/register";
  const isLandingPage = location === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  if (!authenticated && !isAuthPage) {
    setLocation("/login");
    return null;
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" dir="rtl">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" dir="rtl">
      {/* Desktop Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Mobile Header with Hamburger Menu */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-sidebar">
          <h2 className="text-xl font-bold text-sidebar-primary">خريطة المالية</h2>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent/50">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 bg-sidebar text-sidebar-foreground border-l-0 w-64">
              <div className="flex flex-col h-full">
                <SidebarContent onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
