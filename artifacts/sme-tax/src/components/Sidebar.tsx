import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { removeToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Calendar, Calculator, Bell, BookOpen, Newspaper, Settings, UserCircle, LogOut, FileText, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const logout = useLogout();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        removeToken();
        window.location.href = `${import.meta.env.BASE_URL}login`;
      }
    });
  };

  const navItems = user?.role === "admin" 
    ? [
        { href: "/admin", label: "لوحة الإدارة", icon: LayoutDashboard },
        { href: "/profile", label: "الملف الشخصي", icon: UserCircle },
      ]
    : [
        { href: "/dashboard", label: "لوحة القيادة", icon: LayoutDashboard },
        { href: "/calendar", label: "التقويم الضريبي", icon: Calendar },
        { href: "/penalties", label: "حساب الغرامات", icon: Calculator },
        { href: "/reminders", label: "التذكيرات", icon: Bell },
        { href: "/invoice-requests", label: "محطة الفواتير الذكية", icon: FileText },
        { href: "/invoice-generator", label: "صانع الفواتير", icon: FileText },
        { href: "/knowledge", label: "قاعدة المعرفة", icon: BookOpen },
        { href: "/laws-library", label: "مكتبة القوانين", icon: BookOpen },
        { href: "/news", label: "الأخبار", icon: Newspaper },
        { href: "/contact-admin", label: "تواصل مع الإدارة", icon: MessageSquare },
        { href: "/profile", label: "الملف الشخصي", icon: UserCircle },
      ];

  return (
    <>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-sidebar-primary">خريطة المالية</h2>
      </div>
      <nav className="flex-1 space-y-2 px-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => onNavigate?.()}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"}`}>
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border mt-auto flex flex-col gap-2">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-medium">{t('language')}</span>
          <LanguageSwitcher />
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/20" onClick={handleLogout}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border shrink-0">
      <SidebarContent />
    </div>
  );
}
