import { Router } from "express";

const chatRouter = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

chatRouter.post("/", async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ reply: "مفتاح API الخاص بـ Gemini غير مُعرّف. يرجى ضبط متغير البيئة GEMINI_API_KEY." });
    }

    const { messages } = req.body; // Expect an array of objects { role: 'user' | 'model', parts: [{text: "..."}] }
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Prepare history for Gemini
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts || [{ text: msg.content }]
    }));

    // Inject system instructions as the first message or integrate it. 
    // Gemini flash supports system_instruction
    const payload = {
      contents,
      system_instruction: {
        parts: { text: "أنت المساعد الذكي الخاص بمنصة FinMap للمؤسسات الصغيرة والمتوسطة في الجزائر. وظيفتك الإجابة عن أي أسئلة تخص قانون الضرائب المباشرة والرسوم المماثلة بدقة واحترافية. وإذا قام المستخدم برفع صورة لفاتورة أو ملف PDF، قم بقراءته واستخراج المعلومات الأساسية منه (مثل: اسم البائع والمشتري، التاريخ، المبلغ الإجمالي، ومبلغ الـ TVA إن وجد) ثم اشرح كيف يجب التعامل معها ضريبياً بناء على القوانين الجزائرية. تحدث باللغة العربية وبأسلوب بسيط وواضح." }
      },
      generationConfig: {
        temperature: 0.3,
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      if (data?.error?.message?.includes("leaked")) {
        return res.status(500).json({ reply: "عذراً، مفتاح API الخاص بك تم إيقافه من قبل Google لأنه تسرب (Leaked). يرجى إنشاء مفتاح جديد." });
      }
      return res.status(500).json({ error: "Failed to communicate with AI model", details: data.error });
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من فهم طلبك.";

    res.json({ reply: aiMessage });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { chatRouter };
