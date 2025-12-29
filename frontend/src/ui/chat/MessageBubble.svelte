<script lang="ts">
    import { retryMessage, fetchHistory } from "../../api/chat";
  
    export let m;
    export let messages;
  
    async function retry() {
      const user = messages.find(x => x.id === m.reply_to);
      if (!user?.client_message_id) return;
  
      await retryMessage(user.text, user.client_message_id);
      await fetchHistory();
    }
  </script>
  
  <div class="bubble {m.sender}">
    {#if m.sender === "assistant"}
      {#if m.status === "pending"}
        <em>Agent is typing…</em>
  
      {:else if m.status === "failed"}
        <span class="error">{m.error}</span>
        <button on:click={retry}>Retry</button>
  
      {:else}
        {m.text}
      {/if}
    {:else}
      {m.text}
    {/if}
  </div>
  
  <style>
    .bubble {
      max-width: 80%;
      margin-bottom: 0.9rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      line-height: 1.4;
      font-size: 0.95rem;
    }
  
    .user {
      margin-left: auto;
      background: #f2f2f2;
      text-align: right;
    }
  
    .assistant {
      margin-right: auto;
      background: #eaeaea;
    }
    .assistant-content{
        min-height: 1.4em;
    }
  
    .error {
      color: #b00020;
      display: block;
      margin-bottom: 0.5rem;
    }
  
    button {
      background: none;
      border: none;
      color: #555;
      cursor: pointer;
      padding: 0;
      font-size: 0.85rem;
    }
  </style>
  