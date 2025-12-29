import { writable } from "svelte/store";
import { browser } from "$app/environment";

const initialSessionId = browser
  ? localStorage.getItem("sessionId")
  : null;

export const sessionId = writable<string | null>(initialSessionId);

if (browser) {
  sessionId.subscribe((v) => {
    if (v) localStorage.setItem("sessionId", v);
    else localStorage.removeItem("sessionId");
  });
}
