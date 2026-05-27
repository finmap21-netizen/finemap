import { Router } from "express";
import { requireAuth } from "../lib/auth";

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAZvS2ciyKwkbEqS6bvRU0VNsTrND23nCM";

router.post("/invoices/analyze", requireAuth, async (req, res): Promise<void> => {
  try {
    const { fileBase64, mimeType } = req.body;

    if (!fileBase64 || !mimeType) {
      res.status(400).json({ error: "fileBase64 and mimeType are required" });
      return;
    }

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: fileBase64.split(",").pop() || fileBase64,
              },
            },
            {
              text: "قم بقراءة هذه الفاتورة. استخرج المعلومات التالية وأعدها في شكل JSON فقط بدون أي نص إضافي (لا تستخدم markdown مثل ```json): {\"date\": \"...\", \"fournisseur\": \"...\", \"ht\": 123.45, \"tva\": 12.34, \"ttc\": 135.79}. يجب أن تكون ht و tva و ttc أرقاماً. إذا لم تجد القيمة ضع 0 أو نص فارغ.",
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      res.status(500).json({ error: "Failed to analyze invoice" });
      return;
    }

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiMessage) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    try {
      const parsedData = JSON.parse(aiMessage);
      res.json(parsedData);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", aiMessage);
      res.status(500).json({ error: "AI returned invalid JSON" });
    }
  } catch (error) {
    console.error("Invoice Analyzer Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
