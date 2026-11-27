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

  const host = parsed.hostname.replace(/^\[|\]$/g, "")
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    throw new Error("Access to local or private network addresses is blocked")
  }

  return parsed
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": "RageAI-Workspace-Assistant/1.0",
        ...(init.headers || {}),
      },
    })
  } finally {
    clearTimeout(timer)
  }
}
