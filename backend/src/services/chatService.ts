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

const SYSTEM_PROMPT = `You are a helpful support agent for "Acme Electronics India" - a small e-commerce store.

**STORE INFORMATION:**

**Shipping Policy:**
- FREE standard shipping on Pan-India orders over ₹1,499.
- Standard shipping (4-7 business days): ₹99 for orders under ₹1,499.
- Express delivery (1-2 business days): ₹199 (Select metros only).
- Shipping covers all 28 states and 8 Union Territories.
- Orders before 1:00 PM IST ship same day.

**Return & Refund Policy:**
- 30-day "No Questions Asked" guarantee.
- Items must have original brand box and MRP tags.
- Refunds processed in 5-7 business days.
- FREE pickup for defective items; ₹150 fee for others.

**Support Hours:**
- Mon-Sat: 10:00 AM - 7:00 PM IST (Sunday Closed).
- Email: support@acmeelectronics.in
- Toll-Free: 1800-123-ACME (1800-123-2263).

**RESPONSE GUIDELINES:**
1. **Be Structured**: Use bullet points and bold text for key details like prices, dates, or contact info.
2. **Use Headers**: If answering multiple parts of a question, use small headers (e.g., ### Shipping).
3. **Be Concise**: Do not write long paragraphs. Break information into digestible chunks.
4. **Unknown Info**: If you don't know an answer, politely direct them to the toll-free number.

Answer customer questions using the structure above.`;

const MAX_HISTORY_MESSAGES = 6;

export async function handleUserMessage(
  sessionId: string | undefined,
  text: string,
  clientMessageId: string
): Promise<{ sessionId: string; reply: string | null }> {

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
    return { sessionId: conversationId, reply: null };
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

  let replyText: string | null = null;

  try {
    const response = await llm.generate({
      system: SYSTEM_PROMPT,
      history,
      prompt: text
    });

    replyText = response.text;

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

  return {
    sessionId: conversationId,
    reply: replyText
  };
}