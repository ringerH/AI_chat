import { LLMErrorType } from "./types";

export class LLMError extends Error {
  readonly type: LLMErrorType;
  readonly retryable: boolean;

  constructor(
    type: LLMErrorType,
    message: string,
    retryable: boolean
  ) {
    super(message);
    this.type = type;
    this.retryable = retryable;
  }
}
