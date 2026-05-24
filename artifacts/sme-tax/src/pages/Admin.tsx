import { useState } from "react";
import {
  useGetMe,
  useGetAdminStats,
  useListAdminUsers,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useListRules,
  useListNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
  useListKnowledgeItems,
  useCreateKnowledgeItem,
  useUpdateKnowledgeItem,
  useDeleteKnowledgeItem,
  useListAdminInvoiceRequests,
  useProcessInvoiceRequest,
  getListAdminUsersQueryKey,
  getListNewsQueryKey,
  getListKnowledgeItemsQueryKey,
  getListAdminInvoiceRequestsQueryKey,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Trash2, Pencil, Plus, Loader2, Clock, CheckCircle, XCircle } from "lucide-react";

export default function Admin() {
  const { data: user } = useGetMe({ query: { enabled: true, queryKey: useGetMe.name as any } });
  const [, setLocation] = useLocation();

  if (user && user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold text-primary">لوحة الإدارة</h1>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="w-full justify-start mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="news">الأخبار</TabsTrigger>
          <TabsTrigger value="knowledge">المعرفة</TabsTrigger>
          <TabsTrigger value="invoices">طلبات الفواتير</TabsTrigger>
          <TabsTrigger value="messages">الرسائل</TabsTrigger>
          <TabsTrigger value="rules">القواعد الضريبية</TabsTrigger>
        </TabsList>

        <TabsContent value="stats"><StatsTab /></TabsContent>
        <TabsContent value="users"><UsersTab currentUserId={user?.id} /></TabsContent>
        <TabsContent value="news"><NewsTab /></TabsContent>
        <TabsContent value="knowledge"><KnowledgeTab /></TabsContent>
        <TabsContent value="invoices"><InvoiceRequestsTab /></TabsContent>
        <TabsContent value="messages"><MessagesTab /></TabsContent>
        <TabsContent value="rules"><RulesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StatsTab() {
  const { data: stats, isLoading } = useGetAdminStats();
  if (isLoading) return <div className="text-muted-foreground py-8 text-center">جاري التحميل...</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">إجمالي المستخدمين</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.totalUsers}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">المستخدمين النشطين</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{stats?.activeUsers}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">القواعد الضريبية</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.totalRules}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">المقالات المعرفية</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats?.totalKnowledgeItems}</div></CardContent></Card>
      <Card className="md:col-span-2 mt-4">
        <CardHeader><CardTitle>توزيع الأنظمة الضريبية</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.usersByRegime.map((r, i) => (
              <div key={i} className="flex justify-between items-center bg-muted/30 p-2 rounded">
                <span>{r.regime === "real" ? "النظام الحقيقي" : r.regime === "simplified_real" ? "النظام الحقيقي المبسط" : r.regime === "forfaitaire" ? "النظام الجزافي" : r.regime || "غير محدد"}</span>
                <span className="font-bold">{r.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab({ currentUserId }: { currentUserId?: number }) {
  const { data: users, isLoading } = useListAdminUsers();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRoleChange = (id: number, role: "user" | "admin") => {
    updateUser.mutate({ id, data: { role } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }); toast({ title: "تم التحديث", description: "تم تحديث دور المستخدم بنجاح" }); }
    });
  };
  const handleStatusChange = (id: number, isActive: boolean) => {
    updateUser.mutate({ id, data: { isActive } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }); toast({ title: "تم التحديث", description: isActive ? "تم تفعيل الحساب" : "تم تعطيل الحساب" }); }
    });
  };
  const handleDelete = (id: number, name: string) => {
    deleteUser.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() }); toast({ title: "تم الحذف", description: `تم حذف حساب ${name} نهائياً` }); },
      onError: (err: any) => { toast({ title: "خطأ", description: err?.data?.error || "تعذّر حذف المستخدم", variant: "destructive" }); }
    });
  };

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">جاري التحميل...</div>;
  return (
    <Card>
      <CardHeader><CardTitle>إدارة المستخدمين ({users?.length || 0})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">نشط</TableHead>
              <TableHead className="text-right">حذف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(val: "user" | "admin") => handleRoleChange(u.id, val)} disabled={u.id === currentUserId}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch checked={u.isActive} onCheckedChange={(val) => handleStatusChange(u.id, val)} disabled={u.id === currentUserId} />
                </TableCell>
                <TableCell>
                  {u.id !== currentUserId ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 size={16} /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>هل أنت متأكد من حذف حساب <strong>{u.name}</strong>؟ هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(u.id, u.name)}>حذف نهائي</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : <span className="text-xs text-muted-foreground">أنت</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function NewsTab() {
  const { data: news, isLoading } = useListNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<{ id?: number; titleAr: string; contentAr: string; category: string } | null>(null);

  const emptyForm = { titleAr: "", contentAr: "", category: "general" };

  const handleSave = async () => {
    if (!editItem?.titleAr || !editItem?.contentAr) {
      toast({ title: "تنبيه", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const data = { titleAr: editItem.titleAr, contentAr: editItem.contentAr, category: editItem.category };
    if (editItem.id) {
      await updateNews.mutateAsync({ id: editItem.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() }); toast({ title: "تم التحديث" }); setEditItem(null); }
      });
    } else {
      await createNews.mutateAsync({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() }); toast({ title: "تمت الإضافة" }); setEditItem(null); }
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteNews.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() }); toast({ title: "تم الحذف" }); }
    });
  };

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">جاري التحميل...</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة الأخبار ({news?.length || 0})</CardTitle>
          <Button size="sm" onClick={() => setEditItem({ ...emptyForm })} className="gap-1"><Plus size={14} />إضافة خبر</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-xs truncate">{item.titleAr}</TableCell>
                  <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground" dir="ltr">{new Date(item.publishedAt).toLocaleDateString("fr-DZ")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditItem({ id: item.id, titleAr: item.titleAr, contentAr: item.contentAr, category: item.category })}><Pencil size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 size={14} /></Button></AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader><AlertDialogTitle>حذف الخبر</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا الخبر؟</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleDelete(item.id)}>حذف</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem?.id ? "تعديل خبر" : "إضافة خبر جديد"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان *</Label>
                <Input value={editItem.titleAr} onChange={e => setEditItem(x => x && { ...x, titleAr: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select value={editItem.category} onValueChange={v => setEditItem(x => x && { ...x, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">عام</SelectItem>
                    <SelectItem value="tax">ضريبي</SelectItem>
                    <SelectItem value="regulation">تشريعي</SelectItem>
                    <SelectItem value="deadline">مواعيد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المحتوى *</Label>
                <Textarea rows={5} value={editItem.contentAr} onChange={e => setEditItem(x => x && { ...x, contentAr: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleSave} disabled={createNews.isPending || updateNews.isPending}>
              {(createNews.isPending || updateNews.isPending) ? <Loader2 size={14} className="animate-spin ml-2" /> : null}
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setEditItem(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function KnowledgeTab() {
  const { data: items, isLoading } = useListKnowledgeItems();
  const createItem = useCreateKnowledgeItem();
  const updateItem = useUpdateKnowledgeItem();
  const deleteItem = useDeleteKnowledgeItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editItem, setEditItem] = useState<{ id?: number; questionAr: string; question: string; answerAr: string; answer: string; category: string; regime: string } | null>(null);

  const emptyForm = { questionAr: "", question: "", answerAr: "", answer: "", category: "general", regime: "all" };

  const handleSave = async () => {
    if (!editItem?.questionAr || !editItem?.answerAr) {
      toast({ title: "تنبيه", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    const data = {
      question: editItem.question || editItem.questionAr,
      questionAr: editItem.questionAr,
      answer: editItem.answer || editItem.answerAr,
      answerAr: editItem.answerAr,
      category: editItem.category,
      regime: editItem.regime || null,
    };
    if (editItem.id) {
      await updateItem.mutateAsync({ id: editItem.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListKnowledgeItemsQueryKey() }); toast({ title: "تم التحديث" }); setEditItem(null); }
      });
    } else {
      await createItem.mutateAsync({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListKnowledgeItemsQueryKey() }); toast({ title: "تمت الإضافة" }); setEditItem(null); }
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteItem.mutate({ id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListKnowledgeItemsQueryKey() }); toast({ title: "تم الحذف" }); }
    });
  };

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">جاري التحميل...</div>;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة قاعدة المعرفة ({items?.length || 0})</CardTitle>
          <Button size="sm" onClick={() => setEditItem({ ...emptyForm })} className="gap-1"><Plus size={14} />إضافة سؤال</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">السؤال</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">النظام</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-xs truncate">{item.questionAr}</TableCell>
                  <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.regime === "all" ? "الكل" : item.regime === "real" ? "حقيقي" : item.regime === "simplified_real" ? "مبسط" : item.regime}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditItem({ id: item.id, question: item.question, questionAr: item.questionAr, answer: item.answer, answerAr: item.answerAr, category: item.category, regime: item.regime ?? "all" })}><Pencil size={14} /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 size={14} /></Button></AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader><AlertDialogTitle>حذف السؤال</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا السؤال؟</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse gap-2"><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => handleDelete(item.id)}>حذف</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem?.id ? "تعديل سؤال" : "إضافة سؤال جديد"}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>السؤال *</Label>
                <Input value={editItem.questionAr} onChange={e => setEditItem(x => x && { ...x, questionAr: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={editItem.category} onValueChange={v => setEditItem(x => x && { ...x, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">عام</SelectItem>
                      <SelectItem value="tva">TVA</SelectItem>
                      <SelectItem value="ibs">IBS</SelectItem>
                      <SelectItem value="irg">IRG</SelectItem>
                      <SelectItem value="cnas">CNAS</SelectItem>
                      <SelectItem value="g50">G50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>النظام الجبائي</Label>
                  <Select value={editItem.regime} onValueChange={v => setEditItem(x => x && { ...x, regime: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="real">النظام الحقيقي</SelectItem>
                      <SelectItem value="simplified_real">النظام الحقيقي المبسط</SelectItem>
                      <SelectItem value="forfaitaire">النظام الجزافي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الإجابة *</Label>
                <Textarea rows={5} value={editItem.answerAr} onChange={e => setEditItem(x => x && { ...x, answerAr: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleSave} disabled={createItem.isPending || updateItem.isPending}>
              {(createItem.isPending || updateItem.isPending) ? <Loader2 size={14} className="animate-spin ml-2" /> : null}
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setEditItem(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-800" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
};

function InvoiceRequestsTab() {
  const { data: requests, isLoading } = useListAdminInvoiceRequests();
  const processRequest = useProcessInvoiceRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editReq, setEditReq] = useState<{ id: number; status: string; adminNotes: string } | null>(null);

  const handleProcess = async () => {
    if (!editReq) return;
    await processRequest.mutateAsync(
      { id: editReq.id, data: { status: editReq.status as any, adminNotes: editReq.adminNotes || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminInvoiceRequestsQueryKey() });
          toast({ title: "تم التحديث" });
          setEditReq(null);
        },
        onError: () => toast({ title: "خطأ", variant: "destructive" }),
      }
    );
  };

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">جاري التحميل...</div>;

  return (
    <>
      <Card>
        <CardHeader><CardTitle>طلبات الفواتير ({requests?.length || 0})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">المبلغ / TVA</TableHead>
                <TableHead className="text-right">النشاط</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map(req => {
                const st = STATUS_LABELS[req.status] ?? STATUS_LABELS.pending;
                return (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.firstName} {req.lastName}</TableCell>
                    <TableCell>{Number(req.amountDue).toLocaleString("fr-DZ")} دج / {req.tvaRate}%</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{req.activityDescription}</TableCell>
                    <TableCell><Badge className={`${st.color} text-xs`}>{st.label}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground" dir="ltr">{new Date(req.createdAt).toLocaleDateString("fr-DZ")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setEditReq({ id: req.id, status: req.status, adminNotes: req.adminNotes ?? "" })}>
                        <Pencil size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editReq} onOpenChange={(v) => !v && setEditReq(null)}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader><DialogTitle>معالجة الطلب</DialogTitle></DialogHeader>
          {editReq && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>تغيير الحالة</Label>
                <Select value={editReq.status} onValueChange={v => setEditReq(x => x && { ...x, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات (تظهر للمستخدم)</Label>
                <Textarea rows={3} placeholder="اكتب ملاحظاتك هنا..." value={editReq.adminNotes} onChange={e => setEditReq(x => x && { ...x, adminNotes: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleProcess} disabled={processRequest.isPending}>
              {processRequest.isPending ? <Loader2 size={14} className="animate-spin ml-2" /> : null}
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setEditReq(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RulesTab() {
  const { data: rules, isLoading } = useListRules();
  if (isLoading) return <div className="text-muted-foreground py-8 text-center">جاري التحميل...</div>;
  return (
    <Card>
      <CardHeader><CardTitle>القواعد الضريبية للنظام</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">النظام</TableHead>
              <TableHead className="text-right">التصريح</TableHead>
              <TableHead className="text-right">المهلة القانونية</TableHead>
              <TableHead className="text-right">الغرامة الثابتة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules?.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {r.regime === "real" ? "النظام الحقيقي" : r.regime === "simplified_real" ? "النظام الحقيقي المبسط" : r.regime === "forfaitaire" ? "النظام الجزافي" : r.regime}
                </TableCell>
                <TableCell>{r.declarationType}</TableCell>
                <TableCell className="text-sm max-w-xs">{r.legalDeadlineDescriptionAr}</TableCell>
                <TableCell>{r.fixedFine ? `${r.fixedFine.toLocaleString()} د.ج` : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function MessagesTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: messages, isLoading } = useQuery({
    queryKey: ["supportMessages"],
    queryFn: async () => {
      const res = await fetch("/api/support/messages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const markAsRead = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/support/messages/${id}/read`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportMessages"] });
      toast({ title: "تم التحديث", description: "تم تحديد الرسالة كمقروءة" });
    }
  });

  if (isLoading) return <div className="text-muted-foreground py-8 text-center">جاري التحميل...</div>;

  return (
    <Card>
      <CardHeader><CardTitle>رسائل المستخدمين ({messages?.length || 0})</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المرسل</TableHead>
              <TableHead className="text-right">الرسالة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages?.map((msg: any) => (
              <TableRow key={msg.id} className={msg.isRead ? "opacity-70" : "font-semibold"}>
                <TableCell>{msg.firstName} {msg.lastName}</TableCell>
                <TableCell className="max-w-md">{msg.message}</TableCell>
                <TableCell className="text-sm" dir="ltr">{new Date(msg.createdAt).toLocaleString("fr-DZ")}</TableCell>
                <TableCell>
                  <Badge variant={msg.isRead ? "secondary" : "default"}>
                    {msg.isRead ? "مقروءة" : "جديدة"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!msg.isRead && (
                    <Button size="sm" variant="outline" onClick={() => markAsRead.mutate(msg.id)} disabled={markAsRead.isPending}>
                      تحديد كمقروءة
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
