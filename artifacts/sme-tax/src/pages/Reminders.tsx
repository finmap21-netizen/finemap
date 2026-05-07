import { useListReminders, useAcknowledgeReminder, getListRemindersQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Bell } from "lucide-react";

const getReminderTypeLabel = (type: string) => {
  switch (type) {
    case 'seven_days': return 'قبل 7 أيام';
    case 'three_days': return 'قبل 3 أيام';
    case 'one_day': return 'قبل يوم';
    case 'due_day': return 'يوم الموعد';
    case 'overdue': return 'بعد الموعد';
    default: return type;
  }
};

export default function Reminders() {
  const { data: reminders, isLoading } = useListReminders();
  const acknowledge = useAcknowledgeReminder();
  const queryClient = useQueryClient();

  const handleAcknowledge = (id: number) => {
    acknowledge.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRemindersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
      }
    });
  };

  if (isLoading) return <div>جاري التحميل...</div>;

  const pending = reminders?.filter(r => !r.isAcknowledged) || [];
  const acknowledged = reminders?.filter(r => r.isAcknowledged) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">التذكيرات</h1>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">قيد الانتظار ({pending.length})</h2>
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="text-muted-foreground bg-muted/30 p-4 rounded text-center">لا توجد تذكيرات جديدة</div>
          ) : (
            pending.map(reminder => (
              <Card key={reminder.id} className="border-l-4 border-l-primary bg-primary/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">{getReminderTypeLabel(reminder.reminderType)}</Badge>
                      <span className="font-bold">{reminder.event?.declarationType}</span>
                    </div>
                    <p className="text-sm">{reminder.messageAr}</p>
                  </div>
                  <Button variant="default" size="sm" onClick={() => handleAcknowledge(reminder.id)} disabled={acknowledge.isPending}>
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    استلام
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">السابقة ({acknowledged.length})</h2>
        <div className="space-y-3 opacity-70">
          {acknowledged.map(reminder => (
            <Card key={reminder.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary">{getReminderTypeLabel(reminder.reminderType)}</Badge>
                  <span className="font-medium">{reminder.event?.declarationType}</span>
                </div>
                <p className="text-sm text-muted-foreground">{reminder.messageAr}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
