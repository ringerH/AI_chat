export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMRequest = {
  /**
   * Fixed system instruction (optional)
   */
  system?: string;

  /**
   * Bounded conversation history
   */
  history?: LLMMessage[];

  /**
   * Current user prompt
   */
  prompt: string;
};

export type LLMResponse = {
  text: string;
  latencyMs: number;
};

  export type LLMErrorType =
    | "timeout"
    | "rate_limit"
    | "network"
    | "provider"
    | "unknown";
  