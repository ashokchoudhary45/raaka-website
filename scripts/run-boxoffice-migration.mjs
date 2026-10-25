
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { readFileSync } from "node:fs";

dotenv.config({ path: ".env.local" });

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  throw new Error("Turso credentials .env.local mein missing hain.");
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

try {
  const sql = readFileSync("migrations/0001_boxoffice.sql", "utf8");

  // Migration file ke statements execute karo.
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await client.execute(statement);
  }

  const result = await client.execute(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name LIKE 'boxoffice_%'
    ORDER BY name
  `);

  console.log("Migration successful!");
  console.table(result.rows);
} finally {
  client.close();
}
