import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

if (!process.env.DATABASE_URL?.includes("spur_chat_test")) {
  throw new Error("❌ Tests are NOT using spur_chat_test database");
}
