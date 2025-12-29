export async function callLLM(prompt: string): Promise<string> {
    // Mock for now (Milestone 2)
    await new Promise(r => setTimeout(r, 500));
  
    if (prompt.includes("fail")) {
      throw new Error("Simulated LLM failure");
    }
  
    return `LLM reply to: ${prompt}`;
  }
  