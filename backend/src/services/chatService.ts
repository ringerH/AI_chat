import { withTransaction } from "../persistence/transactions";
import {
  insertUserMessage,
  insertAssistantPlaceholder,
  completeAssistantMessage,
  failAssistantMessage
} from "../persistence/repositories/messageRepo";
import { createConversation } from "../persistence/repositories/conversationRepo";
import { callLLM } from "../llm/llmClient";

/**
 * Milestone 3
 * - session ownership
 * - idempotent message posting
 * - failure-first LLM handling
 */
export async function handleUserMessage(
  sessionId: string | undefined,
  text: string,
  clientMessageId: string
): Promise<string> {

  const result = await withTransaction(async (client) => {
    // ensure conversation exists
    const conversationId =
      sessionId ?? (await createConversation(client));

    // idempotent user message insert
    const userMessageId = await insertUserMessage(
      client,
      conversationId,
      text,
      clientMessageId
    );

    // retry detected → do nothing further
    if (!userMessageId) {
      return {
        conversationId,
        assistantMessageId: null
      };
    }

    // create assistant placeholder ONLY once
    const assistantMessageId = await insertAssistantPlaceholder(
      client,
      conversationId,
      userMessageId
    );

    return {
      conversationId,
      assistantMessageId
    };
  });

  const { conversationId, assistantMessageId } = result;

  // IMPORTANT:
  // If this was a retry, assistantMessageId will be null
  if (!assistantMessageId) {
    return conversationId;
  }

  // LLM invocation happens OUTSIDE transaction
  try {
    const reply = await callLLM(text);

    await withTransaction(client =>
      completeAssistantMessage(client, assistantMessageId, reply)
    );
  } catch (err: any) {
    await withTransaction(client =>
      failAssistantMessage(client, assistantMessageId, err.message)
    );
  }

  return conversationId;
}
