/**
 * Tiny in-memory sliding-window limiter. It protects your AI bill from a single
 * noisy visitor. State lives in one server process, so if you deploy several
 * instances, use a shared store (Redis, Upstash) instead.
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) }
  }

  recent.push(now)
  hits.set(key, recent)

  // Keep the map from growing forever.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k)
    }
  }
  return { ok: true, retryAfter: 0 }
}
