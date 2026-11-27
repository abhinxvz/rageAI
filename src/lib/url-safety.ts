import dns from "dns/promises"
import net from "net"

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /\.local$/i,
  /\.internal$/i,
]

export function isPrivateOrReservedIp(rawIp: string): boolean {
  const ip = rawIp.trim().replace(/^\[|\]$/g, "").toLowerCase()
  if (!ip) return true

  // Unwrap IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  if (ip.startsWith("::ffff:")) {
    const mapped = ip.slice(7)
    if (net.isIPv4(mapped)) {
      return isPrivateOrReservedIp(mapped)
    }
  }

  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number)
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
      return true
    }
    const [a, b] = parts
    if (a === 0 || a === 10 || a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
    if (a >= 224) return true // Multicast / reserved
    return false
  }

  if (net.isIPv6(ip)) {
    if (ip === "::" || ip === "::1") return true
    if (ip.startsWith("fc") || ip.startsWith("fd")) return true // Unique local
    if (ip.startsWith("fe8") || ip.startsWith("fe9") || ip.startsWith("fea") || ip.startsWith("feb")) {
      return true // Link-local fe80::/10
    }
    if (ip.startsWith("ff")) return true // Multicast
    return false
  }

  return true
}

export function validatePublicHttpUrl(rawUrl: string): URL {
  let parsed: URL
  try {
    parsed = new URL(rawUrl.trim())
  } catch {
    throw new Error("Invalid URL format")
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported")
  }

  if (parsed.username || parsed.password) {
    throw new Error("URLs with embedded credentials are not allowed")
  }

  const host = parsed.hostname.replace(/^\[|\]$/g, "")
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    throw new Error("Access to local or private network addresses is blocked")
  }

  if (net.isIP(host) && isPrivateOrReservedIp(host)) {
    throw new Error("Access to private or reserved IP addresses is blocked")
  }

  return parsed
}

async function assertPublicDnsResolution(url: URL): Promise<void> {
  const host = url.hostname.replace(/^\[|\]$/g, "")
  if (net.isIP(host)) {
    if (isPrivateOrReservedIp(host)) {
      throw new Error("Access to private or reserved IP addresses is blocked")
    }
    return
  }

  const records = await dns.lookup(host, { all: true })
  if (!records || records.length === 0) {
    throw new Error("Could not resolve target hostname")
  }
  for (const record of records) {
    if (isPrivateOrReservedIp(record.address)) {
      throw new Error("Target hostname resolved to a blocked private or reserved IP address")
    }
  }
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000,
  maxRedirects = 3
): Promise<Response> {
  let currentUrl = validatePublicHttpUrl(url)

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicDnsResolution(currentUrl)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    let res: Response
    try {
      res = await fetch(currentUrl.toString(), {
        ...init,
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "RageAI-Workspace-Assistant/1.0",
          ...(init.headers || {}),
        },
      })
    } finally {
      clearTimeout(timer)
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location")
      if (!location) {
        throw new Error(`Redirect response (${res.status}) missing Location header`)
      }
      if (hop === maxRedirects) {
        throw new Error("Too many redirects")
      }
      const nextUrl = new URL(location, currentUrl)
      currentUrl = validatePublicHttpUrl(nextUrl.toString())
      continue
    }

    return res
  }

  throw new Error("Too many redirects")
}

export async function readTextWithLimit(res: Response, maxBytes = 1_500_000): Promise<string> {
  if (!res.body) {
    return (await res.text()).slice(0, maxBytes)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let total = 0
  let result = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      const allowed = value.byteLength - (total - maxBytes)
      if (allowed > 0) {
        result += decoder.decode(value.subarray(0, allowed), { stream: false })
      }
      await reader.cancel()
      break
    }
    result += decoder.decode(value, { stream: true })
  }

  return result
}
