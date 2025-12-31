import { Client } from "pg";
import fs from "fs";
import path from "path";

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  // Ensure migrations table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT now()
    );
  `);

  const applied = await client.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations"
  );

  const appliedSet = new Set(applied.rows.map(r => r.filename));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");

    console.log(`Applying migration: ${file}`);

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename) VALUES ($1)",
        [file]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`Migration failed: ${file}`);
      throw err;
    }
  }

  await client.end();
  console.log("Migrations complete");
}

migrate().catch(err => {
  console.error("Migration process failed");
  console.error(err);
  process.exit(1);
});
