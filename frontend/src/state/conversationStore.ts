export type Message = {
  id?: string;
  sender: "user" | "assistant";
  text?: string;
  status?: "pending" | "completed" | "failed";
  error?: string;
  reply_to?: string;
  client_message_id?: string;
};

import { writable } from "svelte/store";
export const conversation = writable<Message[]>([]);
