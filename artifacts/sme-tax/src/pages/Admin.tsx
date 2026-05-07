import { useGetMe, useGetAdminStats, useListAdminUsers, useUpdateAdminUser, useDeleteAdminUser, useListRules, getListAdminUsersQueryKey } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Trash2 } from "lucide-react";

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
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="rules">القواعد الضريبية</TabsTrigger>
        </TabsList>

        <TabsContent value="stats"><StatsTab /></TabsContent>
        <TabsContent value="users"><UsersTab currentUserId={user?.id} /></TabsContent>
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
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">إجمالي المستخدمين</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">{stats?.totalUsers}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">المستخدمين النشطين</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold text-green-600">{stats?.activeUsers}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">القواعد الضريبية</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">{stats?.totalRules}</div></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">المقالات المعرفية</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">{stats?.totalKnowledgeItems}</div></CardContent>
      </Card>

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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        toast({ title: "تم التحديث", description: "تم تحديث دور المستخدم بنجاح" });
      }
    });
  };

  const handleStatusChange = (id: number, isActive: boolean) => {
    updateUser.mutate({ id, data: { isActive } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        toast({ title: "تم التحديث", description: isActive ? "تم تفعيل الحساب" : "تم تعطيل الحساب" });
      }
    });
  };

  const handleDelete = (id: number, name: string) => {
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        toast({ title: "تم الحذف", description: `تم حذف حساب ${name} نهائياً` });
      },
      onError: (err: any) => {
        toast({ title: "خطأ", description: err?.data?.error || "تعذّر حذف المستخدم", variant: "destructive" });
      }
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
              <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    onValueChange={(val: "user" | "admin") => handleRoleChange(u.id, val)}
                    disabled={u.id === currentUserId}
                  >
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={u.isActive}
                    onCheckedChange={(val) => handleStatusChange(u.id, val)}
                    disabled={u.id === currentUserId}
                    data-testid={`switch-active-${u.id}`}
                  />
                </TableCell>
                <TableCell>
                  {u.id !== currentUserId ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          data-testid={`button-delete-${u.id}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف حساب <strong>{u.name}</strong>؟ هذا الإجراء لا يمكن التراجع عنه وستُحذف جميع بيانات المؤسسة المرتبطة به.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse gap-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(u.id, u.name)}
                          >
                            حذف نهائي
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="text-xs text-muted-foreground">أنت</span>
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
              <TableRow key={r.id} data-testid={`row-rule-${r.id}`}>
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
