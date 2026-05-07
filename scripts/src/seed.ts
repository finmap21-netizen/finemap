import crypto from "crypto";
import { db, taxRulesTable, knowledgeTable, newsTable, usersTable } from "@workspace/db";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "sme_tax_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const existing = await db.select().from(usersTable);
  if (existing.length === 0) {
    await db.insert(usersTable).values({
      name: "المدير",
      email: "admin@smetax.dz",
      passwordHash: hashPassword("Admin@2024"),
      role: "admin",
      isActive: true,
    });
    console.log("Created admin user: admin@smetax.dz / Admin@2024");
  }

  // Tax rules
  const existingRules = await db.select().from(taxRulesTable);
  if (existingRules.length === 0) {
    await db.insert(taxRulesTable).values([
      {
        regime: "real",
        declarationType: "G50",
        legalDeadlineDescription: "20th of the following month",
        legalDeadlineDescriptionAr: "قبل 20 من الشهر الموالي لتاريخ الاستحقاق",
        penaltySchedule: JSON.stringify([
          { delayMonths: 1, rate: 15 },
          { delayMonths: 2, rate: 23 },
          { delayMonths: 3, rate: 26 },
          { delayMonths: 4, rate: 29 },
          { delayMonths: 5, rate: 32 },
          { delayMonths: "6+", rate: 35 },
        ]),
        fixedFine: 500,
        notes: "G50 monthly declaration for TVA, IRG, and stamp duty",
        notesAr: "التصريح الشهري G50 يشمل TVA والـ IRG على الرواتب وحق الطابع",
        sourceDocument: "Code des procédures fiscales - Art. 402 bis",
        isActive: true,
      },
      {
        regime: "forfaitaire",
        declarationType: "G12",
        legalDeadlineDescription: "Before June 30 of the current year",
        legalDeadlineDescriptionAr: "قبل 30 جوان من السنة الجارية (التصريح التقديري)",
        penaltySchedule: JSON.stringify([
          { delayMonths: 1, rate: 10 },
          { delayMonths: 2, rate: 20 },
          { delayMonths: "3+", rate: 25 },
        ]),
        fixedFine: null,
        notes: "Provisional G12 declaration for forfaitaire regime",
        notesAr: "التصريح التقديري G12 للنظام الجزافي — يُودع قبل 30 جوان",
        sourceDocument: "Code des procédures fiscales - Art. 22",
        isActive: true,
      },
      {
        regime: "forfaitaire",
        declarationType: "G12BIS",
        legalDeadlineDescription: "Before January 20 of the following year",
        legalDeadlineDescriptionAr: "قبل 20 جانفي من السنة الموالية (التصريح النهائي)",
        penaltySchedule: JSON.stringify([]),
        fixedFine: 2500,
        notes: "Final G12BIS declaration - fixed fines apply",
        notesAr: "التصريح النهائي G12 BIS — غرامات ثابتة: 2500 / 5000 / 10000 دج حسب التأخير",
        sourceDocument: "Code des procédures fiscales - Art. 24",
        isActive: true,
      },
      {
        regime: "real",
        declarationType: "IBS",
        legalDeadlineDescription: "3 advance payments: March 20, June 20, November 20",
        legalDeadlineDescriptionAr: "ثلاثة تسبيقات: 20 مارس، 20 جوان، 20 نوفمبر",
        penaltySchedule: JSON.stringify([
          { delayMonths: 1, rate: 10 },
          { delayMonths: 2, rate: 13 },
          { delayMonths: 3, rate: 16 },
          { delayMonths: 4, rate: 19 },
          { delayMonths: 5, rate: 22 },
          { delayMonths: "6+", rate: 25 },
        ]),
        fixedFine: null,
        notes: "IBS advance payments - 3 per year",
        notesAr: "تسبيقات IBS — ثلاثة دفعات في السنة بمعدل 30% من الضريبة السابقة لكل تسبيق",
        sourceDocument: "Code des impôts directs - Art. 356 à 363",
        isActive: true,
      },
      {
        regime: "real",
        declarationType: "IRG",
        legalDeadlineDescription: "2 advance payments: March 20, June 20",
        legalDeadlineDescriptionAr: "تسبيقان: 20 مارس، 20 جوان",
        penaltySchedule: JSON.stringify([
          { delayMonths: 1, rate: 10 },
          { delayMonths: 2, rate: 13 },
          { delayMonths: 3, rate: 16 },
          { delayMonths: 4, rate: 19 },
          { delayMonths: 5, rate: 22 },
          { delayMonths: "6+", rate: 25 },
        ]),
        fixedFine: null,
        notes: "IRG advance payments for individual businesses",
        notesAr: "تسبيقات IRG للأشخاص الطبيعيين — دفعتان في السنة",
        sourceDocument: "Code des impôts directs - Art. 355",
        isActive: true,
      },
      {
        regime: "all",
        declarationType: "CNAS",
        legalDeadlineDescription: "Annual declaration before January 31",
        legalDeadlineDescriptionAr: "التصريح السنوي CNAS قبل 31 جانفي",
        penaltySchedule: JSON.stringify([{ delayMonths: "1+", rate: 10 }]),
        fixedFine: null,
        notes: "Social security contributions for employees",
        notesAr: "التصريح السنوي بالعمال لدى CNAS — غرامة 10% عند التأخير",
        sourceDocument: "Loi 83-14 relative aux obligations des assujettis",
        isActive: true,
      },
      {
        regime: "real",
        declarationType: "G4",
        legalDeadlineDescription: "Before April 30 of the following year",
        legalDeadlineDescriptionAr: "قبل 30 أفريل من السنة الموالية",
        penaltySchedule: JSON.stringify([
          { delayMonths: 1, rate: 10 },
          { delayMonths: 2, rate: 20 },
          { delayMonths: "3+", rate: 25 },
        ]),
        fixedFine: 30000,
        notes: "Annual tax balance sheet G4",
        notesAr: "الميزانية الجبائية السنوية G4 — تسليم قبل 30 أفريل من السنة ن+1",
        sourceDocument: "Code des procédures fiscales - Art. 151",
        isActive: true,
      },
    ]);
    console.log("Created 7 tax rules");
  }

  // Knowledge base
  const existingKb = await db.select().from(knowledgeTable);
  if (existingKb.length === 0) {
    await db.insert(knowledgeTable).values([
      {
        question: "What is the G50 declaration?",
        questionAr: "ما هو التصريح G50؟",
        answer: "G50 is a monthly declaration for TVA, IRG on salaries, and stamp duty for real regime enterprises.",
        answerAr: "G50 هو تصريح شهري يخص الضريبة على القيمة المضافة TVA وضريبة الدخل على الرواتب IRG وحق الطابع. يُودع من قبل مؤسسات النظام الحقيقي قبل 20 من كل شهر.",
        tip: "Always submit before the 20th to avoid penalties",
        tipAr: "تأكد من إيداع التصريح قبل اليوم 20 من الشهر الموالي لتجنب أي غرامة",
        category: "declarations",
        regime: "real",
      },
      {
        question: "What penalties apply for late G50?",
        questionAr: "ما هي عقوبات التأخير في G50؟",
        answer: "Late G50 penalties range from 15% (1 month) to 35% (6+ months) of the tax owed.",
        answerAr: "غرامات التأخير في G50 تتراوح بين 15% (شهر واحد) و23% (شهرين) و26% (3 أشهر) وصولاً إلى 35% (6 أشهر فأكثر) من مبلغ الضريبة المستحقة.",
        tip: "Even one day late triggers the first month penalty",
        tipAr: "حتى يوم واحد من التأخير يُطبق غرامة الشهر الأول البالغة 15%",
        category: "penalties",
        regime: "real",
      },
      {
        question: "What is the forfaitaire tax regime?",
        questionAr: "ما هو النظام الجزافي؟",
        answer: "The forfaitaire (IFU) is a simplified tax regime for small businesses with annual revenue below 30 million DZD.",
        answerAr: "النظام الجزافي (الضريبة الجزافية الوحيدة IFU) هو نظام ضريبي مبسط للمؤسسات الصغيرة التي يقل رقم أعمالها السنوي عن 30 مليون دج. يُجمع فيه IBS وIRG وTVA في ضريبة واحدة.",
        tip: "Forfaitaire businesses use G12 and G12BIS, not G50",
        tipAr: "مؤسسات النظام الجزافي تُصرح بـ G12 (تقديري) و G12BIS (نهائي) وليس G50",
        category: "regimes",
        regime: "forfaitaire",
      },
      {
        question: "When do I need to pay IBS advances?",
        questionAr: "متى تستحق تسبيقات IBS؟",
        answer: "IBS advance payments are due March 20, June 20, and November 20. Each equals 30% of the previous year's IBS.",
        answerAr: "تسبيقات IBS تستحق في: 20 مارس، 20 جوان، 20 نوفمبر. كل تسبيق يعادل 30% من ضريبة IBS المدفوعة عن السنة الماضية.",
        tip: "Use last year's IBS declaration as reference",
        tipAr: "ارجع إلى تصريح IBS للسنة الماضية لحساب مبلغ كل تسبيق",
        category: "deadlines",
        regime: "real",
      },
      {
        question: "How do fixed fines work for G12BIS?",
        questionAr: "كيف تُطبق الغرامات الثابتة على G12BIS؟",
        answer: "For G12BIS late filing without payment rights: 2,500 DZD (1 month), 5,000 DZD (2 months), 10,000 DZD (3+ months).",
        answerAr: "عند التأخير في G12BIS بدون حقوق الدفع: 2,500 دج (تأخير شهر)، 5,000 دج (شهرين)، 10,000 دج (أكثر من شهرين). هذه مبالغ ثابتة لا تتعلق بمبلغ الضريبة.",
        tip: "File on time to avoid these fixed penalties",
        tipAr: "الإيداع في الوقت المحدد يتجنب هذه الغرامات الثابتة بغض النظر عن مبلغ الضريبة",
        category: "penalties",
        regime: "forfaitaire",
      },
      {
        question: "What is the deadline for the annual G4 balance sheet?",
        questionAr: "ما هو آخر أجل لتقديم الميزانية الجبائية G4؟",
        answer: "The annual tax balance sheet (G4) must be filed before April 30 of the following year.",
        answerAr: "الميزانية الجبائية السنوية G4 يجب إيداعها قبل 30 أفريل من السنة الموالية. على سبيل المثال، G4 لسنة 2025 يُودع قبل 30 أفريل 2026.",
        tip: "Start preparing your G4 in January to avoid rush",
        tipAr: "ابدأ إعداد الميزانية الجبائية من شهر جانفي لتجنب الضغط في آخر الأجل",
        category: "declarations",
        regime: "real",
      },
      {
        question: "What is TVA and who pays it?",
        questionAr: "ما هي TVA ومن يدفعها؟",
        answer: "TVA (Taxe sur la Valeur Ajoutée) is the Algerian VAT at 19%. Enterprises in the real regime must collect and remit TVA monthly.",
        answerAr: "TVA (الضريبة على القيمة المضافة) تُطبق على المؤسسات في النظام الحقيقي. المعدل العام هو 19%. تُحصل من الزبائن وتُدفع شهرياً عبر تصريح G50.",
        tip: "TVA collected minus TVA paid on purchases = TVA to remit",
        tipAr: "TVA المحصلة من الزبائن ناقص TVA المدفوعة على المشتريات = TVA الواجب دفعها",
        category: "taxes",
        regime: "real",
      },
      {
        question: "What happens if I miss a CNAS declaration?",
        questionAr: "ماذا يحدث إذا تأخرت في تصريح CNAS؟",
        answer: "Late CNAS declarations incur a 10% penalty on the contributions due, plus possible administrative fines.",
        answerAr: "التأخر في التصريح السنوي CNAS يُطبق غرامة 10% من اشتراكات الضمان الاجتماعي المستحقة. كما يمكن أن تُفرض غرامات إدارية إضافية.",
        tip: "CNAS annual declaration is due January 31",
        tipAr: "التصريح السنوي CNAS يستحق قبل 31 جانفي من كل سنة",
        category: "obligations",
        regime: "all",
      },
    ]);
    console.log("Created 8 knowledge items");
  }

  // News
  const existingNews = await db.select().from(newsTable);
  if (existingNews.length === 0) {
    await db.insert(newsTable).values([
      {
        title: "New tax deadlines for 2025 announced by DGI",
        titleAr: "الإدارة العامة للضرائب تُعلن عن المواعيد الجبائية لسنة 2025",
        content: "The General Directorate of Taxes has released the official tax calendar for fiscal year 2025.",
        contentAr: "أعلنت المديرية العامة للضرائب عن التقويم الجبائي الرسمي للسنة المالية 2025. ويُذكّر التقويم أصحاب المؤسسات بجميع المواعيد النهائية للتصاريح الشهرية والفصلية والسنوية. يُنصح بمراجعة التقويم ومطابقته مع نظامكم الجبائي.",
        category: "deadlines",
        publishedAt: new Date("2025-01-10"),
      },
      {
        title: "IFU Threshold Maintained at 30 Million DZD for 2025",
        titleAr: "الحد الأقصى للنظام الجزافي يبقى 30 مليون دج لسنة 2025",
        content: "The revenue threshold for the forfaitaire regime remains at 30 million DZD for fiscal year 2025.",
        contentAr: "أكدت وزارة المالية الجزائرية أن حد رقم الأعمال للانتساب إلى نظام IFU يبقى عند 30 مليون دينار جزائري للسنة المالية 2025. المؤسسات التي تتجاوز هذا الحد تُلزم بالانتقال إلى النظام الحقيقي.",
        category: "legislation",
        publishedAt: new Date("2025-01-15"),
      },
      {
        title: "Reminder: G50 February Declaration Due March 20",
        titleAr: "تذكير: آخر أجل لإيداع G50 عن شهر فيفري هو 20 مارس",
        content: "Enterprises on the real tax regime must submit their G50 declaration for February 2025 by March 20.",
        contentAr: "تُذكّر المديرية العامة للضرائب مؤسسات النظام الحقيقي بأن آخر أجل لإيداع التصريح الشهري G50 عن شهر فيفري 2025 هو يوم 20 مارس 2025. التأخير يُعرض المؤسسة لغرامات تبدأ من 15%.",
        category: "reminder",
        publishedAt: new Date("2025-03-15"),
      },
      {
        title: "Electronic Filing Expansion: G50 Online Now Mandatory",
        titleAr: "التصريح الإلكتروني بـ G50 أصبح إلزامياً عبر منصة Jibayatic",
        content: "All enterprises are now required to file their G50 declarations electronically through the Jibayatic platform.",
        contentAr: "أعلنت إدارة الضرائب عن إلزامية التصريح الإلكتروني بالنسبة للتصريح الشهري G50 لجميع المؤسسات. يتم الإيداع عبر المنصة الإلكترونية Jibayatic. المؤسسات التي لم تنشئ حساباتها بعد مطالبة بالتسجيل فوراً.",
        category: "digital",
        publishedAt: new Date("2025-02-01"),
      },
      {
        title: "New IRG Rates Apply for 2025 Salary Declarations",
        titleAr: "تطبيق معدلات IRG الجديدة على تصريحات الرواتب لسنة 2025",
        content: "Updated IRG brackets for salaries have been applied starting January 2025.",
        contentAr: "دخلت شرائح IRG الجديدة على الرواتب حيز التطبيق اعتباراً من جانفي 2025. أبرز التغييرات: رفع الحد الأدنى المعفى من الضريبة. يُنصح أصحاب العمل بمراجعة حسابات الاقتطاع من المنبع وتحديث برامج الرواتب.",
        category: "legislation",
        publishedAt: new Date("2025-01-20"),
      },
    ]);
    console.log("Created 5 news items");
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
