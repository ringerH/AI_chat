import { get } from "svelte/store";
import { sessionId } from "../state/sessionStore";
import { conversation } from "../state/conversationStore";
import type { Message } from "../state/conversationStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''; 

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function postMessage(text: string, predefinedReply?: string) {
  if (!text || !text.trim()) {
    throw new ValidationError("Cannot send empty message");
  }

  const clientMessageId = crypto.randomUUID();

  const body = {
    message: text.trim(),
    sessionId: get(sessionId),
    clientMessageId,
    predefinedReply
  };

  let res: Response;
  
  try {
    
    res = await fetch(`${API_BASE}/chat/message`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
  } catch (error: any) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new NetworkError("Request timed out. Please try again.");
    }
    if (error.message?.includes("Failed to fetch")) {
      throw new NetworkError("Network error. Please check your connection.");
    }
    throw new NetworkError("Unable to send message. Please try again.");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    
    if (res.status === 400) {
      throw new ValidationError(errorData.error || "Invalid message");
    }
    
    if (res.status >= 500) {
      throw new NetworkError("Server error. Please try again later.");
    }
    
    throw new NetworkError("Failed to send message");
  }

  const data = await res.json();

  if (!get(sessionId)) {
    sessionId.set(data.sessionId);
  }

  return {
    sessionId: data.sessionId,
    clientMessageId
  };
}

export async function fetchHistory(): Promise<Message[]> {
  const sid = get(sessionId);
  if (!sid) return [];

  try {
    
    const res = await fetch(`${API_BASE}/chat/history/${sid}`, {
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Conversation not found");
      }
      throw new Error("Failed to fetch history");
    }

    const data = await res.json();
    const dbMessages: Message[] = data.messages;

    conversation.set(dbMessages);

    return dbMessages;
  } catch (error: any) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new NetworkError("Request timed out while loading history");
    }
    if (error.message?.includes("Failed to fetch")) {
      throw new NetworkError("Network error while loading history");
    }
    throw error;
  }
}

export async function retryMessage(
  text: string,
  clientMessageId: string
) {
  const body = {
    message: text,
    sessionId: get(sessionId),
    clientMessageId
  };

  try {
    
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });

    if (!res.ok) {
      throw new Error("Retry failed");
    }

    return res.json();
  } catch (error: any) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new NetworkError("Retry timed out. Please try again.");
    }
    throw new NetworkError("Retry failed. Please try again.");
  }
}