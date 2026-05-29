import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Calendar as CalendarIcon, FileText, HelpCircle, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getDailyTip } from "@/data/dailyTips";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const [tip] = useState(() => getDailyTip());
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!tip) return;
    
    // Smooth progress bar update over 5 seconds (5000ms)
    const duration = 5000;
    const intervalTime = 100;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(currentProgress);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setShowAnswer(true);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [tip]);

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">لوحة القيادة</h1>
        
        {/* Daily Q&A Bar/Banner */}
        {tip && (
          <div className="w-full md:max-w-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-[3px] bg-slate-200">
              <div 
                className="h-full bg-indigo-600 transition-all duration-100 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-start gap-3 mt-1">
              <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-2 w-full">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                    {tip.category}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground mt-1">
                    {tip.question}
                  </h3>
                </div>
                
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${
                  showAnswer ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                }`}>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-indigo-50/50 dark:border-indigo-950/50 text-xs text-muted-foreground flex gap-1.5 items-start">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">الجواب:</span>
                    <span>{tip.answer}</span>
                  </div>
                </div>

                {!showAnswer && (
                  <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 animate-pulse">
                    <span>سيظهر الجواب تلقائياً بعد قليل...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المواعيد القادمة</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.upcomingDeadlines || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المواعيد المتأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary?.overdueCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">خطر الغرامات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalPenaltyRisk?.toLocaleString() || 0} د.ج</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">آخر الأخبار</h2>
        <div className="space-y-4">
          {summary?.recentNews?.map(news => (
            <Card key={news.id}>
              <CardHeader>
                <CardTitle className="text-lg">{news.titleAr}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{news.contentAr}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
