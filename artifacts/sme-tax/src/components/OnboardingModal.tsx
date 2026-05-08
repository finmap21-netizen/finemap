import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Calendar, Calculator, Bot, FileText, BookOpen, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const ONBOARDING_KEY = "finmap_onboarding_done";

const steps = [
  {
    icon: Sparkles,
    title: "مرحباً بك في خريطة المالية!",
    description: "منصتك الذكية لإدارة الضرائب والشؤون المالية لمؤسستك الجزائرية. دعنا نريك أبرز الميزات في دقيقتين.",
    badge: "خريطة المالية",
    color: "text-yellow-500",
    bg: "bg-yellow-50",
  },
  {
    icon: LayoutDashboard,
    title: "لوحة القيادة",
    description: "احصل على نظرة شاملة على الوضع الضريبي لمؤسستك: المواعيد القادمة، التذكيرات العاجلة، وملخص الأنشطة.",
    badge: "الرئيسية",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Calendar,
    title: "التقويم الضريبي",
    description: "تتبع جميع المواعيد الضريبية الخاصة بنظامك الجبائي (حقيقي، مبسط، جزافي) مع تنبيهات ترمز بالألوان حسب الأولوية.",
    badge: "التقويم",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Calculator,
    title: "حساب الغرامات",
    description: "احسب فوراً غرامات التأخير لأي تصريح (G50، G12، IBS، IRG، CNAS...) وفق القانون الجبائي الجزائري.",
    badge: "الغرامات",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: Bot,
    title: "المستشار الضريبي الذكي",
    description: "اسأل مستشارنا الذكي المدعوم بـ AI عن أي سؤال ضريبي أو محاسبي. ابحث عن أيقونة الدردشة في أسفل الشاشة.",
    badge: "AI",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: FileText,
    title: "طلبات الفواتير",
    description: "أرسل طلباً لحساب الفاتورة أو التصريح الضريبي وسيتولى فريقنا المتخصص المعالجة وإعلامك بالنتيجة.",
    badge: "الفواتير",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: BookOpen,
    title: "قاعدة المعرفة",
    description: "استكشف مكتبة شاملة من المقالات والأسئلة الشائعة حول الضرائب الجزائرية، مصنفة حسب الموضوع والنظام الجبائي.",
    badge: "المعرفة",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setOpen(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else handleClose();
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <div className={`w-16 h-16 rounded-2xl ${current.bg} flex items-center justify-center mb-3 mx-auto`}>
            <Icon size={32} className={current.color} />
          </div>
          <Badge variant="secondary" className="w-fit mx-auto mb-2">{current.badge}</Badge>
          <DialogTitle className="text-center text-xl">{current.title}</DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed mt-2">
            {current.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1.5 my-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-2">
          <Button variant="ghost" size="sm" onClick={handlePrev} disabled={step === 0} className="gap-1">
            <ChevronRight size={16} />
            السابق
          </Button>

          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" onClick={handleClose}>
            تخطي
          </Button>

          <Button size="sm" onClick={handleNext} className="gap-1">
            {step === steps.length - 1 ? "ابدأ الآن" : "التالي"}
            {step < steps.length - 1 && <ChevronLeft size={16} />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
