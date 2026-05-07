import { useState } from "react";
import { useRegister, useUpdateCompany } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [companyName, setCompanyName] = useState("");
  const [activityType, setActivityType] = useState<"commerce"|"services"|"production"|"auto_entrepreneur">("commerce");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [taxRegime, setTaxRegime] = useState<"real"|"simplified_real"|"forfaitaire">("real");
  const [hasCnas, setHasCnas] = useState(false);

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const register = useRegister();
  const updateCompany = useUpdateCompany();

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ data: { name, email, password } }, {
      onSuccess: (res) => {
        setToken(res.token);
        
        updateCompany.mutate({
          data: {
            companyName,
            activityType,
            annualRevenue: annualRevenue ? Number(annualRevenue) : null,
            employeeCount: employeeCount ? Number(employeeCount) : null,
            taxRegime,
            hasCnas
          }
        }, {
          onSuccess: () => {
            setLocation("/dashboard");
          },
          onError: () => {
            toast({ title: "تنبيه", description: "تم التسجيل ولكن حدث خطأ في حفظ بيانات الشركة. يرجى تحديثها من الملف الشخصي.", variant: "destructive" });
            setLocation("/dashboard");
          }
        });
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشل التسجيل. ربما البريد الإلكتروني مستخدم بالفعل.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50" dir="rtl">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">إنشاء حساب جديد</CardTitle>
          <CardDescription>
            {step === 1 ? "المعلومات الأساسية" : "معلومات الشركة"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full">متابعة</Button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">اسم الشركة</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع النشاط</Label>
                  <Select value={activityType} onValueChange={(val: any) => setActivityType(val)}>
                    <SelectTrigger><SelectValue placeholder="اختر النشاط" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commerce">تجارة</SelectItem>
                      <SelectItem value="services">خدمات</SelectItem>
                      <SelectItem value="production">إنتاج</SelectItem>
                      <SelectItem value="auto_entrepreneur">مقاول ذاتي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>النظام الضريبي</Label>
                  <Select value={taxRegime} onValueChange={(val: any) => setTaxRegime(val)}>
                    <SelectTrigger><SelectValue placeholder="اختر النظام" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">النظام الحقيقي</SelectItem>
                      <SelectItem value="simplified_real">النظام الحقيقي المبسط</SelectItem>
                      <SelectItem value="forfaitaire">النظام الجزافي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">الإيراد السنوي (د.ج)</Label>
                  <Input id="revenue" type="number" value={annualRevenue} onChange={(e) => setAnnualRevenue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employees">عدد العمال</Label>
                  <Input id="employees" type="number" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse mt-2">
                <Checkbox id="cnas" checked={hasCnas} onCheckedChange={(val) => setHasCnas(!!val)} />
                <Label htmlFor="cnas" className="font-normal cursor-pointer">تصريح CNAS (ضمان اجتماعي)؟</Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>رجوع</Button>
                <Button type="submit" className="w-full" disabled={register.isPending || updateCompany.isPending}>
                  {(register.isPending || updateCompany.isPending) ? "جاري التسجيل..." : "إنهاء التسجيل"}
                </Button>
              </div>
            </form>
          )}
          
          <div className="mt-4 text-center text-sm">
            لديك حساب بالفعل؟ <Link href="/login"><span className="text-primary hover:underline cursor-pointer">تسجيل الدخول</span></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
