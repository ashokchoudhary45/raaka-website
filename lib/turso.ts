import "server-only";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.warn("Turso env missing: configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.");
}

export const turso = createClient({
  url: url || "file:boxoffice-local.db",
  authToken: authToken || undefined,
});
