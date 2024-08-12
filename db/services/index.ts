import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite/next";
import { eq, desc } from "drizzle-orm";
import { chatSessionsTable, messagesTable } from "~/db/schema";

const expoDb = openDatabaseSync("db.db");
const db = drizzle(expoDb);

// Chat Session Services

export async function createChatSession(topic: string) {
  const [newSession] = await db
    .insert(chatSessionsTable)
    .values({ topic })
    .returning();
  return newSession;
}

export async function getChatSessions() {
  return await db
    .select()
    .from(chatSessionsTable)
    .orderBy(desc(chatSessionsTable.timestamp));
}

export async function getChatSessionById(sessionId: string) {
  const [session] = await db
    .select()
    .from(chatSessionsTable)
    .where(eq(chatSessionsTable.id, sessionId));
  return session;
}

export async function updateChatSessionTopic(
  sessionId: string,
  newTopic: string
) {
  const [updatedSession] = await db
    .update(chatSessionsTable)
    .set({ topic: newTopic })
    .where(eq(chatSessionsTable.id, sessionId))
    .returning();
  return updatedSession;
}

export async function deleteChatSession(sessionId: string) {
  await db.delete(chatSessionsTable).where(eq(chatSessionsTable.id, sessionId));
}

// Message Services

export async function addMessage(
  sessionId: string,
  senderRole: "SYSTEM" | "USER" | "ASSISTANT",
  data: string
) {
  const [newMessage] = await db
    .insert(messagesTable)
    .values({ sessionId, senderRole, data })
    .returning();
  return newMessage;
}

export async function getMessagesForSession(sessionId: string) {
  return await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(messagesTable.timestamp);
}

export async function getMessageById(messageId: string) {
  const [message] = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.id, messageId));
  return message;
}

export async function updateMessage(messageId: string, newData: string) {
  const [updatedMessage] = await db
    .update(messagesTable)
    .set({ data: newData })
    .where(eq(messagesTable.id, messageId))
    .returning();
  return updatedMessage;
}

export async function deleteMessage(messageId: string) {
  await db.delete(messagesTable).where(eq(messagesTable.id, messageId));
}

// Combined Services

export async function getChatSessionWithMessages(sessionId: string) {
  const session = await getChatSessionById(sessionId);
  const messages = await getMessagesForSession(sessionId);
  return { ...session, messages };
}

export async function deleteChatSessionWithMessages(sessionId: string) {
  // Due to the cascade delete, this will also delete all associated messages
  await deleteChatSession(sessionId);
}
