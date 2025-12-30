import { LLMAdapter } from "../llmAdapter";
import { LLMRequest, LLMResponse } from "../types";
import { LLMError } from "../errors";

export class MockLLMProvider implements LLMAdapter {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const start = Date.now();
    await new Promise(resolve => setTimeout(resolve, 700));

    if (request.prompt.includes("fail")) {
      throw new LLMError("provider", "Simulated LLM failure", true);
    }

    const historyCount = request.history?.length ?? 0;
    const persona = request.system ? "Agent" : "Bot";

    return {
      text: `[${persona} with ${historyCount} context turns]: ${request.prompt}`,
      latencyMs: Date.now() - start
    };
  }
}