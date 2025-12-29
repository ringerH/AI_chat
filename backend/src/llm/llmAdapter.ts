import { LLMRequest, LLMResponse } from "./types";

export interface LLMAdapter {
  generate(request: LLMRequest): Promise<LLMResponse>;
}
