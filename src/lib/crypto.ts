import crypto from "crypto"

const ENC_PREFIX = "enc:v1:"

function getAppSecret(): string {
  const secret =
    process.env.TOKEN_ENCRYPTION_KEY?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production" ? "rage-ai-dev-secret-change-me" : "")

  if (!secret) {
    throw new Error("Missing TOKEN_ENCRYPTION_KEY or NEXTAUTH_SECRET")
  }
  return secret
}

function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(`enc:${getAppSecret()}`).digest()
}

function getSigningKey(): Buffer {
  return crypto.createHash("sha256").update(`sig:${getAppSecret()}`).digest()
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return plaintext
  if (plaintext.startsWith(ENC_PREFIX)) return plaintext

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${ENC_PREFIX}${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`
}

export function decryptSecret(stored: string): string {
  if (!stored) return stored
  if (!stored.startsWith(ENC_PREFIX)) {
    // Legacy plaintext token row: return as-is until next refresh/re-auth re-encrypts it
    return stored
  }

  const parts = stored.slice(ENC_PREFIX.length).split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format")
  }

  const [ivB64, tagB64, dataB64] = parts
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivB64, "base64url")
  )
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ])
  return decrypted.toString("utf8")
}

export interface SignedOAuthState {
  appId: string
  userId: string
  nonce: string
  exp: number
}

export function signOAuthState(payload: SignedOAuthState): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url")
  const sig = crypto.createHmac("sha256", getSigningKey()).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function verifyOAuthState(token: string): SignedOAuthState | null {
  const dotIdx = token.indexOf(".")
  if (dotIdx <= 0) return null

  const body = token.slice(0, dotIdx)
  const sig = token.slice(dotIdx + 1)
  if (!body || !sig) return null

  const expectedSig = crypto
    .createHmac("sha256", getSigningKey())
    .update(body)
    .digest("base64url")

  const sigBuf = Buffer.from(sig)
  const expectedBuf = Buffer.from(expectedSig)
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SignedOAuthState
    if (
      !parsed?.appId ||
      !parsed?.userId ||
      !parsed?.nonce ||
      typeof parsed.exp !== "number" ||
      Date.now() > parsed.exp
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}
