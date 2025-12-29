import { InvalidMessageError } from "./errors";

export function validateMessage(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) throw new InvalidMessageError();
  if (trimmed.length > 5000) return trimmed.slice(0, 5000);
  return trimmed;
}
