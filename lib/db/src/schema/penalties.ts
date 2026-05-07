import { pgTable, serial, timestamp, real, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const penaltiesTable = pgTable("penalties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  declarationType: text("declaration_type").notNull(),
  regime: text("regime").notNull(),
  dueDate: text("due_date").notNull(),
  paymentDate: text("payment_date").notNull(),
  taxAmount: real("tax_amount").notNull(),
  penaltyRate: real("penalty_rate").notNull(),
  penaltyAmount: real("penalty_amount").notNull(),
  totalDue: real("total_due").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPenaltySchema = createInsertSchema(penaltiesTable).omit({ id: true, createdAt: true });
export type InsertPenalty = z.infer<typeof insertPenaltySchema>;
export type Penalty = typeof penaltiesTable.$inferSelect;
