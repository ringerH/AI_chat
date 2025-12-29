<script lang="ts">
  import { afterUpdate } from "svelte";
  import MessageBubble from "./MessageBubble.svelte";
  export let messages = [];

  let container: HTMLDivElement;

  afterUpdate(() => {
    container?.scrollTo({ 
      top: container.scrollHeight,
    behavior: "smooth" });
  });
</script>

<div class="messages" bind:this={container}>
  {#each messages as m (m.id)}
    <MessageBubble {m} {messages} />
  {/each}
</div>

<style>
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }
</style>
