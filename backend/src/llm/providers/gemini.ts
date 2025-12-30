import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMAdapter } from "../llmAdapter";
import { LLMRequest, LLMResponse } from "../types";
import { LLMError } from "../errors";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

export class GeminiProvider implements LLMAdapter {
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const start = Date.now();

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite"
      });

      const result = await model.generateContent(
        request.prompt
      );

      const text =
        result.response.text();

      if (!text) {
        throw new LLMError(
          "provider",
          "Empty response from Gemini",
          false
        );
      }

      return {
        text,
        latencyMs: Date.now() - start
      };

    } catch (err: any) {
      // Rate limit or quota
      if (
        err.message?.includes("quota") ||
        err.message?.includes("429")
      ) {
        throw new LLMError(
          "rate_limit",
          "Rate limited by Gemini",
          true
        );
      }

      // Network / timeout
      if (err.name === "AbortError") {
        throw new LLMError(
          "timeout",
          "Gemini request timed out",
          true
        );
      }

      throw new LLMError(
        "provider",
        err.message ?? "Gemini provider error",
        false
      );
    }
  }
}
