import { validateMessage } from "../domain/message";
import { withTransaction } from "../persistence/transactions";
import { createConversation } from "../persistence/repositories/conversationRepo";
import { createMessage } from "../persistence/repositories/messageRepo";
import { getMessagesByConversation } from "../persistence/repositories/messageRepo";

export async function acceptUserMessage(
  rawText: string,
  sessionId?: string
): Promise<string> {
  const text = validateMessage(rawText);

  return withTransaction(async (client) => {
    const conversationId = sessionId ?? (await createConversation(client));
    await createMessage(client, conversationId, text);
    return conversationId;
  });
}

export async function getConversationHistory(sessionId: string) {
  return withTransaction(async (client) => {
    return getMessagesByConversation(client, sessionId);
  });
}