import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, UploadCloud, Loader2, Trash2, Calculator, Receipt } from "lucide-react";

type ParsedInvoice = {
  id: string;
  fournisseur: string;
  date: string;
  ht: number;
  tva: number;
  ttc: number;
  status: "loading" | "success" | "error";
  fileName: string;
};

export default function InvoiceRequests() {
  const [invoices, setInvoices] = useState<ParsedInvoice[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newInvoices = Array.from(files).map((file) => {
      const id = Math.random().toString(36).substring(7);
      return {
        id,
        fournisseur: "جاري التحليل...",
        date: "-",
        ht: 0,
        tva: 0,
        ttc: 0,
        status: "loading" as const,
        fileName: file.name,
      };
    });

    setInvoices((prev) => [...prev, ...newInvoices]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const response = await fetch("/api/invoices/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              fileBase64: base64,
              mimeType: file.type,
            }),
          });

          if (!response.ok) throw new Error("Failed to analyze");
          const data = await response.json();

          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === newInvoices[i].id
                ? {
                    ...inv,
                    fournisseur: data.fournisseur || "غير محدد",
                    date: data.date || "-",
                    ht: Number(data.ht) || 0,
                    tva: Number(data.tva) || 0,
                    ttc: Number(data.ttc) || 0,
                    status: "success",
                  }
                : inv
            )
          );
        } catch (error) {
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === newInvoices[i].id
                ? { ...inv, fournisseur: "فشل التحليل", status: "error" }
                : inv
            )
          );
          toast({
            title: "خطأ",
            description: `فشل تحليل الفاتورة: ${file.name}`,
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const totalHT = invoices.reduce((acc, curr) => acc + curr.ht, 0);
  const totalTVA = invoices.reduce((acc, curr) => acc + curr.tva, 0);
  const totalTTC = invoices.reduce((acc, curr) => acc + curr.ttc, 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Receipt size={28} />
            محطة الفواتير الذكية (Invoice Hub)
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            قم بتصوير فواتيرك وارفعها هنا. سيقوم الذكاء الاصطناعي باستخراج القيم وتجهيز حصيلة الـ G50 أوتوماتيكياً!
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
          <Plus size={16} />
          إضافة فاتورة
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">المجموع الصافي (Total HT)</p>
                <h3 className="text-3xl font-bold text-blue-900" dir="ltr">{totalHT.toLocaleString("fr-DZ")} <span className="text-sm font-normal">دج</span></h3>
              </div>
              <div className="p-3 bg-blue-200 rounded-full text-blue-700">
                <Calculator size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">مجموع الضريبة (Total TVA)</p>
                <h3 className="text-3xl font-bold text-amber-900" dir="ltr">{totalTVA.toLocaleString("fr-DZ")} <span className="text-sm font-normal">دج</span></h3>
              </div>
              <div className="p-3 bg-amber-200 rounded-full text-amber-700">
                <FileText size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">المبلغ الإجمالي (Total TTC)</p>
                <h3 className="text-3xl font-bold text-green-900" dir="ltr">{totalTTC.toLocaleString("fr-DZ")} <span className="text-sm font-normal">دج</span></h3>
              </div>
              <div className="p-3 bg-green-200 rounded-full text-green-700">
                <Receipt size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragging ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:bg-muted/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <div className="p-4 bg-primary/10 rounded-full text-primary">
          <UploadCloud size={40} />
        </div>
        <div>
          <h3 className="text-lg font-bold">اسحب وأفلت الفواتير هنا</h3>
          <p className="text-muted-foreground text-sm mt-1">
            أو اضغط لاختيار الصور وملفات PDF من جهازك
          </p>
        </div>
      </div>

      {/* Invoices List */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>قائمة الفواتير المرفوعة</CardTitle>
            <CardDescription>هذه البيانات تم استخراجها أوتوماتيكياً، يمكنك مراجعتها لتعبئة الـ G50.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-3 font-semibold">الملف</th>
                    <th className="p-3 font-semibold">المورد / الزبون</th>
                    <th className="p-3 font-semibold">التاريخ</th>
                    <th className="p-3 font-semibold">HT (دج)</th>
                    <th className="p-3 font-semibold">TVA (دج)</th>
                    <th className="p-3 font-semibold">TTC (دج)</th>
                    <th className="p-3 font-semibold">الحالة</th>
                    <th className="p-3 font-semibold text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-3 max-w-[150px] truncate" title={inv.fileName}>
                        {inv.fileName}
                      </td>
                      <td className="p-3 font-medium">{inv.fournisseur}</td>
                      <td className="p-3 text-muted-foreground" dir="ltr">{inv.date}</td>
                      <td className="p-3 font-medium" dir="ltr">{inv.ht.toLocaleString("fr-DZ")}</td>
                      <td className="p-3 font-medium text-amber-600" dir="ltr">{inv.tva.toLocaleString("fr-DZ")}</td>
                      <td className="p-3 font-bold text-green-600" dir="ltr">{inv.ttc.toLocaleString("fr-DZ")}</td>
                      <td className="p-3">
                        {inv.status === "loading" ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 animate-pulse">
                            <Loader2 size={12} className="ml-1 animate-spin" /> جاري التحليل
                          </Badge>
                        ) : inv.status === "success" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مكتمل</Badge>
                        ) : (
                          <Badge variant="destructive">خطأ</Badge>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeInvoice(inv.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
