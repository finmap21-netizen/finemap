export interface PenaltyScheduleEntry {
  monthStart: number;
  monthEnd: number | null;
  rate: number;
}

export interface PenaltyBreakdownItem {
  label: string;
  rate: number | null;
  amount: number;
}

export interface PenaltyCalculation {
  delayMonths: number;
  penaltyRate: number;
  penaltyAmount: number;
  fixedFine: number | null;
  totalDue: number;
  breakdown: PenaltyBreakdownItem[];
  message: string;
  declarationType: string;
  regime: string;
}

function monthsDiff(due: Date, payment: Date): number {
  const y = payment.getFullYear() - due.getFullYear();
  const m = payment.getMonth() - due.getMonth();
  const d = payment.getDate() - due.getDate();
  let months = y * 12 + m;
  if (d > 0) months += 1;
  return Math.max(0, months);
}

export function calculateG50Penalty(
  dueDate: Date,
  paymentDate: Date,
  taxAmount: number,
  hasPaymentRights: boolean
): PenaltyCalculation {
  const delay = monthsDiff(dueDate, paymentDate);

  if (!hasPaymentRights) {
    const fixedFine = 500;
    return {
      delayMonths: delay,
      penaltyRate: 0,
      penaltyAmount: 0,
      fixedFine,
      totalDue: fixedFine,
      breakdown: [
        { label: "عقوبة جبائية ثابتة (بدون حقوق)", rate: null, amount: fixedFine },
      ],
      message: `في حالة عدم وجود حقوق الدفع: تطبق عقوبة قدرها 500 دج على كل التزام جبائي`,
      declarationType: "G50",
      regime: "real",
    };
  }

  const schedule: PenaltyScheduleEntry[] = [
    { monthStart: 1, monthEnd: 1, rate: 15 },
    { monthStart: 2, monthEnd: 2, rate: 23 },
    { monthStart: 3, monthEnd: 3, rate: 26 },
    { monthStart: 4, monthEnd: 4, rate: 29 },
    { monthStart: 5, monthEnd: 5, rate: 32 },
    { monthStart: 6, monthEnd: null, rate: 35 },
  ];

  const entry = schedule.find(
    (s) => delay >= s.monthStart && (s.monthEnd === null || delay <= s.monthEnd)
  );
  const rate = entry ? entry.rate : 35;
  const penaltyAmount = (taxAmount * rate) / 100;

  const breakdown: PenaltyBreakdownItem[] = [
    { label: "عقوبة التحصيل 10%", rate: 10, amount: (taxAmount * 10) / 100 },
    { label: "عقوبة الإيداع المتأخر 5%", rate: 5, amount: (taxAmount * 5) / 100 },
  ];

  if (delay >= 2) {
    const threatRate = Math.min(3 * (delay - 1), 15);
    breakdown.push({
      label: `الغرامة التهديدية ${threatRate}%`,
      rate: threatRate,
      amount: (taxAmount * threatRate) / 100,
    });
  }

  return {
    delayMonths: delay,
    penaltyRate: rate,
    penaltyAmount,
    fixedFine: null,
    totalDue: taxAmount + penaltyAmount,
    breakdown,
    message: `تأخير ${delay} شهر — الغرامة ${rate}%`,
    declarationType: "G50",
    regime: "real",
  };
}

export function calculateG12Penalty(
  dueDate: Date,
  paymentDate: Date,
  taxAmount: number,
  declarationType: "G12" | "G12BIS",
  hasPaymentRights: boolean
): PenaltyCalculation {
  const delay = monthsDiff(dueDate, paymentDate);

  if (!hasPaymentRights) {
    let fixedFine = 2500;
    if (delay > 1 && delay <= 2) fixedFine = 5000;
    else if (delay > 2) fixedFine = 10000;

    return {
      delayMonths: delay,
      penaltyRate: 0,
      penaltyAmount: 0,
      fixedFine,
      totalDue: fixedFine,
      breakdown: [{ label: `غرامة ثابتة (تأخير ${delay} شهر)`, rate: null, amount: fixedFine }],
      message: `تأخير ${delay} شهر — غرامة ثابتة ${fixedFine.toLocaleString()} دج`,
      declarationType,
      regime: "forfaitaire",
    };
  }

  let rate = 0;
  if (delay <= 1) rate = 10;
  else if (delay <= 2) rate = 20;
  else rate = 25;

  const penaltyAmount = (taxAmount * rate) / 100;

  return {
    delayMonths: delay,
    penaltyRate: rate,
    penaltyAmount,
    fixedFine: null,
    totalDue: taxAmount + penaltyAmount,
    breakdown: [{ label: `غرامة التأخير ${rate}%`, rate, amount: penaltyAmount }],
    message: `تأخير ${delay} شهر — الغرامة ${rate}%`,
    declarationType,
    regime: "forfaitaire",
  };
}

