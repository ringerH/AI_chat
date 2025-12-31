<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import MessageList from "../ui/chat/MessageList.svelte";
  import InputBar from "../ui/chat/InputBar.svelte";
  import Toast from "../ui/common/Toast.svelte";
  import { conversation } from "../state/conversationStore";
  import { sessionId } from "../state/sessionStore";
  import { postMessage, fetchHistory, NetworkError, ValidationError } from "../api/chat";
  import { toast } from "../state/toastStore";
  import type { Message } from "../state/conversationStore";

  let messages: Message[] = [];
  let poller: any = null;
  let sending = false;
  let loadingHistory = false;
  let historyError = false;

  conversation.subscribe(v => messages = v);

  function hasPendingAssistant() {
    return messages.some(
      m => m.sender === "assistant" && m.status === "pending"
    );
  }

  async function send(text: string) {
    if (!text.trim() || sending) return;
    
    sending = true;
    const clientMessageId = crypto.randomUUID();

    const optimisticUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      client_message_id: clientMessageId,
      status: "completed"
    };

    const optimisticAssistantMessage: Message = {
      id: `temp-assistant-${Date.now()}`,
      sender: "assistant",
      status: "pending"
    };

    conversation.update(msgs => [...msgs, optimisticUserMessage, optimisticAssistantMessage]);

    try {
      await postMessage(text);
      await loadHistory(); 
      startPolling();
    } catch (error) {
      console.error("Failed to send message:", error);
      
      conversation.update(msgs => 
        msgs.filter(m => m.id !== optimisticUserMessage.id && m.id !== optimisticAssistantMessage.id)
      );

      if (error instanceof NetworkError) {
        toast.show(error.message, "error", 5000);
      } else if (error instanceof ValidationError) {
        toast.show(error.message, "warning", 3000);
      } else {
        toast.show("Failed to send message. Please try again.", "error", 5000);
      }
    } finally {
      sending = false;
    }
  }

  async function loadHistory() {
    const sid = $sessionId;
    if (!sid) return;

    loadingHistory = true;
    historyError = false;

    try {
      await fetchHistory();
      if (hasPendingAssistant()) {
        startPolling();
      }
    } catch (error: any) {
      console.error("Failed to load history:", error);
      historyError = true;
      
      if (error instanceof NetworkError) {
        toast.show(error.message, "error", 5000);
      } else {
        toast.show("Failed to load conversation history", "error", 5000);
      }
    } finally {
      loadingHistory = false;
    }
  }

  function startPolling() {
    if (poller) return;
    poller = setInterval(async () => {
      try {
        await fetchHistory();
        if (!hasPendingAssistant()) {
          stopPolling();
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 1500);
  }

  function stopPolling() {
    if (poller) {
      clearInterval(poller);
      poller = null;
    }
  }

  function newConversation() {
    stopPolling();
    sessionId.set(null);
    conversation.set([]);
    historyError = false;
    toast.show("Started new conversation", "success", 2000);
  }

  onMount(async () => {
    await loadHistory();
  });

  onDestroy(stopPolling);
</script>

<Toast />

<div class="page">
  <div class="chat-header">
    <div class="store-info">
      <h1>Acme Support</h1>
      <p class="tagline">How can we help you today?</p>
    </div>
  </div>

  {#if loadingHistory}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading conversation...</p>
    </div>
  {:else if historyError}
    <div class="error-state">
      <p>Failed to load conversation</p>
      <button on:click={loadHistory}>Retry</button>
    </div>
  {:else}
    <MessageList {messages} />
  {/if}

  <InputBar
    onSend={send}
    disabled={sending || loadingHistory}
    onNewConversation={newConversation}
  />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 720px;
    margin: 0 auto;
    background: #e6e6d6;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.08);
    position: relative;
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e5e5e5;
    background: linear-gradient(to bottom, #fafafa, #fff);
    z-index: 20;
  }

  .store-info h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .tagline {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: #666;
  }

  .loading-state,
  .error-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #666;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-state p,
  .error-state p {
    margin: 0;
    font-size: 1rem;
    color: #666;
  }

  .error-state button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .error-state button:hover {
    background: #f5f5f5;
    border-color: #999;
  }

  @media (max-width: 767px) {
    .page {
      max-width: 100%;
      box-shadow: none;
    }
  }
</style>