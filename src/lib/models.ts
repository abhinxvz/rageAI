import { APIKeys } from './api-keys'
export type { APIKeys }

export type ModelProvider = 'openai' | 'gemini' | 'nemotron'

export interface ModelConfig {
  id: string
  name: string
  provider: ModelProvider
  badge?: string
  disabled?: boolean
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Google Gemini (Free Tier via Google AI Studio)
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "gemini",
    badge: "Free Tier"
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    provider: "gemini",
    badge: "Free Tier"
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    provider: "gemini",
    badge: "Free Tier"
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    badge: "Free Tier"
  },

  // NVIDIA Nemotron (Free Tier via NVIDIA NIM)
  {
    id: "nvidia/nemotron-3.5-super-vl-120b-a12b",
    name: "Nemotron 3.5 Super 120B",
    provider: "nemotron",
    badge: "Free Tier"
  },
  {
    id: "nvidia/nemotron-3.5-lightning-30b-a3b",
    name: "Nemotron 3.5 Lightning 30B",
    provider: "nemotron",
    badge: "Free Tier"
  },
  {
    id: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    name: "Llama 3.3 Nemotron 49B",
    provider: "nemotron",
    badge: "Free Tier"
  },
  {
    id: "nvidia/nemotron-3.5-bolt-e4b",
    name: "Nemotron 3.5 Bolt E4B",
    provider: "nemotron",
    badge: "Free Tier"
  },

  // OpenAI / ChatGPT
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    badge: "Fast"
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai"
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "openai",
    badge: "Latest"
  },
  {
    id: "gpt-5-chat-latest",
    name: "GPT-5 Chat",
    provider: "openai",
    badge: "Latest"
  },
]

export function getApiKeyForProvider(keys: APIKeys, provider: ModelProvider | null): string | undefined {
  if (!provider) return undefined
  return keys[provider]?.key?.trim() || undefined
}

export function getModelsForKeys(keys: APIKeys): ModelConfig[] {
  return AVAILABLE_MODELS.map(model => ({
    ...model,
    disabled: !getApiKeyForProvider(keys, model.provider)
  }))
}

export function getProviderForModel(modelId: string): ModelProvider | null {
  const model = AVAILABLE_MODELS.find(m => m.id === modelId)
  if (model) return model.provider
  if (modelId.startsWith('gemini')) return 'gemini'
  if (modelId.startsWith('nvidia/')) return 'nemotron'
  if (modelId.startsWith('gpt-') || /^o\d/.test(modelId)) return 'openai'
  return null
}

export function getDefaultModelForKeys(keys: APIKeys): string {
  if (keys.gemini?.key?.trim()) return 'gemini-3.8-flash'
  if (keys.nemotron?.key?.trim()) return 'nvidia/nemotron-3.5-super-vl-120b-a12b'
  if (keys.openai?.key?.trim()) return 'gpt-4o-mini'
  return 'gemini-3.8-flash'
}

export function getFallbackModelForKeys(currentModel: string, keys: APIKeys): string | null {
  const currentProvider = getProviderForModel(currentModel)
  const candidates: Array<{ provider: 'gemini' | 'nemotron' | 'openai'; model: string }> = [
    { provider: 'nemotron', model: 'nvidia/nemotron-3.5-super-vl-120b-a12b' },
    { provider: 'gemini', model: 'gemini-3.8-flash' },
    { provider: 'openai', model: 'gpt-4o-mini' },
  ]

  for (const candidate of candidates) {
    if (candidate.provider !== currentProvider && keys[candidate.provider]?.key?.trim()) {
      return candidate.model
    }
  }
  return null
}