export function calculateCNASPenalty(
  dueDate: Date,
  paymentDate: Date,
  taxAmount: number
): PenaltyCalculation {
  const delay = monthsDiff(dueDate, paymentDate);
  const rate = 10;
  const penaltyAmount = (taxAmount * rate) / 100;

  return {
    delayMonths: delay,
    penaltyRate: rate,
    penaltyAmount,
    fixedFine: null,
    totalDue: taxAmount + penaltyAmount,
    breakdown: [{ label: "غرامة تأخير CNAS 10%", rate, amount: penaltyAmount }],
    message: `تأخير ${delay} شهر في تصريح CNAS`,
    declarationType: "CNAS",
    regime: "all",
  };
}

export function calculateIBSPenalty(
  dueDate: Date,
  paymentDate: Date,
  taxAmount: number
): PenaltyCalculation {
  const delay = monthsDiff(dueDate, paymentDate);
  const schedule = [10, 13, 16, 19, 22, 25];
  const rate = schedule[Math.min(delay - 1, schedule.length - 1)] ?? 25;
  const penaltyAmount = (taxAmount * rate) / 100;

  return {
    delayMonths: delay,
    penaltyRate: rate,
    penaltyAmount,
    fixedFine: null,
    totalDue: taxAmount + penaltyAmount,
    breakdown: [{ label: `عقوبة تحصيل IBS ${rate}%`, rate, amount: penaltyAmount }],
    message: `تأخير ${delay} شهر في دفع IBS — الغرامة ${rate}%`,
    declarationType: "IBS",
    regime: "real",
  };
}

export function calculateIRGPenalty(
  dueDate: Date,
  paymentDate: Date,
  taxAmount: number
): PenaltyCalculation {
  const delay = monthsDiff(dueDate, paymentDate);
  const schedule = [10, 13, 16, 19, 22, 25];
  const rate = schedule[Math.min(delay - 1, schedule.length - 1)] ?? 25;
  const penaltyAmount = (taxAmount * rate) / 100;

  return {
    delayMonths: delay,
    penaltyRate: rate,
    penaltyAmount,
    fixedFine: null,
    totalDue: taxAmount + penaltyAmount,
    breakdown: [{ label: `عقوبة التحصيل IRG ${rate}%`, rate, amount: penaltyAmount }],
    message: `تأخير ${delay} شهر في تسبيقات IRG — الغرامة ${rate}%`,
    declarationType: "IRG",
    regime: "real",
  };
}

export function calculateG4Penalty(
  dueDate: Date,
  paymentDate: Date,
  taxAmount: number,
  hasPaymentRights: boolean
): PenaltyCalculation {
  const delay = monthsDiff(dueDate, paymentDate);

  if (!hasPaymentRights) {
    let fixedFine = 2500;
    if (delay > 1 && delay <= 2) fixedFine = 5000;
    else if (delay > 2) fixedFine = 10000;

    return {
      delayMonths: delay,
      penaltyRate: 0,
      penaltyAmount: 0,
      fixedFine,
      totalDue: fixedFine,
      breakdown: [{ label: `غرامة ثابتة (تأخير ${delay} شهر)`, rate: null, amount: fixedFine }],
      message: `تأخير ${delay} شهر — غرامة ثابتة ${fixedFine.toLocaleString()} دج`,
      declarationType: "G4",
      regime: "real",
    };
  }

  let rate = 10;
  if (delay > 1 && delay <= 2) rate = 20;
  else if (delay > 2) rate = 25;
  const penaltyAmount = (taxAmount * rate) / 100;

  return {
    delayMonths: delay,
    penaltyRate: rate,
    penaltyAmount,
    fixedFine: null,
    totalDue: taxAmount + penaltyAmount,
    breakdown: [{ label: `غرامة التصريح السنوي ${rate}%`, rate, amount: penaltyAmount }],
    message: `تأخير ${delay} شهر في التصريح السنوي G4 — الغرامة ${rate}%`,
    declarationType: "G4",
    regime: "real",
  };
}

export function calculatePenalty(params: {
  declarationType: string;
  regime: string;
  dueDate: Date;
  paymentDate: Date;
  taxAmount: number;
  hasPaymentRights: boolean;
}): PenaltyCalculation {
  const { declarationType, dueDate, paymentDate, taxAmount, hasPaymentRights } = params;

  switch (declarationType) {
    case "G50":
      return calculateG50Penalty(dueDate, paymentDate, taxAmount, hasPaymentRights);
    case "G12":
      return calculateG12Penalty(dueDate, paymentDate, taxAmount, "G12", hasPaymentRights);
    case "G12BIS":
      return calculateG12Penalty(dueDate, paymentDate, taxAmount, "G12BIS", hasPaymentRights);
    case "CNAS":
      return calculateCNASPenalty(dueDate, paymentDate, taxAmount);
    case "IBS":
      return calculateIBSPenalty(dueDate, paymentDate, taxAmount);
    case "IRG":
      return calculateIRGPenalty(dueDate, paymentDate, taxAmount);
    case "G4":
      return calculateG4Penalty(dueDate, paymentDate, taxAmount, hasPaymentRights);
    default:
      return calculateG50Penalty(dueDate, paymentDate, taxAmount, hasPaymentRights);
  }
}
