import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getD1() {
  const { env } = getCloudflareContext();

  if (!env.raaka_db) {
    throw new Error("Cloudflare D1 binding 'raaka_db' is not available.");
  }

  return env.raaka_db;
}