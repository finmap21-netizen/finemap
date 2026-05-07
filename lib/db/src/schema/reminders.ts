import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const remindersTable = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  calendarEventId: integer("calendar_event_id").notNull(),
  reminderType: text("reminder_type").notNull(),
  message: text("message").notNull(),
  messageAr: text("message_ar").notNull(),
  isAcknowledged: boolean("is_acknowledged").notNull().default(false),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReminderSchema = createInsertSchema(remindersTable).omit({ id: true, createdAt: true });
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof remindersTable.$inferSelect;
