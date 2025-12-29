import { LLMAdapter } from "../llmAdapter";
import { LLMRequest, LLMResponse } from "../types";
import { LLMError } from "../errors";

export class MockLLMProvider implements LLMAdapter {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const start = Date.now();

    // simulate normal latency
    await new Promise(resolve => setTimeout(resolve, 700));

    if (request.prompt.includes("fail")) {
      throw new LLMError(
        "provider",
        "Simulated LLM failure",
        true
      );
    }

    return {
      text: `Agent: ${request.prompt}`,
      latencyMs: Date.now() - start
    };
  }
}
