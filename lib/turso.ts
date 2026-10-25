
import "server-only";
import { createClient } from "@libsql/client/web";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  throw new Error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variable"
  );
}

export const turso = createClient({
  url,
  authToken,
});
