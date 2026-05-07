export interface CalendarEvent {
  id: number;
  declarationType: string;
  regime: string;
  title: string;
  titleAr: string;
  description: string;
  dueDate: string;
  daysUntilDue: number;
  status: "upcoming" | "due_today" | "overdue" | "completed";
  urgencyLevel: "normal" | "warning" | "critical" | "overdue";
}

function daysUntil(dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(days: number): CalendarEvent["status"] {
  if (days < 0) return "overdue";
  if (days === 0) return "due_today";
  return "upcoming";
}

function getUrgency(days: number): CalendarEvent["urgencyLevel"] {
  if (days < 0) return "overdue";
  if (days === 0) return "critical";
  if (days <= 3) return "critical";
  if (days <= 7) return "warning";
  return "normal";
}

function makeDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

export function generateCalendarEvents(
  regime: string,
  year: number,
  hasCnas: boolean
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  let idCounter = 1;

  const add = (
    declarationType: string,
    regimeLabel: string,
    title: string,
    titleAr: string,
    description: string,
    dueDate: Date
  ) => {
    const days = daysUntil(dueDate);
    events.push({
      id: idCounter++,
      declarationType,
      regime: regimeLabel,
      title,
      titleAr,
      description,
      dueDate: dueDate.toISOString().split("T")[0],
      daysUntilDue: days,
      status: getStatus(days),
      urgencyLevel: getUrgency(days),
    });
  };

  if (regime === "real") {
    for (let month = 1; month <= 12; month++) {
      add(
        "G50",
        "real",
        `G50 - Déclaration mensuelle (${month}/${year})`,
        `تصريح شهري G50 (${month}/${year})`,
        "TVA / IRG sur salaires / Timbre",
        makeDate(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 20)
      );
    }

    add("IRG", "real", `IRG Acompte 1 (${year})`, `التسبيق الأول IRG (${year})`, "من 20 فيفري إلى 20 مارس", makeDate(year, 3, 20));
    add("IRG", "real", `IRG Acompte 2 (${year})`, `التسبيق الثاني IRG (${year})`, "من 20 مارس إلى 20 جوان", makeDate(year, 6, 20));
    add("IBS", "real", `IBS Acompte 1 (${year})`, `التسبيق الأول IBS (${year})`, "قبل 20 مارس", makeDate(year, 3, 20));
    add("IBS", "real", `IBS Acompte 2 (${year})`, `التسبيق الثاني IBS (${year})`, "قبل 20 جوان", makeDate(year, 6, 20));
    add("IBS", "real", `IBS Acompte 3 (${year})`, `التسبيق الثالث IBS (${year})`, "قبل 20 نوفمبر", makeDate(year, 11, 20));
    add("G4", "real", `Bilan fiscal / G4 (${year})`, `الميزانية الجبائية G4 (${year})`, "قبل 30 أفريل من السنة ن+1", makeDate(year + 1, 4, 30));
  }

  if (regime === "simplified_real") {
    for (let q = 1; q <= 4; q++) {
      const month = q * 3;
      const dueMonth = month === 12 ? 1 : month + 1;
      const dueYear = month === 12 ? year + 1 : year;
      add(
        "G50",
        "simplified_real",
        `G50 Trimestriel T${q} (${year})`,
        `تصريح ثلاثي G50 الربع ${q} (${year})`,
        "TVA / IRG ثلاثي",
        makeDate(dueYear, dueMonth, 20)
      );
    }
    add("G4", "simplified_real", `Bilan fiscal / G4 (${year})`, `الميزانية الجبائية G4 (${year})`, "قبل 30 أفريل", makeDate(year + 1, 4, 30));
  }

  if (regime === "forfaitaire") {
    add("G12", "forfaitaire", `G12 Estimatif (${year})`, `التصريح التقديري G12 (${year})`, "قبل 30 جوان من السنة ن", makeDate(year, 6, 30));
    add("G12BIS", "forfaitaire", `G12 BIS Final (${year})`, `التصريح النهائي G12 BIS (${year})`, "قبل 20 جانفي من السنة ن+1", makeDate(year + 1, 1, 20));
    add("G50TER", "forfaitaire", `G50 TER (${year})`, `الضريبة الجزافية الوحيدة G50 TER (${year})`, "دخل اجتماعي", makeDate(year + 1, 1, 31));
  }

  if (hasCnas) {
    add("CNAS", "all", `CNAS Déclaration Annuelle (${year})`, `تصريح CNAS السنوي (${year})`, "قبل 31 جانفي", makeDate(year + 1, 1, 31));
  }

  return events.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}
