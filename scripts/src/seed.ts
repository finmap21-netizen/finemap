import crypto from "crypto";
import { db, taxRulesTable, knowledgeTable, newsTable, usersTable } from "@workspace/db";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "sme_tax_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Admin credentials from environment variables — never hardcoded
  const adminEmail = process.env.ADMIN_EMAIL || "admin@smetax.dz";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2024";
  const adminName = process.env.ADMIN_NAME || "المدير";

  const existing = await db.select().from(usersTable);
  if (existing.length === 0) {
    await db.insert(usersTable).values({
      name: adminName,
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "admin",
      isActive: true,
    });
    console.log(`Created admin: ${adminEmail}`);
  } else {
    console.log("Users already exist, skipping admin creation.");
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
        answer: "G50 is a monthly declaration for TVA, IRG on salaries, and stamp duty.",
        answerAr: "G50 هو تصريح شهري يخص الضريبة على القيمة المضافة TVA وضريبة الدخل على الرواتب IRG وحق الطابع. يُودع من قبل مؤسسات النظام الحقيقي قبل 20 من كل شهر.",
        tip: "Always submit before the 20th to avoid penalties",
        tipAr: "تأكد من إيداع التصريح قبل اليوم 20 من الشهر الموالي لتجنب أي غرامة",
        category: "declarations",
        regime: "real",
      },
      {
        question: "What penalties apply for late G50?",
        questionAr: "ما هي عقوبات التأخير في G50؟",
        answer: "Late G50 penalties range from 15% (1 month) to 35% (6+ months).",
        answerAr: "غرامات التأخير في G50 تتراوح بين 15% (شهر واحد) و23% (شهرين) و26% (3 أشهر) وصولاً إلى 35% (6 أشهر فأكثر) من مبلغ الضريبة المستحقة.",
        tip: "Even one day late triggers the first month penalty",
        tipAr: "حتى يوم واحد من التأخير يُطبق غرامة الشهر الأول البالغة 15%",
        category: "penalties",
        regime: "real",
      },
      {
        question: "What is the forfaitaire tax regime?",
        questionAr: "ما هو النظام الجزافي؟",
        answer: "The forfaitaire (IFU) is a simplified regime for businesses with revenue below 30M DZD.",
        answerAr: "النظام الجزافي (IFU) هو نظام ضريبي مبسط للمؤسسات الصغيرة التي يقل رقم أعمالها السنوي عن 30 مليون دج.",
        tip: "Forfaitaire businesses use G12 and G12BIS, not G50",
        tipAr: "مؤسسات النظام الجزافي تُصرح بـ G12 و G12BIS وليس G50",
        category: "regimes",
        regime: "forfaitaire",
      },
      {
        question: "When do I need to pay IBS advances?",
        questionAr: "متى تستحق تسبيقات IBS؟",
        answer: "IBS advance payments are due March 20, June 20, and November 20.",
        answerAr: "تسبيقات IBS تستحق في: 20 مارس، 20 جوان، 20 نوفمبر. كل تسبيق يعادل 30% من ضريبة IBS عن السنة الماضية.",
        tip: "Use last year's IBS declaration as reference",
        tipAr: "ارجع إلى تصريح IBS للسنة الماضية لحساب مبلغ كل تسبيق",
        category: "deadlines",
        regime: "real",
      },
      {
        question: "How do fixed fines work for G12BIS?",
        questionAr: "كيف تُطبق الغرامات الثابتة على G12BIS؟",
        answer: "G12BIS fixed fines: 2,500 DZD (1 month), 5,000 DZD (2 months), 10,000 DZD (3+ months).",
        answerAr: "عند التأخير في G12BIS: 2,500 دج (تأخير شهر)، 5,000 دج (شهرين)، 10,000 دج (أكثر من شهرين). هذه مبالغ ثابتة.",
        tip: "File on time to avoid these fixed penalties",
        tipAr: "الإيداع في الوقت المحدد يتجنب هذه الغرامات الثابتة",
        category: "penalties",
        regime: "forfaitaire",
      },
      {
        question: "What is the deadline for the annual G4 balance sheet?",
        questionAr: "ما هو آخر أجل لتقديم الميزانية الجبائية G4؟",
        answer: "The annual G4 balance sheet must be filed before April 30 of the following year.",
        answerAr: "الميزانية الجبائية السنوية G4 يجب إيداعها قبل 30 أفريل من السنة الموالية.",
        tip: "Start preparing your G4 in January",
        tipAr: "ابدأ إعداد الميزانية الجبائية من شهر جانفي لتجنب الضغط",
        category: "declarations",
        regime: "real",
      },
      {
        question: "What is TVA and who pays it?",
        questionAr: "ما هي TVA ومن يدفعها؟",
        answer: "TVA is Algeria's VAT at 19%, paid monthly by real regime enterprises via G50.",
        answerAr: "TVA (الضريبة على القيمة المضافة) معدلها 19% وتُدفع شهرياً عبر تصريح G50 من قبل مؤسسات النظام الحقيقي.",
        tip: "TVA collected minus TVA paid on purchases = TVA to remit",
        tipAr: "TVA المحصلة من الزبائن ناقص TVA المدفوعة على المشتريات = TVA الواجب دفعها",
        category: "taxes",
        regime: "real",
      },
      {
        question: "What happens if I miss a CNAS declaration?",
        questionAr: "ماذا يحدث إذا تأخرت في تصريح CNAS؟",
        answer: "Late CNAS declarations incur a 10% penalty on contributions due.",
        answerAr: "التأخر في التصريح السنوي CNAS يُطبق غرامة 10% من اشتراكات الضمان الاجتماعي المستحقة.",
        tip: "CNAS annual declaration is due January 31",
        tipAr: "التصريح السنوي CNAS يستحق قبل 31 جانفي من كل سنة",
        category: "obligations",
        regime: "all",
      },
      {
        question: "How do I control liquidity in my business?",
        questionAr: "كيف أتحكم في السيولة داخل مؤسستي؟",
        answer: "Track all income and expenses daily, and monitor the gap between collection and payment.",
        answerAr: "احرص على تتبع كل المداخيل والمصاريف يومياً، وراقب الفجوة بين التحصيل والدفع. حاول دائماً أن يكون لديك رصيد يغطي 3 أشهر من المصاريف.",
        tip: "Offer slight discounts for early paying customers",
        tipAr: "قدّم خصومات بسيطة للزبائن الذين يدفعون مبكرا",
        category: "cash_flow",
        regime: "all"
      },
      {
        question: "What is the difference between turnover and total sales?",
        questionAr: "ما الفرق بين رقم الاعمال و مجموع المبيعات؟",
        answer: "Turnover is the total sales achieved. Profit = Turnover - Expenses.",
        answerAr: "رقم الاعمال هو مجموع المبيعات التي تحققها المؤسسة. الربح = رقم الاعمال – المصاريف.",
        tip: "",
        tipAr: "",
        category: "cash_flow",
        regime: "all"
      },
      {
        question: "How do I set the right price for my product or service?",
        questionAr: "كيف أحدد سعر المنتج أو الخدمة؟",
        answer: "Price must cover costs + profit margin + taxes. Don't just rely on competitors' prices.",
        answerAr: "السعر يجب أن يغطي التكاليف + هامش الربح + الضرائب، لا تعتمد فقط على أسعار المنافسين.",
        tip: "Review your prices every 6 months depending on cost changes",
        tipAr: "راجع أسعارك كل 6 أشهر حسب تغير التكاليف",
        category: "pricing",
        regime: "all"
      },
      {
        question: "Do I need an accountant even for a small project?",
        questionAr: "هل أحتاج إلى محاسب رغم صغر المشروع؟",
        answer: "Yes, even small projects need accounting to avoid mistakes and penalties.",
        answerAr: "نعم، حتى المشاريع الصغيرة تحتاج إلى تنظيم محاسبي لتفادي الأخطاء والغرامات.",
        tip: "Use a simple accounting software for daily entries",
        tipAr: "استخدم برنامج محاسبة بسيط لتسجيل العمليات يومياً",
        category: "accounting",
        regime: "all"
      },
      {
        question: "Can I use my personal bank account for my business?",
        questionAr: "هل يمكنني استخدام حسابي الشخصي للمشروع؟",
        answer: "Not recommended, it causes accounting chaos and tracking difficulties.",
        answerAr: "لا يُنصح بذلك، لأنه يسبب فوضى محاسبية وصعوبات في التتبع.",
        tip: "Open a dedicated bank account for the business",
        tipAr: "افتح حساباً بنكياً خاصاً بالمؤسسة فقط",
        category: "accounting",
        regime: "all"
      },
      {
        question: "How do I lower costs without affecting quality?",
        questionAr: "كيف أخفض التكاليف بدون التأثير على الجودة؟",
        answer: "Review suppliers, negotiate prices, and reduce unnecessary expenses.",
        answerAr: "راجع الموردين، تفاوض على الأسعار، وقلل المصاريف غير الضرورية.",
        tip: "Focus on expenses that do not directly add value to the business",
        tipAr: "ركز على المصاريف التي لا تضيف قيمة مباشرة للعمل",
        category: "expenses",
        regime: "all"
      },
      {
        question: "How do I avoid problems with taxes?",
        questionAr: "كيف أتجنب المشاكل مع الضرائب؟",
        answer: "Declare on time and keep all invoices and documents.",
        answerAr: "التصريح في الوقت المحدد والاحتفاظ بكل الفواتير والوثائق.",
        tip: "Set a monthly or quarterly reminder for tax declarations",
        tipAr: "ضع تذكيراً شهرياً أو فصلياً للتصريحات الجبائية",
        category: "taxes",
        regime: "all"
      },
      {
        question: "When should I decide to expand my business?",
        questionAr: "متى أقرر توسيع نشاطي؟",
        answer: "When you have a stable cash flow and increasing demand for your services.",
        answerAr: "عندما يكون لديك تدفق نقدي مستقر وطلب متزايد على خدماتك.",
        tip: "Don't expand rapidly before confirming financial stability",
        tipAr: "لا تتوسع بسرعة قبل التأكد من الاستقرار المالي",
        category: "growth",
        regime: "all"
      },
      {
        question: "Is a loan a good idea?",
        questionAr: "هل القرض فكرة جيدة؟",
        answer: "Yes, if used for investment and not for covering losses.",
        answerAr: "نعم إذا استُخدم في الاستثمار وليس في تغطية الخسائر.",
        tip: "Ensure the return on investment is greater than the cost of the loan",
        tipAr: "تأكد أن العائد من الاستثمار أكبر من تكلفة القرض",
        category: "finance",
        regime: "all"
      },
      {
        question: "Should I make an annual budget?",
        questionAr: "هل يجب أن أضع ميزانية سنوية؟",
        answer: "Yes, a budget helps you control expenses and set goals.",
        answerAr: "نعم، الميزانية تساعدك على التحكم في المصاريف وتحديد الأهداف.",
        tip: "Review your budget every month and adjust it according to reality",
        tipAr: "راجع ميزانيتك كل شهر وعدّلها حسب الواقع",
        category: "finance",
        regime: "all"
      },
      {
        question: "What is the most common financial mistake business owners make?",
        questionAr: "ما أكثر خطأ مالي يقع فيه أصحاب المشاريع؟",
        answer: "Not tracking small expenses which accumulate and cause huge problems.",
        answerAr: "عدم تتبع المصاريف الصغيرة التي تتراكم وتسبب مشاكل كبيرة.",
        tip: "",
        tipAr: "",
        category: "finance",
        regime: "all"
      },
      {
        question: "Are profits always added to the capital?",
        questionAr: "هل الأرباح تضاف دائما الى الراس المال؟",
        answer: "Profits are added to capital only if they are not withdrawn.",
        answerAr: "تضاف الأرباح الى راس المال فقط اذا لم يتم سحبها، اما الأرباح المسحوبة فلا تدخل الى حساب الرأس مال.",
        tip: "",
        tipAr: "",
        category: "finance",
        regime: "all"
      },
      {
        question: "Does a loss reduce the capital?",
        questionAr: "هل الخسارة تنقص من راس المال؟",
        answer: "Yes, a loss reduces capital because it reflects a decline in business value.",
        answerAr: "نعم، الخسارة تنقص من راس المال لانها تعكس قيمة تراجع المشروع.",
        tip: "",
        tipAr: "",
        category: "finance",
        regime: "all"
      },
      {
        question: "Which expenses are taken into account in financial accounts?",
        questionAr: "أي المصاريف تؤخد بعين الاعتبار في الحسابات المالية؟",
        answer: "Only expenses related to the activity, not personal expenses of the owner.",
        answerAr: "تأخد فقط المصاريف المرتبطة بالنشاط ولا تحتسب المصاريف الشخصية المتعلقة بصاحب المؤسسة.",
        tip: "",
        tipAr: "",
        category: "accounting",
        regime: "all"
      },
      {
        question: "When is my financial situation considered dangerous?",
        questionAr: "متى اعتبر وضعي المالي خطير؟",
        answer: "When expenses are greater than income and debts exceed repayment capacity.",
        answerAr: "سيعتبر الوضع خطيرا عندما تكون المصاريف اكبر من المداخيل والديون اكبر من القدرة على السداد.",
        tip: "",
        tipAr: "",
        category: "finance",
        regime: "all"
      },
      {
        question: "Should taxes be counted as expenses?",
        questionAr: "هل يجب احتساب الضرائب ضمن المصاريف؟",
        answer: "Yes, taxes are mandatory expenses and must be considered when evaluating real profit.",
        answerAr: "نعم، الضرائب تعتبر مصاريف اجبارية ويجب اخذها بعين الاعتبار عند تقييم الربح الحقيقي.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "How to handle a penalty exemption in accounting and tax terms?",
        questionAr: "كيف يمكن التعامل مع الاعفاء من الغرامة المتعلقة بالضرائب من منظور المحاسبة والضرائب؟",
        answer: "Late payment penalties are legal sanctions and must be recorded as non-deductible expenses.",
        answerAr: "يجب التأكيد أولا على ان غرامة التاخير في السداد عقوبة قانونية وعليه يجب تسجيلها في الحسابات كخصم على الحساب رقم 656 'الغرامات والعقوبات' ثم اداعها الى الجدول رقم 9 من الإقرار الضريبي لانها غير قابلة للخصم.",
        tip: "",
        tipAr: "",
        category: "accounting",
        regime: "all"
      },
      {
        question: "What are non-deductible tax expenses?",
        questionAr: "ماهي المصاريف الغير قابلة للخصم ضريبيا؟",
        answer: "Expenses not recognized by tax administration, like penalties and fines.",
        answerAr: "هي المصاريف التي لا تعترف بها الإدارة الضريبية، مثل الغرامات والعقوبات، ويتم اضافتها الى الربح المحاسبي عند حساب الربح الجبائي.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "What is depreciation (Amortissement)?",
        questionAr: "ما هو الاهتلاك؟",
        answer: "Distributing the cost of a fixed asset over its useful life.",
        answerAr: "هو توزيع تكلفة الأصل الثابت على مدة استعماله، ويعتبر من المصاريف القابلة للخصم اذا كان مطابقا للقوانين المحاسبية والجبائية.",
        tip: "",
        tipAr: "",
        category: "accounting",
        regime: "all"
      },
      {
        question: "How are expenses from a previous year recorded in the current year treated?",
        questionAr: "كيف تتم معالجة مصاريف تخص سنة سابقة تم تسجيلها خلال السنة الحالية؟ وهل تخصم ضريبيا؟",
        answer: "Treated as exceptional expenses, and not tax-deductible unless justified by legal documents.",
        answerAr: "تعالج هذه المصاريف محاسبيا كأعباء استثنائية تخص سنوات سابقة، أما الجبائية فلا تخصم اذا لم تسجل في سنتها الاصلية، الا اذا تم تبريرها بوثائق قانونية. وبالتالي يتم إعادة دمجها جبائيا ضمن النتيجة الخاضعة للضريبة.",
        tip: "",
        tipAr: "",
        category: "accounting",
        regime: "all"
      },
      {
        question: "How to handle differences between accounting and tax depreciation?",
        questionAr: "ماهي معالجة الفروقات بين الاهتلاك المحاسبي والاهتلاك الجبائي؟",
        answer: "If accounting depreciation > tax depreciation, the difference is reintegrated.",
        answerAr: "اذا كان الاهتلاك المحاسبي اكبر من الجبائي يتم إعادة دمج الفرق، اما اذا كان اقل يمكن تسجيل اهتلاك تكميلي وذلك من اجل الوصول الى النتيجة الجبائية الصحيحة.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "How are fines and penalties treated for tax purposes?",
        questionAr: "كيف تعالج الغرامات والعقوبات جبائيا؟",
        answer: "Recorded as expenses but non-deductible, reintegrated into taxable profit.",
        answerAr: "الغرامات والعقوبات تسجل محاسبيا كمصاريف لكنها غير قابلة للخصم ضريبيا، وبالتالي يتم إعادة دمجها في الربح الخاضع للضريبة.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "How are provisions treated for tax purposes?",
        questionAr: "ماهي معالجة المؤونات من الناحية الجبائية؟",
        answer: "Accepted if justified and accurate; otherwise, reintegrated.",
        answerAr: "تقبل المؤونات جبائيا اذا كانت مبررة ومحددة بدقة، اما المؤونات غير المبررة او العامة يتم إعادة دمجها في النتيجة الجبائية.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "How to deal with non-taxable products?",
        questionAr: "كيف يتم التعامل مع المنتجات الغير خاضعة للضريبة؟",
        answer: "Recorded as revenue but deducted for tax purposes.",
        answerAr: "المنتجات المعافاة تسجل محاسبيا ضمن الإيرادات، لكن يتم خصمها جبائيا للوصول الى الربح الخاضع للضريبة.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "How are previous years' losses treated?",
        questionAr: "ماهي طريقة معالجة خسائر السنوات السابقة؟",
        answer: "Carried forward and deducted from future profits.",
        answerAr: "يمكن ترحيل الخسائر وخصمها من أرباح السنوات اللاحقة وفقا للقانون، وبذلك تنخفض القاعدة الضريبية للسنة الحالية.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "How is the tax result calculated from the accounting result?",
        questionAr: "كيف يتم حساب النتيجة الجبائية انطلاقا من النتيجة المحاسبية؟",
        answer: "Tax Result = Accounting Result + Reintegrations - Deductions.",
        answerAr: "يتم ذلك وفقا المعادلة التالية: النتيجة الجبائية = النتيجة المحاسبية + إعادة الادماج – الخصومات. حيث تشمل إعادة الادماج المصاريف الغير قابلة للخصم، والخصومات تشمل الإيرادات المعفاة والخسائر القابلة للترحيل.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      },
      {
        question: "How are unjustified expenses treated?",
        questionAr: "ماهي معالجة الأعباء غير المبررة بالوثائق؟",
        answer: "Not accepted for tax purposes and reintegrated.",
        answerAr: "الأعباء التي لا تتوفر على وثائق الاثبات لا تقبل جبائيا، ويتم إعادة دمجها بالكامل في الربح الخاضع للضريبة.",
        tip: "",
        tipAr: "",
        category: "taxes",
        regime: "all"
      }
    ]);
    console.log("Created knowledge items");
  }

  // News
  const existingNews = await db.select().from(newsTable);
  if (existingNews.length === 0) {
    await db.insert(newsTable).values([
      {
        title: "New tax deadlines for 2025 announced by DGI",
        titleAr: "الإدارة العامة للضرائب تُعلن عن المواعيد الجبائية لسنة 2025",
        content: "The General Directorate of Taxes has released the official tax calendar for fiscal year 2025.",
        contentAr: "أعلنت المديرية العامة للضرائب عن التقويم الجبائي الرسمي للسنة المالية 2025.",
        category: "deadlines",
        publishedAt: new Date("2025-01-10"),
      },
      {
        title: "IFU Threshold Maintained at 30 Million DZD for 2025",
        titleAr: "الحد الأقصى للنظام الجزافي يبقى 30 مليون دج لسنة 2025",
        content: "The revenue threshold for the forfaitaire regime remains at 30 million DZD.",
        contentAr: "أكدت وزارة المالية أن حد رقم الأعمال للنظام الجزافي يبقى عند 30 مليون دينار جزائري.",
        category: "legislation",
        publishedAt: new Date("2025-01-15"),
      },
      {
        title: "Electronic Filing: G50 Online Now Mandatory",
        titleAr: "التصريح الإلكتروني بـ G50 أصبح إلزامياً عبر منصة Jibayatic",
        content: "All enterprises must file G50 declarations electronically through Jibayatic.",
        contentAr: "أعلنت إدارة الضرائب عن إلزامية التصريح الإلكتروني لتصريح G50 عبر منصة Jibayatic.",
        category: "digital",
        publishedAt: new Date("2025-02-01"),
      },
      {
        title: "New IRG Rates Apply for 2025 Salary Declarations",
        titleAr: "تطبيق معدلات IRG الجديدة على تصريحات الرواتب لسنة 2025",
        content: "Updated IRG brackets for salaries have been applied starting January 2025.",
        contentAr: "دخلت شرائح IRG الجديدة على الرواتب حيز التطبيق اعتباراً من جانفي 2025.",
        category: "legislation",
        publishedAt: new Date("2025-01-20"),
      },
      {
        title: "Reminder: G50 Declaration Due March 20",
        titleAr: "تذكير: آخر أجل لإيداع G50 هو 20 مارس",
        content: "Real regime enterprises must submit their G50 for February 2025 by March 20.",
        contentAr: "تُذكّر المديرية العامة للضرائب مؤسسات النظام الحقيقي بأن آخر أجل لإيداع G50 عن فيفري 2025 هو 20 مارس 2025.",
        category: "reminder",
        publishedAt: new Date("2025-03-15"),
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
