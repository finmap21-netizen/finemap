import { Router } from "express";

const chatRouter = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDnuqQli7ssO8eLG2MUNJ8MOjUNFEXjAho";

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(500).json({ error: "Failed to communicate with AI model" });
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من فهم طلبك.";

    res.json({ reply: aiMessage });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { chatRouter };
