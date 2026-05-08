import { pgTable, text, serial, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const invoiceRequestsTable = pgTable("invoice_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  activityDescription: text("activity_description").notNull(),
  annualRevenue: real("annual_revenue").notNull(),
  amountDue: real("amount_due").notNull(),
  tvaRate: real("tva_rate").notNull(),
  status: text("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInvoiceRequestSchema = createInsertSchema(invoiceRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoiceRequest = z.infer<typeof insertInvoiceRequestSchema>;
export type InvoiceRequest = typeof invoiceRequestsTable.$inferSelect;
