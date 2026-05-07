import { useGetMe, useGetCompany, useUpdateCompany } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { UserCircle, Building2 } from "lucide-react";
import { UpdateCompanyBodyActivityType, UpdateCompanyBodyTaxRegime } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Profile() {
  const { data: user } = useGetMe();
  const { data: company, isLoading } = useGetCompany();
  const updateCompany = useUpdateCompany();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [activityType, setActivityType] = useState<UpdateCompanyBodyActivityType>("commerce");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [taxRegime, setTaxRegime] = useState<UpdateCompanyBodyTaxRegime>("real");
  const [hasCnas, setHasCnas] = useState(false);

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName);
      setActivityType(company.activityType as any);
      setAnnualRevenue(company.annualRevenue?.toString() || "");
      setEmployeeCount(company.employeeCount?.toString() || "");
      setTaxRegime(company.taxRegime as any);
      setHasCnas(company.hasCnas);
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        toast({ title: "نجاح", description: "تم تحديث بيانات الشركة بنجاح" });
      },
      onError: () => {
        toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
      }
    });
  };

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-primary">الملف الشخصي</h1>

      <Card>
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-primary" />
            بيانات الحساب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">الاسم</Label>
              <div className="font-medium text-lg mt-1">{user?.name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">البريد الإلكتروني</Label>
              <div className="font-medium text-lg mt-1">{user?.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-4 mb-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            بيانات الشركة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع النشاط</Label>
                <Select value={activityType} onValueChange={(val: any) => setActivityType(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label htmlFor="revenue">الإيراد السنوي التقديري (د.ج)</Label>
                <Input id="revenue" type="number" value={annualRevenue} onChange={(e) => setAnnualRevenue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees">عدد العمال</Label>
                <Input id="employees" type="number" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse pt-2 pb-4">
              <Checkbox id="cnas" checked={hasCnas} onCheckedChange={(val) => setHasCnas(!!val)} />
              <Label htmlFor="cnas" className="font-normal cursor-pointer">مسجل في ضمان العمال (CNAS)</Label>
            </div>

            <Button type="submit" disabled={updateCompany.isPending}>
              {updateCompany.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
