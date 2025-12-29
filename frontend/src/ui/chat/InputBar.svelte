<script lang="ts">
    export let onSend;
    export let disabled = false;
    export let onNewConversation;
  
    let text = "";
  
    function send() {
      if (!text.trim()) return;
      onSend(text);
      text = "";
    }
  </script>
  
  <div class="input-bar">
    <input
  bind:value={text}
  placeholder="Type a message"
  disabled={disabled}
  autocapitalize="sentences"
  autocomplete="off"
  enterkeyhint="send"
  on:keydown={(e) => e.key === "Enter" && send()}
/>

  
    <button on:click={send} disabled={disabled}>Send</button>
  </div>
  
  <button class="new" on:click={onNewConversation}>
    New Conversation
  </button>
  
  <style>
    .input-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid #eee;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
}

input {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
}

button {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.05s ease;
}

button:hover:not(:disabled) {
  background: #f2f2f2;
}

button:active:not(:disabled) {
  transform: translateY(1px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button:focus-visible,
input:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.2);
  outline-offset: 2px;
}

.new {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.85rem;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  transition: color 0.15s ease;
}

.new:hover {
  color: #000;
}

  </style>
  