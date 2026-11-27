interface RateBucket {
  timestamps: number[]
}

const buckets = new Map<string, RateBucket>()

export function checkRateLimit(
  key: string,
  maxRequests = 20,
  windowMs = 60_000
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const cutoff = now - windowMs
  const existing = buckets.get(key)
  const valid = existing ? existing.timestamps.filter((ts) => ts > cutoff) : []

  if (valid.length >= maxRequests) {
    const oldest = valid[0] ?? now
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
    buckets.set(key, { timestamps: valid })
    return { allowed: false, retryAfterSec }
  }

  valid.push(now)
  buckets.set(key, { timestamps: valid })

  // Opportunistic cleanup to keep memory bounded
  if (buckets.size > 1000) {
    for (const [k, b] of buckets.entries()) {
      if (b.timestamps.every((ts) => ts <= cutoff)) {
        buckets.delete(k)
      }
    }
  }

  return { allowed: true, retryAfterSec: 0 }
}
