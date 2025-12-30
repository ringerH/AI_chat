<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import MessageList from "../ui/chat/MessageList.svelte";
  import InputBar from "../ui/chat/InputBar.svelte";
  import { conversation } from "../state/conversationStore";
  import { sessionId } from "../state/sessionStore";
  import { postMessage, fetchHistory } from "../api/chat";
  import type { Message } from "../state/conversationStore";

  let messages: Message[] = [];
  let poller: any = null;
  let sending = false;
  let fullChatView = false;

  onMount(() => {
    if (browser) {
      const saved = localStorage.getItem("fullChatView");
      fullChatView = saved === "true";
    }
  });

  $: if (browser) {
    localStorage.setItem("fullChatView", String(fullChatView));
  }

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
      await fetchHistory();
      startPolling();
    } catch (error) {
      console.error("Failed to send message:", error);
      conversation.update(msgs => 
        msgs.filter(m => m.id !== optimisticUserMessage.id && m.id !== optimisticAssistantMessage.id)
      );
      alert("Failed to send message. Please try again.");
    } finally {
      sending = false;
    }
  }

  function startPolling() {
    if (poller) return;
    poller = setInterval(async () => {
      await fetchHistory();
      if (!hasPendingAssistant()) stopPolling();
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
  }

  function toggleChatView() {
    fullChatView = !fullChatView;
  }

  onMount(async () => {
    const sid = $sessionId;
    if (!sid) return;
    await fetchHistory();
    if (hasPendingAssistant()) startPolling();
  });

  onDestroy(stopPolling);
</script>

<div class="page" class:focus-active={!fullChatView}>
  <div class="chat-header">
    <div class="store-info">
      <h1>Acme Support</h1>
      <p class="tagline">How can we help you today?</p>
    </div>
    
    <button class="view-toggle" on:click={toggleChatView}>
      {#if fullChatView}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <span>Focus Mode</span>
      {:else}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        <span>View Full Chat</span>
      {/if}
    </button>
  </div>

  <MessageList {messages} {fullChatView} />

  <InputBar
    onSend={send}
    disabled={sending}
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
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  /* ZOOM EFFECT: When in focus mode, we scale up the entire 
     inner content to feel "zoomed in" on the two messages.
  */
  .page.focus-active :global(.messages) {
    transform: scale(1.08);
    transform-origin: bottom center;
    padding-bottom: 2rem;
  }

  .page.focus-active .tagline {
    opacity: 0.5;
    font-size: 0.75rem;
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
    transition: all 0.3s ease;
  }

  .view-toggle {
    display: none;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    color: #555;
    background: transparent;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-toggle:hover {
    background: #f5f5f5;
    border-color: #ccc;
    color: #000;
  }

  @media (min-width: 768px) {
    .view-toggle {
      display: flex;
    }
  }

  @media (max-width: 767px) {
    .page {
      max-width: 100%;
      box-shadow: none;
    }
    
    /* Disable zoom on mobile for better usability */
    .page.focus-active :global(.messages) {
      transform: none;
    }
  }
</style>