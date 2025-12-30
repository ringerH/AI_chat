import { Router } from "express";
import { getConversationHistory } from "../../services/messageService";
import { handleUserMessage } from "../../services/chatService";

export const chatRouter = Router();

chatRouter.get("/history/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await getConversationHistory(sessionId);
    res.json({ messages });
  } catch (e) {
    console.error("History fetch failed:", e);
    res.status(500).json({ error: "Internal error" });
  }
});


chatRouter.post("/message", async (req, res) => {
  const { message, sessionId, clientMessageId } = req.body;

  if (!message || !message.trim()) {
    res.status(400).json({ error: "Invalid message" });
    return;
  }

  if (!clientMessageId) {
    res.status(400).json({ error: "clientMessageId is required" });
    return;
  }

  try {
    const conversationId = await handleUserMessage(
      sessionId,
      message.trim(),
      clientMessageId
    );

    res.json({ sessionId: conversationId });
  } catch (e) {
    console.error("Message handling failed:", e);
    res.status(500).json({ error: "Failed to process message" });
  }
});