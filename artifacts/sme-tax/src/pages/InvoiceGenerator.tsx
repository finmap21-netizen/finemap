import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Printer, FileEdit } from "lucide-react";

export default function InvoiceGenerator() {
  const [clientInfo, setClientInfo] = useState({
    name: "مؤسسة الأفق للتجارة",
    address: "حي الياسمين، عمارة ب، وهران",
    nif: "001234567890123",
  });

  const [invoiceMeta, setInvoiceMeta] = useState({
    number: "#2026-001",
    date: new Date().toLocaleDateString("ar-DZ", { year: 'numeric', month: 'long', day: 'numeric' }),
    paymentMethod: "تحويل بنكي (NANO Banana)",
    rib: "00000000000000000000",
  });

  const [items, setItems] = useState([
    { id: 1, description: "تصميم الهوية البصرية وإعداد خريطة الطريق الاستثمارية", qty: 1, price: 45000 },
    { id: 2, description: "خدمات استشارية مالية وتخطيط الميزانية لشهر ماي", qty: 1, price: 25000 },
  ]);

  const [tvaRate, setTvaRate] = useState(19);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const totalHT = items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalTVA = (totalHT * tvaRate) / 100;
  const totalTTC = totalHT + totalTVA;

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <title>فاتورة ${invoiceMeta.number}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
              
              body {
                  font-family: 'Tajawal', sans-serif;
                  margin: 0;
                  padding: 40px;
                  color: #333;
                  background-color: #fff;
              }
              .invoice-box {
                  max-width: 850px;
                  margin: auto;
                  padding: 30px;
                  border: 1px solid #ddd;
                  background: #fff;
                  border-radius: 8px;
                  position: relative;
              }
              .invoice-box::before {
                  content: "";
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 8px;
                  background: linear-gradient(90deg, #0d3b66, #0056b3);
                  border-top-left-radius: 8px;
                  border-top-right-radius: 8px;
              }
              .header-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
              }
              .header-table td {
                  vertical-align: top;
              }
              .logo-area {
                  text-align: right;
              }
              .logo-text {
                  font-size: 28px;
                  font-weight: 700;
                  color: #0d3b66;
                  margin: 0;
              }
              .logo-sub {
                  font-size: 14px;
                  color: #777;
                  margin-top: 5px;
              }
              .invoice-title {
                  text-align: left;
                  font-size: 24px;
                  color: #0d3b66;
                  font-weight: 700;
              }
              .details-table {
                  width: 100%;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #0d3b66;
                  padding-bottom: 15px;
              }
              .details-table td {
                  padding: 5px 0;
                  font-size: 14px;
              }
              .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
              }
              .items-table th {
                  background-color: #0d3b66;
                  color: #fff;
                  text-align: right;
                  padding: 12px;
                  font-size: 15px;
              }
              .items-table td {
                  padding: 12px;
                  border-bottom: 1px solid #eee;
                  font-size: 14px;
              }
              .items-table tr:nth-child(even) {
                  background-color: #f8f9fa;
              }
              .totals-table {
                  width: 40%;
                  float: left;
                  border-collapse: collapse;
                  margin-bottom: 40px;
              }
              .totals-table td {
                  padding: 8px;
                  font-size: 14px;
              }
              .totals-table tr.grand-total {
                  background-color: #0d3b66;
                  color: #fff;
                  font-weight: bold;
              }
              .footer-area {
                  clear: both;
                  margin-top: 50px;
                  border-top: 1px solid #eee;
                  padding-top: 20px;
                  font-size: 13px;
                  color: #666;
              }
              .signature-box {
                  float: left;
                  width: 200px;
                  text-align: center;
                  border: 1px dashed #ccc;
                  padding: 15px;
                  border-radius: 5px;
                  margin-top: -20px;
              }
              @media print {
                  body { padding: 0; background-color: #fff; }
                  .invoice-box { border: none; box-shadow: none; max-width: 100%; }
              }
          </style>
      </head>
      <body>
          ${invoiceRef.current.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <FileEdit size={28} />
            صانع الفواتير الاحترافي
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            قم بملء معلومات العميل والخدمات، وسيقوم النظام بتوليد فاتورة رسمية بصيغة PDF قابلة للطباعة.
          </p>
        </div>
        <Button onClick={handlePrint} className="flex items-center gap-2" size="lg">
          <Printer size={18} />
          طباعة / تحميل PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* نموذج الإدخال (Form) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">معلومات العميل والفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الفاتورة</Label>
                  <Input value={invoiceMeta.number} onChange={(e) => setInvoiceMeta({...invoiceMeta, number: e.target.value})} dir="ltr" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input value={invoiceMeta.date} onChange={(e) => setInvoiceMeta({...invoiceMeta, date: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>اسم العميل / المؤسسة</Label>
                <Input value={clientInfo.name} onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input value={clientInfo.address} onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرقم الضريبي (NIF)</Label>
                  <Input value={clientInfo.nif} onChange={(e) => setClientInfo({...clientInfo, nif: e.target.value})} dir="ltr" className="text-right" />
                </div>
                <div className="space-y-2">
                  <Label>نسبة الـ TVA (%)</Label>
                  <Input type="number" value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} dir="ltr" className="text-right" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع (Bank)</Label>
                <Input value={invoiceMeta.paymentMethod} onChange={(e) => setInvoiceMeta({...invoiceMeta, paymentMethod: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>الحساب الجاري (RIB)</Label>
                <Input value={invoiceMeta.rib} onChange={(e) => setInvoiceMeta({...invoiceMeta, rib: e.target.value})} dir="ltr" className="text-right" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">الخدمات والمنتجات</CardTitle>
              <Button variant="outline" size="sm" onClick={addItem} className="h-8"><Plus size={14} className="mr-1"/> إضافة</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-2 p-3 border border-border rounded-lg bg-muted/20 relative group">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="absolute top-1 left-1 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </Button>
                  <div className="space-y-1">
                    <Label className="text-xs">الوصف (الرقم: 0{index + 1})</Label>
                    <Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">الكمية</Label>
                      <Input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">سعر الوحدة (دج)</Label>
                      <Input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* المعاينة (Preview) */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div className="bg-muted p-2 rounded-t-xl border border-b-0 border-border text-center text-sm font-medium text-muted-foreground">
              معاينة الفاتورة (Live Preview)
            </div>
            <div className="border border-border rounded-b-xl overflow-hidden shadow-lg bg-white p-4 max-h-[800px] overflow-y-auto">
              {/* This div matches the user's provided HTML structure perfectly */}
              <div ref={invoiceRef}>
                <div className="invoice-box" style={{ maxWidth: '850px', margin: 'auto', padding: '30px', border: '1px solid #ddd', background: '#fff', borderRadius: '8px', position: 'relative', fontFamily: "'Tajawal', sans-serif", color: '#333' }}>
                    
                    {/* Fake pseudo-element using a div since pseudo-elements aren't inlineable easily */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(90deg, #0d3b66, #0056b3)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}></div>

                    <table className="header-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', marginTop: '10px' }}>
                        <tbody>
                        <tr>
                            <td className="logo-area" style={{ verticalAlign: 'top', textAlign: 'right' }}>
                                <div className="logo-text" style={{ fontSize: '28px', fontWeight: 700, color: '#0d3b66', margin: 0 }}>Fin<span style={{ color: '#8a9ba8' }}>Map</span></div>
                                <div className="logo-sub" style={{ fontSize: '14px', color: '#777', marginTop: '5px' }}>للخدمات المالية والاستشارات</div>
                                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, marginTop: '10px' }}>
                                    شارع الجمهورية، الجزائر العاصمة<br/>
                                    الهاتف: 021 00 00 00 | البريد: contact@finmap.com<br/>
                                    NIF: 000000000000000
                                </p>
                            </td>
                            <td className="invoice-title" style={{ verticalAlign: 'top', textAlign: 'left', fontSize: '24px', color: '#0d3b66', fontWeight: 700 }}>
                                فاتورة رسمية
                                <p style={{ fontSize: '14px', color: '#555', fontWeight: 'normal', marginTop: '10px', textAlign: 'left' }}>
                                    رقم الفاتورة: <strong dir="ltr">{invoiceMeta.number}</strong><br/>
                                    التاريخ: {invoiceMeta.date}
                                </p>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <table className="details-table" style={{ width: '100%', marginBottom: '30px', borderBottom: '2px solid #0d3b66', paddingBottom: '15px' }}>
                        <tbody>
                        <tr>
                            <td style={{ width: '50%', padding: '5px 0', fontSize: '14px', verticalAlign: 'top' }}>
                                <strong>موجهة إلى السيد / المؤسسة:</strong> {clientInfo.name}<br/>
                                <strong>العنوان:</strong> {clientInfo.address}<br/>
                                <strong>الرقم الضريبي:</strong> <span dir="ltr">{clientInfo.nif}</span>
                            </td>
                            <td style={{ textAlign: 'left', verticalAlign: 'bottom', padding: '5px 0', fontSize: '14px' }}>
                                <strong>طريقة الدفع:</strong> {invoiceMeta.paymentMethod}<br/>
                                <strong>حساب جاري (RIB):</strong> <span dir="ltr">{invoiceMeta.rib}</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '10%', backgroundColor: '#0d3b66', color: '#fff', textAlign: 'right', padding: '12px', fontSize: '15px' }}>الرقم</th>
                                <th style={{ width: '50%', backgroundColor: '#0d3b66', color: '#fff', textAlign: 'right', padding: '12px', fontSize: '15px' }}>الوصف / البيان</th>
                                <th style={{ width: '10%', backgroundColor: '#0d3b66', color: '#fff', textAlign: 'center', padding: '12px', fontSize: '15px' }}>الكمية</th>
                                <th style={{ width: '15%', backgroundColor: '#0d3b66', color: '#fff', textAlign: 'center', padding: '12px', fontSize: '15px' }}>سعر الوحدة</th>
                                <th style={{ width: '15%', backgroundColor: '#0d3b66', color: '#fff', textAlign: 'center', padding: '12px', fontSize: '15px' }}>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => (
                                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' }}>0{i + 1}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px' }}>{item.description}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', textAlign: 'center' }}>{item.qty}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', textAlign: 'center' }} dir="ltr">{item.price.toLocaleString('fr-DZ')} دج</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #eee', fontSize: '14px', textAlign: 'center' }} dir="ltr">{(item.qty * item.price).toLocaleString('fr-DZ')} دج</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ width: '100%', display: 'table', content: '""', clear: 'both' }}>
                        <div className="signature-box" style={{ float: 'left', width: '200px', textAlign: 'center', border: '1px dashed #ccc', padding: '15px', borderRadius: '5px', marginTop: '-20px' }}>
                            <span style={{ fontSize: '12px', color: '#777' }}>توقيع وختم مؤسسة FinMap</span>
                            <div style={{ height: '50px' }}></div>
                        </div>

                        <table className="totals-table" style={{ width: '45%', float: 'right', borderCollapse: 'collapse', marginBottom: '40px' }}>
                            <tbody>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '14px' }}><strong>المجموع الخام (HT):</strong></td>
                                <td style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }} dir="ltr">{totalHT.toLocaleString('fr-DZ')} دج</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px', fontSize: '14px' }}><strong>الضريبة (TVA {tvaRate}%):</strong></td>
                                <td style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }} dir="ltr">{totalTVA.toLocaleString('fr-DZ')} دج</td>
                            </tr>
                            <tr className="grand-total" style={{ backgroundColor: '#0d3b66', color: '#fff', fontWeight: 'bold' }}>
                                <td style={{ padding: '8px', fontSize: '14px' }}><strong>المجموع الكلي (TTC):</strong></td>
                                <td style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }} dir="ltr">{totalTTC.toLocaleString('fr-DZ')} دج</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="footer-area" style={{ clear: 'both', marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', fontSize: '13px', color: '#666' }}>
                        <strong>الشروط والأحكام:</strong>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                            * يرجى تسوية الفاتورة في أجل أقصاه 15 يوماً من تاريخ الإصدار.<br/>
                            * جميع المبالغ تدفع بالعملة المحلية (الدينار الجزائري). شكراً لثقتكم بخدمات FinMap!
                        </p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
