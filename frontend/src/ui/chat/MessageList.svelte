<script lang="ts">
  import { afterUpdate } from "svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import { conversation } from "../../state/conversationStore";
  import type { Message } from "../../state/conversationStore";
  
  export let messages = [];
  export let fullChatView: boolean = false;

  let container: HTMLDivElement;

  afterUpdate(() => {
    container?.scrollTo({ 
      top: container.scrollHeight,
      behavior: "smooth" 
    });
  });

  // Get last 2 messages for focus mode (1 user + 1 assistant)
  $: focusMessages = messages.slice(-2);
  $: displayMessages = fullChatView ? messages : focusMessages;
  $: hasMoreMessages = messages.length > 2;
</script>

<div 
  class="messages" 
  class:focus-mode={!fullChatView}
  class:has-more={!fullChatView && hasMoreMessages}
  bind:this={container}
>
  {#if !fullChatView && hasMoreMessages}
    <div class="fade-hint"></div>
  {/if}

  {#if displayMessages.length === 0}
    <div class="empty-state">
      <h2>👋 Welcome to Acme Support!</h2>
      <p>Ask us anything.</p>
    </div>
  {:else}
  {#each displayMessages as m (m.id)}
  <MessageBubble {m} {messages} {fullChatView} />
{/each}
  {/if}
</div>

<style>
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    position: relative;
  }

  /* Focus mode: constrain height and hide overflow initially */
  .messages.focus-mode {
    justify-content: flex-end;
    min-height: 250px;
  }

  /* Fade hint at top when in focus mode with more messages */
  .fade-hint {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, 
      rgba(255, 255, 255, 0.95), 
      rgba(255, 255, 255, 0)
    );
    pointer-events: none;
    z-index: 10;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 3rem 1.5rem;
    color: #555;
  }

  .empty-state h2 {
    margin: 0 0 0.75rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .empty-state p {
    margin: 0;
    font-size: 1rem;
    color: #666;
  }

  /* Mobile adjustments */
  @media (max-width: 767px) {
    .messages {
      padding: 1rem;
    }

    .empty-state {
      padding: 2rem 1rem;
    }

    .empty-state h2 {
      font-size: 1.25rem;
    }

    /* On mobile, always show full chat (no focus mode) */
    .messages.focus-mode {
      min-height: unset;
      justify-content: flex-start;
    }

    .fade-hint {
      display: none;
    }
  }

  /* Scrollbar styling */
  .messages::-webkit-scrollbar {
    width: 6px;
  }

  .messages::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .messages::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
</style>