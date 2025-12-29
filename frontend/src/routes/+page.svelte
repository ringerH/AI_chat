<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import MessageList from "../ui/chat/MessageList.svelte";
  import { conversation } from "../state/conversationStore";
  import { sessionId } from "../state/sessionStore";
  import { postMessage, fetchHistory } from "../api/chat";

  let input = "";
  let messages = [];
  let poller: any = null;

  conversation.subscribe(v => messages = v);

  function hasPendingAssistant() {
    return messages.some(
      m => m.sender === "assistant" && m.status === "pending"
    );
  }

  async function send() {
    if (!input.trim()) return;

    await postMessage(input);
    input = "";

    await fetchHistory();
    startPolling();
  }

  function newConversation() {
    stopPolling();
    sessionId.set(null);
    conversation.set([]);
  }

  function startPolling() {
    if (poller) return;

    poller = setInterval(async () => {
      await fetchHistory();

      if (!hasPendingAssistant()) {
        stopPolling();
      }
    }, 1500);
  }

  function stopPolling() {
    if (poller) {
      clearInterval(poller);
      poller = null;
    }
  }

  onMount(async () => {
    if (!sessionId) return;

    await fetchHistory();

    if (hasPendingAssistant()) {
      startPolling();
    }
  });

  onDestroy(() => {
    stopPolling();
  });
</script>

<div style="max-width: 600px; margin: auto;">
  <h3>Chat</h3>

  <MessageList {messages} />

  <div style="margin-top: 1rem;">
    <input
      bind:value={input}
      placeholder="Type a message"
      on:keydown={(e) => e.key === "Enter" && send()}
    />
    <button on:click={send}>Send</button>
    <button on:click={newConversation}>New Conversation</button>
  </div>
</div>
