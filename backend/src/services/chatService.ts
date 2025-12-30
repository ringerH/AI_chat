import { withTransaction } from "../persistence/transactions";
import {
  insertUserMessage,
  insertAssistantPlaceholder,
  completeAssistantMessage,
  failAssistantMessage,
  getMessagesByConversation
} from "../persistence/repositories/messageRepo";
import { createConversation } from "../persistence/repositories/conversationRepo";
import { llm } from "../llm";

type DBMessage = {
  sender: "user" | "assistant";
  text: string;
  status?: "pending" | "completed" | "failed";
};

const SYSTEM_PROMPT =
  "You are a helpful support agent for a small e-commerce store. Answer clearly and concisely.";


const MAX_HISTORY_MESSAGES = 6;

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

  const history = await withTransaction(async (client) => {
    const messages = await getMessagesByConversation(
      client,
      conversationId
    );
  
    return messages
      .filter(
        (m: DBMessage) =>
          m.sender === "user" ||
          (m.sender === "assistant" && m.status === "completed")
      )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((m: DBMessage) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));
  });
  

  try {
    const response = await llm.generate({
      system: SYSTEM_PROMPT,
      history,
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
