# Chat Application

A full-stack chat application that allows users to send messages, receive assistant responses, and resume conversations reliably across reloads and retries.

The application is built to behave predictably under real-world conditions such as network retries, slow responses, and partial failures, while keeping the user experience simple and transparent.

---

## Features

- Send messages and receive assistant replies
- Conversations persist across page reloads
- Clear indication of message states (replying, failed, completed)
- Retry failed assistant responses safely
- Start a new conversation explicitly
- No duplicate messages even under retries or refreshes

---

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express
- PostgreSQL

**Frontend**
- SvelteKit
- Store-based state management

---

## How the Application Works

1. A user sends a message from the frontend.
2. The backend immediately persists the message and returns a conversation ID.
3. An assistant reply is generated asynchronously.
4. The UI updates automatically when the reply is ready.
5. Reloading the page restores the entire conversation.

The database acts as the source of truth for all messages and conversation state.

---

## Conversation & Message Model

Each conversation contains a sequence of messages:

- **User messages** — stored immediately
- **Assistant messages** — progress through clear states

Assistant message states:

| State | Meaning |
|-----|--------|
| `pending` | Reply is being generated |
| `completed` | Reply successfully generated |
| `failed` | Reply failed; error recorded |

These states are visible in the UI so users always know what is happening.

---

## Retry Behavior

If an assistant response fails:
- The failure is shown in the UI
- A retry button is provided
- Retrying does **not** create duplicate messages

This ensures retries are safe and predictable even if requests are repeated.

---

## Session Handling

- Each conversation has a session ID
- The frontend stores and reuses the session automatically
- Reloading the page restores the active conversation
- A new conversation is started explicitly by the user

---

## Data Integrity Guarantees

The application ensures:
- Messages are never duplicated
- Partial writes are avoided
- Retried requests do not corrupt conversation history
- Reloads always reconstruct the correct state

These guarantees are enforced through database constraints and transactional writes.

---

## Auto-Refresh Behavior

While an assistant reply is being generated:
- The frontend periodically checks for updates
- Polling stops automatically once the reply resolves
- No unnecessary background requests are made

This keeps the UI responsive without complex real-time infrastructure.

---

## What This Application Focuses On

- Delivering a functional chat experience
- Making message state explicit to users
- Handling retries and failures gracefully
- Keeping frontend and backend responsibilities clear

---

## What Is Intentionally Out of Scope

- Authentication
- Streaming responses
- WebSockets
- UI styling or polish

These can be added independently without changing the core architecture.

---

## Summary

This project delivers a complete chat application with:
- persistent conversations
- clear assistant response states
- safe retries
- predictable behavior under reloads and failures

The design choices prioritize reliability and clarity while keeping the application simple to use and extend.
