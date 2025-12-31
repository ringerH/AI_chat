<script lang="ts">
    import { toast } from "../../state/toastStore";
    import type { Toast } from "../../state/toastStore";
  
    let toasts: Toast[] = [];
    toast.subscribe(value => toasts = value);
  
    function getIcon(type: string) {
      switch (type) {
        case "success": return "✓";
        case "error": return "✕";
        case "warning": return "⚠";
        default: return "ℹ";
      }
    }
  </script>
  
  <div class="toast-container">
    {#each toasts as t (t.id)}
      <div class="toast {t.type}" role="alert">
        <span class="icon">{getIcon(t.type)}</span>
        <span class="message">{t.message}</span>
        <button 
          class="close" 
          on:click={() => toast.dismiss(t.id)}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    {/each}
  </div>
  
  <style>
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
    }
  
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      background: white;
      border-left: 4px solid;
    }
  
    .toast.success {
      border-left-color: #22c55e;
    }
  
    .toast.error {
      border-left-color: #ef4444;
    }
  
    .toast.warning {
      border-left-color: #f59e0b;
    }
  
    .toast.info {
      border-left-color: #3b82f6;
    }
  
    .icon {
      font-size: 1.25rem;
      font-weight: bold;
      flex-shrink: 0;
    }
  
    .toast.success .icon {
      color: #22c55e;
    }
  
    .toast.error .icon {
      color: #ef4444;
    }
  
    .toast.warning .icon {
      color: #f59e0b;
    }
  
    .toast.info .icon {
      color: #3b82f6;
    }
  
    .message {
      flex: 1;
      font-size: 0.9rem;
      line-height: 1.4;
      color: #1a1a1a;
    }
  
    .close {
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      color: #666;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.15s ease;
      flex-shrink: 0;
    }
  
    .close:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #000;
    }
  
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  
    @media (max-width: 640px) {
      .toast-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }
  
      .toast {
        padding: 0.75rem;
        font-size: 0.85rem;
      }
    }
  </style>