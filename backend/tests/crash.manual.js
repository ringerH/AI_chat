import fetch from "node-fetch";

const BASE = "http://localhost:3000";

(async () => {
  console.log("Sending message — kill server NOW");

  await fetch(`${BASE}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "crash-test",
      clientMessageId: "crash-1"
    })
  });

  console.log("Restart server, then check DB manually");
})();
