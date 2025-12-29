<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import MessageList from "../ui/chat/MessageList.svelte";
  import InputBar from "../ui/chat/InputBar.svelte";
  import { conversation } from "../state/conversationStore";
  import { sessionId } from "../state/sessionStore";
  import { postMessage, fetchHistory } from "../api/chat";

  let messages = [];
  let poller: any = null;
  let sending = false;

  conversation.subscribe(v => messages = v);

  function hasPendingAssistant() {
    return messages.some(
      m => m.sender === "assistant" && m.status === "pending"
    );
  }

  async function send(text: string) {
    if (!text.trim() || sending) return;

    sending = true;
    await postMessage(text);
    sending = false;

    await fetchHistory();
    startPolling();
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

  onMount(async () => {
    if (!sessionId) return;
    await fetchHistory();
    if (hasPendingAssistant()) startPolling();
  });

  onDestroy(stopPolling);
</script>

<div class="page">
  <MessageList {messages} />

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
    background: #deded4;
  }
</style>
