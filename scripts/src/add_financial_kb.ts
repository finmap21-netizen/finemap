import { db, knowledgeTable } from "@workspace/db";

async function run() {
  const data = [
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
  ];

  await db.insert(knowledgeTable).values(data);
  console.log("Successfully inserted " + data.length + " financial information entries!");
  process.exit(0);
}

run().catch(console.error);
