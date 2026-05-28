export interface DailyTip {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const dailyTips: DailyTip[] = [
  {
    id: "tip_1",
    category: "إدارة التدفق النقدي",
    question: "كيف أتحكم في السيولة داخل مؤسستي؟",
    answer: "احرص على تتبع كل المداخيل والمصاريف يومياً."
  },
  {
    id: "tip_2",
    category: "الضرائب",
    question: "متى يجب تقديم التصريح السنوي للشركات؟",
    answer: "في أجل أقصاه 30 أفريل من كل سنة."
  },
  {
    id: "tip_3",
    category: "إدارة الرواتب",
    question: "ما هي غرامة عدم التصريح بكشف الرواتب والأجور (G29)؟",
    answer: "غرامة 5% على الكتلة السنوية للأجور."
  },
  {
    id: "tip_4",
    category: "نصيحة محاسبية",
    question: "كيف أحمي شركتي من الأخطاء المحاسبية؟",
    answer: "استخدم برامج محاسبة معتمدة وقم بمراجعة دورية مع خبير محاسبي."
  },
  {
    id: "tip_5",
    category: "الثقافة المالية",
    question: "ما هو متبقى التصفية (Solde de liquidation)؟",
    answer: "هو المبلغ المتبقي الواجب دفعه من الضريبة بعد خصم التسبيقات، ويدفع في أجل أقصاه 20 ماي."
  }
];

// دالة بسيطة لجلب نصيحة اليوم بناءً على التاريخ
export function getDailyTip(): DailyTip {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const index = dayOfYear % dailyTips.length;
  return dailyTips[index];
}
