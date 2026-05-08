import { Router } from "express";
import { db, conversations, messages } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../../lib/auth";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { CreateAnthropicConversationBody, SendAnthropicMessageBody } from "@workspace/api-zod";

const router = Router();

const SYSTEM_PROMPT = `أنت مساعد ضريبي ومالي متخصص في قوانين الضرائب الجزائرية والمحاسبة للمؤسسات الصغيرة والمتوسطة (PME/PMI).

تخصصاتك:
- قانون الضرائب الجزائري: G50، G12، G12BIS، IBS، IRG، CNAS، TVA
- الأنظمة الجبائية: النظام الحقيقي، النظام الحقيقي المبسط، النظام الجزافي (IFU)
- المواعيد الضريبية وحساب الغرامات
- الضريبة على القيمة المضافة TVA ومعدلاتها
- قانون العمل والضمان الاجتماعي CNAS
- المحاسبة العامة وإعداد الميزانيات

قواعد المحادثة:
- أجب دائماً بالعربية ما لم يطلب المستخدم غير ذلك
- كن دقيقاً ومحدداً في الأرقام والتواريخ والنسب
- إذا لم تكن متأكداً من معلومة، أخبر المستخدم بذلك
- أحل دائماً إلى المصدر القانوني عند الإمكان (قانون الضرائب المباشرة، قانون الرسوم على رقم الأعمال، إلخ)
- ذكّر المستخدم دائماً باستشارة محاسب قانوني للقرارات المهمة`;

router.get("/anthropic/conversations", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const convs = await db.select().from(conversations).orderBy(desc(conversations.createdAt));
  res.json(convs.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

router.post("/anthropic/conversations", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const parsed = CreateAnthropicConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "عنوان المحادثة مطلوب" });
    return;
  }
  const [conv] = await db.insert(conversations).values({ title: parsed.data.title }).returning();
  res.status(201).json({ ...conv, createdAt: conv.createdAt.toISOString() });
});

router.get("/anthropic/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) { res.status(404).json({ error: "المحادثة غير موجودة" }); return; }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  res.json({
    ...conv,
    createdAt: conv.createdAt.toISOString(),
    messages: msgs.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
  });
});

router.delete("/anthropic/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(conversations).where(eq(conversations.id, id));
  res.sendStatus(204);
});

router.get("/anthropic/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  res.json(msgs.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

router.post("/anthropic/conversations/:id/messages", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = SendAnthropicMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "محتوى الرسالة مطلوب" }); return; }

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) { res.status(404).json({ error: "المحادثة غير موجودة" }); return; }

  await db.insert(messages).values({ conversationId: id, role: "user", content: parsed.data.content });

  const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));

  const chatMessages = history.map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: chatMessages,
    });

    const assistantContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const [assistantMsg] = await db
      .insert(messages)
      .values({ conversationId: id, role: "assistant", content: assistantContent })
      .returning();

    res.json({ ...assistantMsg, createdAt: assistantMsg.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "حدث خطأ في الاتصال بالذكاء الاصطناعي" });
  }
});

export default router;
