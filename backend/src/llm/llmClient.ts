import { llm } from "./index";
import { ConversationManager } from "./historyManager";
import { LLMRequest } from "./types";

// Initialize a manager with a limit of 10 messages
const chatHistory = new ConversationManager(10);

const ECOMMERCE_SYSTEM_PROMPT = "You are a helpful support agent for a small e‑commerce store. Answer clearly and concisely.";

/**
 * Automatically maintains context between calls
 */
export async function handleUserQuery(userQuery: string): Promise<string> {
  // 1. Get history from manager
  const history = chatHistory.getHistory();

  const request: LLMRequest = {
    system: ECOMMERCE_SYSTEM_PROMPT,
    history: history,
    prompt: userQuery
  };

  try {
    const response = await llm.generate(request);

    // 2. Save both the user's question and the LLM's answer to history
    chatHistory.addMessage("user", userQuery);
    chatHistory.addMessage("assistant", response.text);

    return response.text;
  } catch (error) {
    console.error("Session Error:", error);
    throw error;
  }
}