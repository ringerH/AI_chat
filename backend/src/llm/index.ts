import { LLMAdapter } from "./llmAdapter";
import { MockLLMProvider } from "./providers/mock";

// Swap provider here ONLY
export const llm: LLMAdapter = new MockLLMProvider();
