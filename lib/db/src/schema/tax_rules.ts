import { pgTable, text, serial, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const taxRulesTable = pgTable("tax_rules", {
  id: serial("id").primaryKey(),
  regime: text("regime").notNull(),
  declarationType: text("declaration_type").notNull(),
  legalDeadlineDescription: text("legal_deadline_description").notNull(),
  legalDeadlineDescriptionAr: text("legal_deadline_description_ar").notNull(),
  penaltySchedule: text("penalty_schedule").notNull(),
  fixedFine: real("fixed_fine"),
  notes: text("notes"),
  notesAr: text("notes_ar"),
  sourceDocument: text("source_document"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTaxRuleSchema = createInsertSchema(taxRulesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTaxRule = z.infer<typeof insertTaxRuleSchema>;
export type TaxRule = typeof taxRulesTable.$inferSelect;
