<script lang="ts">
  import { beforeUpdate, afterUpdate } from "svelte";
  import MessageBubble from "./MessageBubble.svelte";
  
  export let messages = [];

  let container: HTMLDivElement;
  let autoscroll = true;

  beforeUpdate(() => {
    if (container) {
      
      const scrollableDistance = container.scrollHeight - container.offsetHeight;
      const currentScroll = container.scrollTop;

      autoscroll = (scrollableDistance - currentScroll) < 50;
    }
  });

  afterUpdate(() => {    
    if (autoscroll && container) {
      container.scrollTo(0, container.scrollHeight);
    }
  });
</script>

<div class="messages" bind:this={container}>
  {#if messages.length === 0}
    <div class="empty-state">
      <h2>👋 Welcome to Acme Support!</h2>
      <p>Ask us anything.</p>
    </div>
  {:else}
    {#each messages as m (m.id)}
      <MessageBubble {m} {messages} />
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
  }


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