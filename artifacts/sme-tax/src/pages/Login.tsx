import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { email, password } }, {
      onSuccess: (res) => {
        setToken(res.token);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "خطأ", description: "البريد الإلكتروني أو كلمة المرور غير صحيحة", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">تسجيل الدخول</CardTitle>
          <CardDescription>مرحباً بك في مساعد مالي</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "جاري الدخول..." : "دخول"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ليس لديك حساب؟ <Link href="/register"><span className="text-primary hover:underline cursor-pointer">سجل الآن</span></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
