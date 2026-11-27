"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { APIKeys, getAPIKeys, setAPIKeys } from '@/lib/api-keys'
import { Textarea } from '@/components/ui/textarea'
import { X, KeyRound, ExternalLink, Webhook, Briefcase, Upload } from 'lucide-react'
import { SiGooglegemini, SiNvidia, SiOpenai } from 'react-icons/si'

interface KeysManagerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedKeys: APIKeys) => void
}

export function KeysManager({ isOpen, onClose, onSave }: KeysManagerProps) {
  const [keys, setKeys] = useState<APIKeys>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setKeys(getAPIKeys())
    }
  }, [isOpen])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const cleaned: APIKeys = {
        gemini: keys.gemini?.key?.trim() ? { key: keys.gemini.key.trim() } : undefined,
        nemotron: keys.nemotron?.key?.trim() ? { key: keys.nemotron.key.trim() } : undefined,
        openai: keys.openai?.key?.trim() ? { key: keys.openai.key.trim() } : undefined,
        webhooks:
          keys.webhooks?.discord?.trim() || keys.webhooks?.slack?.trim()
            ? {
                discord: keys.webhooks?.discord?.trim() || undefined,
                slack: keys.webhooks?.slack?.trim() || undefined,
              }
            : undefined,
        resume: keys.resume?.text?.trim()
          ? {
              text: keys.resume.text.trim(),
              fileName: keys.resume.fileName,
              targetRole: keys.resume.targetRole?.trim() || undefined,
            }
          : undefined,
      }
      setAPIKeys(cleaned)
      onSave(cleaned)
    } catch (error) {
      console.error('Error saving API keys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateKey = (provider: 'openai' | 'gemini' | 'nemotron', value: string) => {
    setKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        key: value
      }
    }))
  }

  const updateWebhook = (target: 'discord' | 'slack', value: string) => {
    setKeys(prev => ({
      ...prev,
      webhooks: {
        ...prev.webhooks,
        [target]: value
      }
    }))
  }

  const updateResume = (patch: { text?: string; fileName?: string; targetRole?: string }) => {
    setKeys(prev => ({
      ...prev,
      resume: {
        text: prev.resume?.text || '',
        ...prev.resume,
        ...patch,
      }
    }))
  }

  const handleResumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const content = await file.text()
      updateResume({ text: content.slice(0, 16000), fileName: file.name })
    } catch (error) {
      console.error('Failed to read resume file:', error)
    }
  }

  const hasAnyKey = Boolean(
    keys.gemini?.key?.trim() ||
    keys.nemotron?.key?.trim() ||
    keys.openai?.key?.trim()
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#120e0e] border border-white/10 text-white shadow-2xl shadow-red-950/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">
              Keys, Webhooks &amp; Resume
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <p className="text-sm text-zinc-400">
            Keys and webhooks stay in your browser&apos;s localStorage. Add 2+ model providers to unlock automatic rate-limit failover and side-by-side Versus comparisons.
          </p>

          {/* Google Gemini API Key */}
          <div className="space-y-2.5 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SiGooglegemini className="h-4 w-4 text-red-400" />
                <h3 className="font-medium text-white">Google Gemini API Key</h3>
                <Badge className="bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/20">
                  Free Tier
                </Badge>
              </div>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
              >
                Get Google AI Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Input
              type="password"
              placeholder="AIza..."
              value={keys.gemini?.key || ''}
              onChange={(e) => updateKey('gemini', e.target.value)}
              className="font-mono text-sm bg-[#0b0909] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
            />
            <p className="text-xs text-zinc-500">
              Supports Gemini 3.8 Flash, Gemini 3.5 Flash-Lite, and Gemini 2.5 Flash on Google AI Studio free tier.
            </p>
          </div>

          {/* NVIDIA Nemotron API Key */}
          <div className="space-y-2.5 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SiNvidia className="h-4 w-4 text-red-400" />
                <h3 className="font-medium text-white">NVIDIA Nemotron API Key</h3>
                <Badge className="bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/20">
                  Free NIM Tier
                </Badge>
              </div>
              <a
                href="https://build.nvidia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
              >
                Get NVIDIA NIM Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Input
              type="password"
              placeholder="nvapi-..."
              value={keys.nemotron?.key || ''}
              onChange={(e) => updateKey('nemotron', e.target.value)}
              className="font-mono text-sm bg-[#0b0909] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
            />
            <p className="text-xs text-zinc-500">
              Works with Nemotron 3.5 Super 120B, Lightning 30B, Llama 3.3 Nemotron 49B, and Bolt E4B via build.nvidia.com.
            </p>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2.5 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SiOpenai className="h-4 w-4 text-zinc-300" />
                <h3 className="font-medium text-white">OpenAI (ChatGPT) API Key</h3>
                <Badge variant="secondary" className="bg-white/10 text-zinc-300 border-white/10">
                  GPT
                </Badge>
              </div>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
              >
                Get OpenAI Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <Input
              type="password"
              placeholder="sk-..."
              value={keys.openai?.key || ''}
              onChange={(e) => updateKey('openai', e.target.value)}
              className="font-mono text-sm bg-[#0b0909] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
            />
            <p className="text-xs text-zinc-500">
              Supports GPT-4o Mini, GPT-4o, GPT-5, and GPT-5 Chat.
            </p>
          </div>

          {/* Zero-OAuth Webhooks */}
          <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-red-400" />
                <h3 className="font-medium text-white">Channel Webhooks (Optional)</h3>
                <Badge variant="secondary" className="bg-white/10 text-zinc-300 border-white/10">
                  Zero OAuth
                </Badge>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Paste a Discord or Slack incoming webhook URL so Rage AI can push daily briefings, summaries, and alerts straight to your channel.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Discord Webhook URL</label>
                <Input
                  type="password"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={keys.webhooks?.discord || ''}
                  onChange={(e) => updateWebhook('discord', e.target.value)}
                  className="font-mono text-xs bg-[#0b0909] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Slack Webhook URL</label>
                <Input
                  type="password"
                  placeholder="https://hooks.slack.com/services/..."
                  value={keys.webhooks?.slack || ''}
                  onChange={(e) => updateWebhook('slack', e.target.value)}
                  className="font-mono text-xs bg-[#0b0909] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
                />
              </div>
            </div>
          </div>

          {/* Resume & Job Match Profile */}
          <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-red-400" />
                <h3 className="font-medium text-white">Resume &amp; Job Match Profile</h3>
                <Badge className="bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/20">
                  Job Scraper
                </Badge>
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>{keys.resume?.fileName ? keys.resume.fileName : 'Upload .txt / .md'}</span>
                <input
                  type="file"
                  accept=".txt,.md,.markdown"
                  onChange={handleResumeFile}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              Add your resume once to match live job openings, draft tailored Gmail outreach, schedule follow-ups on Calendar, save briefs to Docs, or push alerts to Discord.
            </p>
            <Input
              type="text"
              placeholder="Target role (e.g. Full-Stack TypeScript / AI Engineer)"
              value={keys.resume?.targetRole || ''}
              onChange={(e) => updateResume({ targetRole: e.target.value })}
              className="text-xs bg-[#0b0909] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
            />
            <Textarea
              placeholder="Paste your resume text, skills, and experience here..."
              value={keys.resume?.text || ''}
              onChange={(e) => updateResume({ text: e.target.value })}
              rows={4}
              className="text-xs bg-[#0b0909] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-red-500/40"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasAnyKey}
              className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#ef4444] hover:to-[#dc2626] text-white border-0 shadow-lg shadow-red-950/50"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            Add at least one API key to start chatting. Keys never leave your browser except when calling your chosen provider.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
