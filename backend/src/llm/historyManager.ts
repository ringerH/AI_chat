import { LLMMessage } from "./types";

export class ConversationManager {
  private history: LLMMessage[] = [];
  private readonly maxHistory: number;

  constructor(maxHistory: number = 10) {
    this.maxHistory = maxHistory;
  }

  
  addMessage(role: "user" | "assistant", content: string) {
    this.history.push({ role, content });
    
    
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  
  getHistory(): LLMMessage[] {
    return [...this.history];
  }


  clear() {
    this.history = [];
  }
}