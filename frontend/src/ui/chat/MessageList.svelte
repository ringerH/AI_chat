<script lang="ts">
  import type { Message } from "../../state/conversationStore";
  import { retryMessage, fetchHistory } from "../../api/chat";

  export let messages: Message[] = [];

  async function retry(m: Message) {
    if (!m.reply_to) return;

    const userMsg = messages.find(
      x => x.id === m.reply_to
    );

    if (!userMsg || !userMsg.client_message_id || !userMsg.text) return;

    await retryMessage(userMsg.text, userMsg.client_message_id);
    await fetchHistory();
  }
</script>

<ul>
  {#each messages as m}
    <li>
      {#if m.sender === "user"}
        <strong>user:</strong> {m.text}
      {:else}
        <strong>assistant:</strong>

        {#if m.status === "pending"}
          <em>Generating…</em>

        {:else if m.status === "failed"}
          <span style="color: red;">
            Failed: {m.error}
          </span>
          <button on:click={() => retry(m)}>Retry</button>

        {:else}
          {m.text}
        {/if}
      {/if}
    </li>
  {/each}
</ul>
