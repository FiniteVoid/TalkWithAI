import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";

export const chatSessionsTable = sqliteTable("chatSessionsTable", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull(),
  topic: text("topic").notNull(),
  timestamp: text("timestamp").default(sql`(CURRENT_TIMESTAMP)`),
});

export const messagesTable = sqliteTable("messagesTable", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull(),
  sessionId: text("sessionId").references(() => chatSessionsTable.id, {
    onDelete: "cascade",
  }),
  senderRole: text("senderRole", { enum: ["SYSTEM", "USER", "ASSISTANT"] }),
  timestamp: text("timestamp").default(sql`(CURRENT_TIMESTAMP)`),
  data: text("data").notNull(),
});

// Relations

export const sessionsRelations = relations(chatSessionsTable, ({ many }) => ({
  chat: many(messagesTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  session: one(chatSessionsTable, {
    fields: [messagesTable.sessionId],
    references: [chatSessionsTable.id],
  }),
}));
