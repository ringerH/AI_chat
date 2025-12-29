require("dotenv").config({ path: "../.env" });

const fetch = require("node-fetch");
const pg = require("pg");
const Client = pg.Client;

const BASE_URL = "http://localhost:3000/chat/message";
const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const db = new Client({ connectionString: DB_URL });

async function post(body) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

async function resetDb() {
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM conversations");
}

(async function run() {
  await db.connect();
  await resetDb();

  console.log("\nTEST 1: Happy path (MessageAccepted)");
  const r1 = await post({ message: "Hello" });
  console.log(r1);
  const sessionId = r1.body.sessionId;

  let q = await db.query("SELECT * FROM conversations");
  console.assert(q.rowCount === 1, "Expected 1 conversation");

  q = await db.query("SELECT * FROM messages");
  console.assert(q.rowCount === 1, "Expected 1 message");
  console.assert(q.rows[0].text === "Hello", "Text mismatch");

  console.log("✓ MessageAccepted");

  console.log("\nTEST 2: Input validation (MessageRejected)");
  const before = await db.query("SELECT COUNT(*) FROM messages");
  const r2 = await post({ message: "   " });
  console.assert(r2.status === 400, "Expected HTTP 400");

  const after = await db.query("SELECT COUNT(*) FROM messages");
  console.assert(
    before.rows[0].count === after.rows[0].count,
    "Message count changed"
  );
  console.log("✓ MessageRejected");

  console.log("\nTEST 3: Session reuse");
  await post({ message: "Second message", sessionId });
  q = await db.query(
    "SELECT conversation_id FROM messages ORDER BY created_at"
  );
  console.assert(q.rowCount === 2, "Expected 2 messages");
  console.assert(
    q.rows[0].conversation_id === q.rows[1].conversation_id,
    "Conversation IDs differ"
  );
  console.log("✓ Session continuity");

  console.log("\nTEST 4: Long message truncation");
  const longMsg = "a".repeat(6000);
  await post({ message: longMsg });
  q = await db.query(
    "SELECT LENGTH(text) AS len FROM messages ORDER BY created_at DESC LIMIT 1"
  );
  console.assert(q.rows[0].len === 5000, "Message not truncated");
  console.log("✓ Truncation works");

  console.log("\nTEST 5: Duplicate rapid sends");
  await Promise.all([
    post({ message: "Fast click" }),
    post({ message: "Fast click" })
  ]);
  q = await db.query(
    "SELECT COUNT(*) FROM messages WHERE text = 'Fast click'"
  );
  console.assert(Number(q.rows[0].count) === 2, "Expected 2 duplicate messages");
  console.log("✓ Duplicate sends allowed");

  console.log("\n⚠️ TEST 6 & 7 (Crash / disconnect)");
  console.log(
    "These must be tested manually by killing the server mid-request."
  );
  console.log(
    "Verify DB state manually afterward (commit OR rollback only)."
  );

  console.log("\n✅ Milestone 0 automated tests passed");
  await db.end();
})();
