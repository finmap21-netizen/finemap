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
    // If no payment (Néant / Déficit), fixed fines for late declaration
    let fixedFine = 2500;
    if (delay > 1 && delay <= 2) fixedFine = 5000;
    else if (delay > 2) fixedFine = 10000;

    return {
      delayMonths: delay,
      penaltyRate: 0,
      penaltyAmount: 0,
      fixedFine,
      totalDue: fixedFine,
      breakdown: [
        { label: `غرامة التصريح المتأخر (تأخير ${delay} شهر)`, rate: null, amount: fixedFine },
      ],
      message: `في حالة عدم وجود حقوق الدفع: تطبق غرامة ثابتة قدرها ${fixedFine.toLocaleString()} دج لعدم التصريح في الآجال.`,
      declarationType: "G50",
      regime: "real",
    };
  }

  // 1. Late Declaration Penalty (Majoration pour dépôt tardif)
  let declarationRate = 10;
  if (delay > 1 && delay <= 2) declarationRate = 20;
  else if (delay > 2) declarationRate = 25;

  const declarationPenalty = (taxAmount * declarationRate) / 100;

  // 2. Late Payment Penalty (Pénalité de retard de paiement)
  // 10% base + 3% per month starting the second month
  const paymentRateBase = 10;
  const paymentRateExtra = delay > 1 ? Math.min((delay - 1) * 3, 15) : 0; // Capped
  const paymentRate = paymentRateBase + paymentRateExtra;
  
  const paymentPenalty = (taxAmount * paymentRate) / 100;

  const totalRate = declarationRate + paymentRate;
  const totalPenalty = declarationPenalty + paymentPenalty;

  return {
    delayMonths: delay,
    penaltyRate: totalRate,
    penaltyAmount: totalPenalty,
    fixedFine: null,
    totalDue: taxAmount + totalPenalty,
    breakdown: [
      { label: `عقوبة التصريح المتأخر ${declarationRate}%`, rate: declarationRate, amount: declarationPenalty },
      { label: `عقوبة الدفع المتأخر (10% + 3% لكل شهر) ${paymentRate}%`, rate: paymentRate, amount: paymentPenalty },
    ],
    message: `تأخير ${delay} شهر — مجموع الغرامات ${totalRate}%`,
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
  return {
    ...calculateG50Penalty(dueDate, paymentDate, taxAmount, hasPaymentRights),
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
