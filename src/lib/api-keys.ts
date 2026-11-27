export interface APIKeys {
  openai?: {
    key: string
  }
  gemini?: {
    key: string
  }
  nemotron?: {
    key: string
  }
  webhooks?: {
    discord?: string
    slack?: string
  }
  resume?: {
    text: string
    fileName?: string
    targetRole?: string
  }
}

const API_KEYS_STORAGE_KEY = 'rage-ai-api-keys'

export function getAPIKeys(): APIKeys {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error reading API keys from localStorage:', error)
    return {}
  }
}

export function setAPIKeys(keys: APIKeys): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys))
  } catch (error) {
    console.error('Error saving API keys to localStorage:', error)
  }
}

export function hasValidAPIKey(): boolean {
  const keys = getAPIKeys()
  return Boolean(
    keys.openai?.key?.trim() ||
    keys.gemini?.key?.trim() ||
    keys.nemotron?.key?.trim()
  )
}

export function getOpenAIKey(): string | undefined {
  return getAPIKeys().openai?.key?.trim() || undefined
}

export function getGeminiKey(): string | undefined {
  return getAPIKeys().gemini?.key?.trim() || undefined
}

export function getNemotronKey(): string | undefined {
  return getAPIKeys().nemotron?.key?.trim() || undefined
}

export function getConfiguredModelCount(keys: APIKeys): number {
  let count = 0
  if (keys.gemini?.key?.trim()) count += 1
  if (keys.nemotron?.key?.trim()) count += 1
  if (keys.openai?.key?.trim()) count += 1
  return count
}
