export type LLMRequest = {
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
  