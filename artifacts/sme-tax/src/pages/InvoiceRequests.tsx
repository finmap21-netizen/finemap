import { useState } from "react";
import {
  useListInvoiceRequests,
  useCreateInvoiceRequest,
  getListInvoiceRequestsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Loader2 },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

type FormState = {
  firstName: string;
  lastName: string;
  activityDescription: string;
  annualRevenue: string;
  amountDue: string;
  tvaRate: string;
};

export default function InvoiceRequests() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    activityDescription: "",
    annualRevenue: "",
    amountDue: "",
    tvaRate: "19",
  });

  const { data: requests, isLoading } = useListInvoiceRequests();
  const createRequest = useCreateInvoiceRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const setField = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.activityDescription) {
      toast({ title: "تنبيه", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const annualRevenue = parseFloat(form.annualRevenue);
    const amountDue = parseFloat(form.amountDue);
    const tvaRate = parseFloat(form.tvaRate);
    if (isNaN(annualRevenue) || isNaN(amountDue) || isNaN(tvaRate)) {
      toast({ title: "تنبيه", description: "يرجى إدخال أرقام صحيحة في الحقول المالية", variant: "destructive" });
      return;
    }
    await createRequest.mutateAsync(
      { data: { firstName: form.firstName, lastName: form.lastName, activityDescription: form.activityDescription, annualRevenue, amountDue, tvaRate } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListInvoiceRequestsQueryKey() });
          toast({ title: "تم الإرسال", description: "تم إرسال طلبك بنجاح. سيتم مراجعته من قِبل فريقنا خلال 24 ساعة." });
          setForm({ firstName: "", lastName: "", activityDescription: "", annualRevenue: "", amountDue: "", tvaRate: "19" });
          setShowForm(false);
        },
        onError: () => toast({ title: "خطأ", description: "فشل إرسال الطلب. يرجى المحاولة مجدداً.", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <FileText size={28} />
            طلبات حساب الفاتورة الضريبية
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            أرسل طلبك لحساب ضريبتك (TVA / IBS / IRG) وسيتولى فريقنا المتخصص المعالجة وإعلامك بالنتيجة
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus size={16} />
          طلب جديد
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>إنشاء طلب حساب ضريبي جديد</CardTitle>
            <CardDescription>يرجى ملء النموذج التالي بدقة وسيتواصل معك فريقنا خلال 24 ساعة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول *</Label>
                  <Input id="firstName" placeholder="أحمد" value={form.firstName} onChange={setField("firstName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">اللقب *</Label>
                  <Input id="lastName" placeholder="بن عمر" value={form.lastName} onChange={setField("lastName")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityDescription">وصف النشاط التجاري *</Label>
                <Textarea
                  id="activityDescription"
                  placeholder="مثال: نشاط تجاري في مجال الاستيراد والتصدير للمواد الغذائية..."
                  rows={3}
                  value={form.activityDescription}
                  onChange={setField("activityDescription")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">رقم الأعمال السنوي (دج) *</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="مثال: 5000000"
                    value={form.annualRevenue}
                    onChange={setField("annualRevenue")}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amountDue">المبلغ المستحق للحساب (دج) *</Label>
                  <Input
                    id="amountDue"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="مثال: 150000"
                    value={form.amountDue}
                    onChange={setField("amountDue")}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tvaRate">معدل TVA (%) *</Label>
                  <Input
                    id="tvaRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="19"
                    value={form.tvaRate}
                    onChange={setField("tvaRate")}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button type="submit" disabled={createRequest.isPending}>
                  {createRequest.isPending ? <><Loader2 size={16} className="animate-spin ml-2" />جاري الإرسال...</> : "إرسال الطلب"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : requests?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
            <FileText size={48} className="text-muted-foreground/40" />
            <p className="text-lg font-medium">لا توجد طلبات بعد</p>
            <p className="text-sm">انقر على "طلب جديد" لإرسال أول طلب حسابي</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests?.map((req) => {
            const status = STATUS_LABELS[req.status] ?? STATUS_LABELS.pending;
            const Icon = status.icon;
            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-base">{req.firstName} {req.lastName}</span>
                        <span className="text-muted-foreground text-sm">—</span>
                        <span className="font-medium text-primary">{Number(req.amountDue).toLocaleString("fr-DZ")} دج</span>
                        <span className="text-xs text-muted-foreground">TVA {req.tvaRate}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{req.activityDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        رقم الأعمال: <span dir="ltr">{Number(req.annualRevenue).toLocaleString("fr-DZ")}</span> دج
                      </p>
                      {req.adminNotes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-sm border-r-2 border-primary/40">
                          <span className="font-medium">ملاحظات: </span>{req.adminNotes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={`${status.color} border flex items-center gap-1 text-xs`}>
                        <Icon size={12} />
                        {status.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {new Date(req.createdAt).toLocaleDateString("fr-DZ")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
