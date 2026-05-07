import { useGetMe, useGetAdminStats, useListAdminUsers, useUpdateAdminUser, useListRules, getListAdminUsersQueryKey } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Admin() {
  const { data: user } = useGetMe();
  const [, setLocation] = useLocation();

  if (user && user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">لوحة الإدارة</h1>
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="rules">القواعد الضريبية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats"><StatsTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="rules"><RulesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StatsTab() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) return <div>جاري التحميل...</div>;

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
                <span>{r.regime || "غير محدد"}</span>
                <span className="font-bold">{r.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useListAdminUsers();
  const updateUser = useUpdateAdminUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRoleChange = (id: number, role: "user"|"admin") => {
    updateUser.mutate({ id, data: { role } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        toast({ title: "تم", description: "تم تحديث الدور بنجاح" });
      }
    });
  };

  const handleStatusChange = (id: number, isActive: boolean) => {
    updateUser.mutate({ id, data: { isActive } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        toast({ title: "تم", description: "تم تحديث حالة الحساب" });
      }
    });
  };

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <Card>
      <CardHeader><CardTitle>إدارة المستخدمين</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">نشط</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(val: any) => handleRoleChange(u.id, val)}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch checked={u.isActive} onCheckedChange={(val) => handleStatusChange(u.id, val)} />
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
  
  if (isLoading) return <div>جاري التحميل...</div>;

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
                <TableCell className="font-medium">{r.regime}</TableCell>
                <TableCell>{r.declarationType}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">{r.legalDeadlineDescriptionAr}</TableCell>
                <TableCell>{r.fixedFine ? `${r.fixedFine} د.ج` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
