type Entry<T> = { value: T; expiresAt: number };
const cache = new Map<string, Entry<unknown>>();
const MAX_KEYS = 200;

export function cacheGet<T>(key: string): T | undefined {
  const item = cache.get(key) as Entry<T> | undefined;
  if (!item) return undefined;
  if (item.expiresAt <= Date.now()) { cache.delete(key); return undefined; }
  return item.value;
}
export function cacheSet<T>(key: string, value: T, ttlSeconds = 60) {
  if (cache.size >= MAX_KEYS) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}
export function cacheTTL() {
  const n = Number(process.env.BOX_OFFICE_CACHE_TTL_SECONDS ?? 60);
  return Number.isFinite(n) ? Math.max(10, Math.min(600, Math.floor(n))) : 60;
}
