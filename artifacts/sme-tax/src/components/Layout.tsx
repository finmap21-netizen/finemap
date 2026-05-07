import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useGetMe } from "@workspace/api-client-react";
import { isAuthenticated } from "@/lib/auth";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useGetMe({ query: { enabled: isAuthenticated() } });
  const [location, setLocation] = useLocation();

  if (!isAuthenticated() && location !== "/login" && location !== "/register") {
    setLocation("/login");
    return null;
  }

  if (isLoading && isAuthenticated()) {
    return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>;
  }

  const isAuthPage = location === "/login" || location === "/register";

  if (isAuthPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
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
