import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { removeToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Calculator, Bell, BookOpen, Newspaper, Settings, UserCircle, LogOut } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        removeToken();
        window.location.href = `${import.meta.env.BASE_URL}login`;
      }
    });
  };

  const navItems = [
    { href: "/dashboard", label: "لوحة القيادة", icon: LayoutDashboard },
    { href: "/calendar", label: "التقويم الضريبي", icon: Calendar },
    { href: "/penalties", label: "حساب الغرامات", icon: Calculator },
    { href: "/reminders", label: "التذكيرات", icon: Bell },
    { href: "/knowledge", label: "قاعدة المعرفة", icon: BookOpen },
    { href: "/news", label: "الأخبار", icon: Newspaper },
    { href: "/profile", label: "الملف الشخصي", icon: UserCircle },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/admin", label: "لوحة الإدارة", icon: Settings });
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-sidebar-primary">مساعد الضرائب</h2>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"}`}>
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/20" onClick={handleLogout}>
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </div>
  );
}
