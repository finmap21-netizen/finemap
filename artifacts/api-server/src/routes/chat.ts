import { Router } from "express";

const chatRouter = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAZvS2ciyKwkbEqS6bvRU0VNsTrND23nCM";

chatRouter.post("/", async (req, res) => {
  try {
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
        parts: { text: "أنت المساعد الذكي الخاص بمنصة FinMap للمؤسسات الصغيرة والمتوسطة في الجزائر. يجب أن تكون إجاباتك دقيقة وتستند إلى قانون الضرائب المباشرة والرسوم المماثلة. تكلم باللغة العربية بأسلوب احترافي وبسيط." }
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
