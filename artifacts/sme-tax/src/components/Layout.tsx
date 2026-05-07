import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { isAuthenticated, removeToken } from "@/lib/auth";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const authenticated = isAuthenticated();

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
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
