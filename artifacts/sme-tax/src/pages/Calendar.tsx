import { useState } from "react";
import { useListCalendarEvents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'critical': return 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse';
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200 font-bold';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'upcoming': return 'قادم';
    case 'due_today': return 'اليوم';
    case 'overdue': return 'متأخر';
    case 'completed': return 'مكتمل';
    default: return status;
  }
};

export default function Calendar() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString());

  const { data: events, isLoading } = useListCalendarEvents({
    year: Number(year),
    month: Number(month)
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary">التقويم الضريبي</h1>
        
        <div className="flex gap-4">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-32"><SelectValue placeholder="الشهر" /></SelectTrigger>
            <SelectContent>
              {Array.from({length: 12}).map((_, i) => (
                <SelectItem key={i+1} value={(i+1).toString()}>شهر {i+1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32"><SelectValue placeholder="السنة" /></SelectTrigger>
            <SelectContent>
              {[currentYear-1, currentYear, currentYear+1].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {events?.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                لا توجد مواعيد ضريبية في هذا الشهر.
              </CardContent>
            </Card>
          ) : (
            events?.map(event => (
              <Card key={event.id} className={`border-l-4 ${
                event.urgencyLevel === 'overdue' ? 'border-l-red-500' :
                event.urgencyLevel === 'critical' ? 'border-l-orange-500' :
                event.urgencyLevel === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{event.declarationType}</Badge>
                      <h3 className="font-bold text-lg">{event.titleAr}</h3>
                    </div>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="text-sm font-medium">
                      الموعد: <span dir="ltr">{new Date(event.dueDate).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getUrgencyColor(event.urgencyLevel)}>
                        {event.daysUntilDue < 0 ? `متأخر بـ ${Math.abs(event.daysUntilDue)} يوم` : 
                         event.daysUntilDue === 0 ? "اليوم" : `باقي ${event.daysUntilDue} يوم`}
                      </Badge>
                      <Badge variant="secondary">{getStatusLabel(event.status)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
