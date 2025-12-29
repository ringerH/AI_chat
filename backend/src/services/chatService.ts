import { withTransaction } from "../persistence/transactions";
import {
  insertUserMessage,
  insertAssistantPlaceholder,
  completeAssistantMessage,
  failAssistantMessage
} from "../persistence/repositories/messageRepo";
import { createConversation } from "../persistence/repositories/conversationRepo";
import { llm } from "../llm";


export async function handleUserMessage(
  sessionId: string | undefined,
  text: string,
  clientMessageId: string
): Promise<string> {

  const result = await withTransaction(async (client) => {
    
    const conversationId =
      sessionId ?? (await createConversation(client));

    
    const userMessageId = await insertUserMessage(
      client,
      conversationId,
      text,
      clientMessageId
    );

    
    if (!userMessageId) {
      return {
        conversationId,
        assistantMessageId: null
      };
    }

    
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

  
  if (!assistantMessageId) {
    return conversationId;
  }

  
  try {
    const response = await llm.generate({
      prompt: text
    });

    await withTransaction(client =>
      completeAssistantMessage(
        client,
        assistantMessageId,
        response.text
      )
    );
  } catch (err: any) {
    const message =
      err instanceof Error ? err.message : "Unknown LLM error";

    await withTransaction(client =>
      failAssistantMessage(
        client,
        assistantMessageId,
        message
      )
    );
  }

  return conversationId;
}
