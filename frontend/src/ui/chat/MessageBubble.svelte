<script lang="ts">
  import { retryMessage, fetchHistory, NetworkError } from "../../api/chat";
  import { toast } from "../../state/toastStore";

  export let m;
  export let messages;

  let retrying = false;

  async function retry() {
    const user = messages.find(x => x.id === m.reply_to);
    if (!user?.client_message_id) {
      toast.show("Cannot retry this message", "error", 3000);
      return;
    }

    retrying = true;

    try {
      await retryMessage(user.text, user.client_message_id);
      await fetchHistory();
      toast.show("Message retried successfully", "success", 2000);
    } catch (error) {
      console.error("Retry failed:", error);
      
      if (error instanceof NetworkError) {
        toast.show(error.message, "error", 5000);
      } else {
        toast.show("Retry failed. Please try again.", "error", 5000);
      }
    } finally {
      retrying = false;
    }
  }

  function getUserFriendlyError(error: string | undefined): string {
    if (!error) return "Something went wrong";
    
    if (error.includes("rate") || error.includes("429")) {
      return "Too many requests. Please wait a moment and try again.";
    }
    if (error.includes("timeout") || error.includes("timed out")) {
      return "Request timed out. Please try again.";
    }
    if (error.includes("network") || error.includes("connection")) {
      return "Network error. Please check your connection.";
    }
    if (error.includes("API") || error.includes("provider")) {
      return "Service temporarily unavailable. Please try again.";
    }
    
    return "Unable to generate response. Please try again.";
  }
</script>

<div class="bubble {m.sender}">
  {#if m.sender === "assistant"}
    {#if m.status === "pending"}
      <div class="typing-indicator">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <em>Agent is typing…</em>
      </div>
    {:else if m.status === "failed"}
      <div class="error-content">
        <span class="error-icon">⚠</span>
        <span class="error-text">{getUserFriendlyError(m.error)}</span>
      </div>
      <button 
        class="retry-btn" 
        on:click={retry}
        disabled={retrying}
      >
        {retrying ? "Retrying..." : "Retry"}
      </button>
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
    transition: all 0.3s ease;
    word-wrap: break-word;
    overflow-wrap: break-word;
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

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #666;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .typing-indicator em {
    color: #666;
    font-style: normal;
    font-size: 0.9em;
  }

  .error-content {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .error-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .error-text {
    color: #b00020;
    line-height: 1.4;
  }

  .retry-btn {
    background: #fff;
    border: 1px solid #ddd;
    color: #333;
    cursor: pointer;
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
    border-radius: 4px;
    transition: all 0.15s ease;
    font-weight: 500;
  }

  .retry-btn:hover:not(:disabled) {
    background: #f5f5f5;
    border-color: #999;
  }

  .retry-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .retry-btn:active:not(:disabled) {
    transform: translateY(1px);
  }

  @media (max-width: 640px) {
    .bubble {
      font-size: 0.9rem;
      padding: 0.65rem 0.875rem;
    }
  }
</style>