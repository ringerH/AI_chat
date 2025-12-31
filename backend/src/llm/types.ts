export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMRequest = {
  
  system?: string;

 
  history?: LLMMessage[];

 
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
  