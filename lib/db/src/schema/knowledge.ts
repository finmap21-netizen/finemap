import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const knowledgeTable = pgTable("knowledge", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  questionAr: text("question_ar").notNull(),
  answer: text("answer").notNull(),
  answerAr: text("answer_ar").notNull(),
  tip: text("tip"),
  tipAr: text("tip_ar"),
  category: text("category").notNull(),
  regime: text("regime"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKnowledgeSchema = createInsertSchema(knowledgeTable).omit({ id: true, createdAt: true });
export type InsertKnowledge = z.infer<typeof insertKnowledgeSchema>;
export type Knowledge = typeof knowledgeTable.$inferSelect;
