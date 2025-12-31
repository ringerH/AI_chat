# Acme Support(AI Chat Agent)

A full-stack chat application that allows users to send messages, receive assistant responses, and resume conversations reliably across reloads and retries.

The application is built to behave predictably under real-world conditions such as network retries, slow responses, and partial failures, while keeping the user experience simple and transparent.

---
## 🏗️ Architecture Overview (Failure-First)

### Backend Structure

The backend is implemented as a **modular monolith**, structured around *failure boundaries* rather than features.


**Layer responsibilities:**
- **API**: Validates untrusted input; performs no side effects.
- **Domain**: Defines legal system states and invariants; contains no I/O.
- **Persistence**: Owns all database interactions; PostgreSQL is the single source of truth.
- **Services**: Orchestrates unreliable dependencies (LLMs) and translates failures.
- **Infrastructure**: External clients (DB, LLM SDKs), fully replaceable.

<p align="center">
  <img src="frontend/src/lib/assets/architecture.png" alt="System Architecture" width="700"/>
</p>

<p align="center"><em>Failure-first architecture with explicit state boundaries and pessimistic LLM integration.</em></p>


### Failure-First Design Decisions

Failures are treated as **expected states**, not exceptions.

**Global invariants:**
- Messages are acknowledged only after successful persistence.
- AI replies are optional and never block message storage.
- Frontend state is non-authoritative and always reconstructible.
- All failures collapse into known, user-explainable states.

**Explicit failure boundaries:**
- Input validation
- Frontend ↔ backend communication
- Persistence layer
- LLM provider interaction
- Response delivery

---

### Named System States

The system operates only within a bounded set of legal states:

- `MessageRejected` — validation failed; nothing persisted  
- `MessageAccepted` — message persisted; reply pending  
- `PartialConversation` — missing or failed replies  
- `ReplyFailed` — LLM failure after persistence  
- `ReplySucceeded` — reply generated and stored  

These states directly drive backend behavior and frontend rendering, enabling graceful degradation and predictable recovery.

## 🗄️ Database Schema (Conceptual)

The database is the single source of truth. All system state is reconstructible from persisted data.

### Core Tables

**conversations**
- `id`, `created_at`

**messages**
- `id`, `conversation_id`
- `sender` (`user` | `assistant`)
- `text` (nullable)
- `status` (`accepted` | `pending` | `completed` | `failed`)
- `error` (nullable)
- `reply_to` (self-reference)
- `client_message_id` (idempotency key, nullable)
- `created_at`

### Design Notes
- Messages are append-only and immutable.
- Assistant replies may exist without text.
- Failures are first-class, persisted states.
- Frontend state is always derived from the database.

## 🤖 LLM Notes

### Provider

The system uses **Google Gemini** as the LLM provider, integrated behind a thin `llmClient` abstraction.  
The LLM is treated as an **unreliable, best-effort dependency**, never as a source of truth.

Key properties:
- LLM availability, latency, and correctness are **not assumed**.
- LLM failures never impact message persistence.
- Provider-specific logic is isolated, making the LLM fully replaceable.

---

### Prompting Strategy

Prompting is intentionally **minimal, deterministic, and pessimistic**.

- The model receives:
  - Persisted conversation history (from the database)
  - The latest user message
- No frontend state or implicit context is trusted.
- No streaming or partial outputs are relied upon.

The LLM is invoked **only after** the user message is successfully persisted. Its output is treated as optional enrichment, not a required step in the message lifecycle.

---

### Hard-coded Knowledge (FAQ Handling)

The system embeds **hard-coded FAQ knowledge** directly inside [`llmClient`](backend/src/llm/llmClient.ts) and [`chatService`](backend/src/services/chatService.ts) as a first-line response mechanism.

- Common, well-defined queries (e.g. FAQs, support questions) are matched deterministically.
- If a match is found:
  - The response is generated **without invoking the LLM**.
  - Latency is reduced and failure risk is eliminated.
- If no match is found:
  - The request is escalated to the LLM.

This design ensures:
- Predictable answers for known questions
- Reduced dependency on the LLM for trivial or repetitive queries
- Graceful degradation when the LLM is unavailable

Hard-coded knowledge is treated as **authoritative**, while LLM output remains probabilistic and non-essential.

---

Overall, intelligence is layered on top of correctness:  
**conversation persistence and deterministic responses come first; LLM reasoning is an optional optimization.**

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express
- PostgreSQL

**Frontend**
- SvelteKit
- Store-based state management

## ⚖️ Trade-offs
### Trade-offs (Reliability vs Performance)

The primary trade-off in this system is **reliability over performance and immediacy**.

By prioritizing failure-first correctness:
- All user messages are synchronously persisted before any AI work begins.
- The LLM is invoked pessimistically and never blocks core flows.
- No speculative UI updates or streaming are relied upon.

This can increase end-to-end latency and reduce perceived responsiveness compared to optimistic, LLM-first systems. However, it guarantees durable conversations, explicit failure states, and predictable recovery under all conditions.

## ▶️ Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm / pnpm / yarn

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/ringerH/AI_chat.git
cd AI_chat
```
### Step 2: Backend Setup
```
cd backend
npm install
```
Create a .env file in backend/:
```
DATABASE_URL=postgresql://user:password@localhost:5432/ai_chat
PORT = 3000
GEMINI_API_KEY=your_api_key_here
```
### Step 3: DB setup
```
createdb ai_chat
cd backend
npm install
npm run migrate
```
### Step 4: Start Backend
```
npm run dev
```
Backend runs at `http://localhost:3000`

### Step 5: Frontend Setup
```
cd ../frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

## 🧾 Summary

This project implements a failure-first, persistence-driven chat system designed for correctness under real-world conditions.

- The database is the single source of truth; all conversation state is fully reconstructible.
- Failures are treated as explicit, named states rather than exceptional cases.
- LLMs are integrated pessimistically as optional dependencies, never as authoritative components.
- Deterministic logic (e.g. FAQ handling) is preferred where possible to reduce reliance on probabilistic behavior.
- Reliability and recoverability are prioritized over optimistic performance and UI illusion.

The result is a system that remains predictable, debuggable, and safe under partial failures—while allowing intelligence and performance optimizations to be layered on top without compromising core guarantees.

