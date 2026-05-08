import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/auth";

const TIPS = [
  "تذكر: آخر أجل لتقديم تصريح G50 للشركات ذات النظام الحقيقي هو اليوم العشرون من كل شهر.",
  "نصيحة: احتفظ دائماً بنسخ من جميع فواتيرك لمدة 10 سنوات كما ينص القانون الجبائي الجزائري.",
  "هل تعلم؟ معدل TVA المخفض 9% يطبق على المواد الغذائية الأساسية والأدوية.",
  "تنبيه: الغرامة على عدم تقديم G50 في الموعد المحدد تبلغ 25% من مبلغ الضريبة المستحقة.",
  "نصيحة مالية: خصص دائماً 19% من أرباحك لتغطية ضريبة IBS قبل نهاية السنة المالية.",
  "تذكر: تصريح IFU (النظام الجزافي) يُقدَّم مرة واحدة سنوياً قبل 30 يناير.",
  "هل تعلم؟ يمكنك خصم مصاريف التأهين والتدريب من وعاء الضريبة على أرباح الشركات.",
  "نصيحة: استخدم ميزة التقويم الضريبي لتتبع جميع مواعيدك الضريبية وتجنب الغرامات.",
  "تذكر: اشتراكات CNAS تحتسب على أساس الراتب الإجمالي وتبلغ 26% (صاحب العمل) + 9% (العامل).",
  "نصيحة ضريبية: يُستحسن الاستعانة بمحاسب معتمد لإعداد القوائم المالية السنوية.",
];

const SHOWN_KEY = "finmap_tip_last_shown";
const TIP_INDEX_KEY = "finmap_tip_index";
const TIP_INTERVAL = 24 * 60 * 60 * 1000;

export function FinancialTips() {
  const [visible, setVisible] = useState(false);
  const [tip, setTip] = useState("");
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated) return;

    const lastShown = parseInt(localStorage.getItem(SHOWN_KEY) ?? "0", 10);
    const now = Date.now();

    if (now - lastShown > TIP_INTERVAL) {
      const idx = parseInt(localStorage.getItem(TIP_INDEX_KEY) ?? "0", 10);
      const nextIdx = (idx + 1) % TIPS.length;
      setTip(TIPS[nextIdx]);
      localStorage.setItem(TIP_INDEX_KEY, String(nextIdx));
      localStorage.setItem(SHOWN_KEY, String(now));

      const timer = setTimeout(() => setVisible(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [authenticated]);

  if (!visible || !tip) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-40 max-w-[320px] bg-primary text-primary-foreground rounded-2xl shadow-xl p-4 animate-in slide-in-from-right-10 fade-in duration-300"
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Lightbulb size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold mb-1 text-primary-foreground/80">نصيحة مالية</p>
          <p className="text-sm leading-relaxed">{tip}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 -mt-1 -ml-1 text-primary-foreground hover:bg-white/20"
          onClick={() => setVisible(false)}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
