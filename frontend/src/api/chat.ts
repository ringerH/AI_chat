import { get } from "svelte/store";
import { sessionId } from "../state/sessionStore";
import { conversation } from "../state/conversationStore";

export async function postMessage(text: string) {
  if (!text || !text.trim()) {
    throw new Error("Cannot send empty message");
  }

  const clientMessageId = crypto.randomUUID();

  const body = {
    message: text.trim(),
    sessionId: get(sessionId),
    clientMessageId
  };

  const res = await fetch("/chat/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  const data = await res.json();

  // First message → backend creates conversation
  if (!get(sessionId)) {
    sessionId.set(data.sessionId);
  }

  return {
    sessionId: data.sessionId,
    clientMessageId
  };
}

/**
 * Fetch conversation history.
 * DB is the source of truth.
 */
export async function fetchHistory() {
  const sid = get(sessionId);
  if (!sid) return [];

  const res = await fetch(`/chat/history/${sid}`);
  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }

  const data = await res.json();
  conversation.set(data.messages);
  return data.messages;
}
export async function retryMessage(
  text: string,
  clientMessageId: string
) {
  const body = {
    message: text,
    sessionId: get(sessionId),
    clientMessageId // SAME ID → idempotent
  };

  const res = await fetch("/chat/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Retry failed");
  }

  return res.json();
}
