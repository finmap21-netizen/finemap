import { useState } from "react";
import { useCalculatePenalty, useListPenalties, getListPenaltiesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PenaltyCalculateBodyRegime } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Penalties() {
  const [declarationType, setDeclarationType] = useState("G50");
  const [regime, setRegime] = useState<PenaltyCalculateBodyRegime>("real");
  const [dueDate, setDueDate] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxAmount, setTaxAmount] = useState("");
  const [hasPaymentRights, setHasPaymentRights] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const calculatePenalty = useCalculatePenalty();
  const { data: history, isLoading: historyLoading } = useListPenalties();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate || !paymentDate || !taxAmount) return;

    calculatePenalty.mutate({
      data: {
        declarationType,
        regime,
        dueDate: new Date(dueDate).toISOString(),
        paymentDate: new Date(paymentDate).toISOString(),
        taxAmount: Number(taxAmount),
        hasPaymentRights
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPenaltiesQueryKey() });
        toast({ title: "تم الحساب", description: "تم حساب الغرامة بنجاح" });
      },
      onError: (err: any) => {
        toast({ title: "خطأ", description: err.message || "تعذر حساب الغرامة", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">حساب الغرامات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>حاسبة الغرامة الضريبية</CardTitle>
            <CardDescription>أدخل تفاصيل التصريح المتأخر لحساب الغرامات الدقيقة</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع التصريح</Label>
                  <Select value={declarationType} onValueChange={setDeclarationType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="G50">G50</SelectItem>
                      <SelectItem value="G12">G12</SelectItem>
                      <SelectItem value="G12BIS">G12 BIS</SelectItem>
                      <SelectItem value="CNAS">CNAS</SelectItem>
                      <SelectItem value="IBS">IBS</SelectItem>
                      <SelectItem value="IRG">IRG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>النظام الضريبي</Label>
                  <Select value={regime} onValueChange={(val: any) => setRegime(val)}>
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
                  <Label>تاريخ الاستحقاق (القانوني)</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الدفع الفعلي</Label>
                  <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>مبلغ الضريبة الأصلي (د.ج)</Label>
                <Input type="number" value={taxAmount} onChange={e => setTaxAmount(e.target.value)} required min="0" />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse pt-2">
                <Checkbox id="rights" checked={hasPaymentRights} onCheckedChange={(val) => setHasPaymentRights(!!val)} />
                <Label htmlFor="rights" className="font-normal cursor-pointer">يتضمن حقوق دفع (Droits de paiement)</Label>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={calculatePenalty.isPending}>
                {calculatePenalty.isPending ? "جاري الحساب..." : "احسب الغرامة"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {calculatePenalty.data && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">النتيجة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border text-center">
                <div className="text-sm text-muted-foreground mb-1">المبلغ الإجمالي المستحق</div>
                <div className="text-4xl font-bold text-primary">{calculatePenalty.data.totalDue.toLocaleString()} د.ج</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <span className="text-muted-foreground block mb-1">مدة التأخير</span>
                  <span className="font-bold">{calculatePenalty.data.delayMonths} أشهر</span>
                </div>
                <div className="bg-white p-3 rounded border">
                  <span className="text-muted-foreground block mb-1">نسبة الغرامة</span>
                  <span className="font-bold">{(calculatePenalty.data.penaltyRate * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">تفصيل الحساب:</h4>
                <div className="space-y-2 text-sm">
                  {calculatePenalty.data.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b pb-2">
                      <span>{item.label}</span>
                      <span className="font-mono">{item.amount.toLocaleString()} د.ج</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-200">
                {calculatePenalty.data.message}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الحسابات السابقة</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? <div>جاري التحميل...</div> : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التصريح</TableHead>
                    <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
                    <TableHead className="text-right">المبلغ الأصلي</TableHead>
                    <TableHead className="text-right">الغرامة</TableHead>
                    <TableHead className="text-right">الإجمالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.declarationType}</TableCell>
                      <TableCell dir="ltr" className="text-right">{new Date(record.dueDate).toLocaleDateString('en-GB')}</TableCell>
                      <TableCell>{record.taxAmount.toLocaleString()} د.ج</TableCell>
                      <TableCell className="text-destructive">+{record.penaltyAmount.toLocaleString()} د.ج</TableCell>
                      <TableCell className="font-bold">{record.totalDue.toLocaleString()} د.ج</TableCell>
                    </TableRow>
                  ))}
                  {!history?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                        لا يوجد سجل حسابات سابق
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
