"use client"

import React, { useMemo, useState } from "react"
import { X, Copy, Check, Download, Eye, Code2, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import MarkdownRenderer from "./markdown-renderer"

interface ArtifactDrawerProps {
  content: string | null
  onClose: () => void
}

interface ExtractedBlock {
  lang: string
  code: string
}

function extractFirstRenderableBlock(markdown: string): ExtractedBlock | null {
  const regex = /```(html|svg|ics|mermaid)\s*\n([\s\S]*?)```/i
  const match = regex.exec(markdown)
  if (!match) return null
  return {
    lang: match[1].toLowerCase(),
    code: match[2].trim(),
  }
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ArtifactDrawer({ content, onClose }: ArtifactDrawerProps) {
  const [copied, setCopied] = useState(false)
  const block = useMemo(() => (content ? extractFirstRenderableBlock(content) : null), [content])
  const canRenderHtml = block?.lang === "html" || block?.lang === "svg"
  const [tab, setTab] = useState<"preview" | "source">("preview")

  if (!content) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block?.code || content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] md:w-[540px] bg-[#0e0b0b] border-l border-white/10 shadow-2xl shadow-black/80 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
          <div>
            <h3 className="text-sm font-semibold text-white">Artifact Preview</h3>
            <p className="text-[11px] text-zinc-500">
              {block ? `${block.lang.toUpperCase()} block detected` : "Formatted Report & Export"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Close artifact preview"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-white/[0.06] bg-[#130f0f]">
        <div className="flex items-center gap-1 rounded-lg bg-[#0b0909] p-1 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              tab === "preview" ? "bg-red-500/20 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("source")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
              tab === "source" ? "bg-red-500/20 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Source</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0b0909] px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-red-500/35 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-red-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadFile("rage-ai-artifact.md", content, "text/markdown;charset=utf-8")}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0b0909] px-2.5 py-1.5 text-[11px] text-zinc-300 hover:border-red-500/35 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>.md</span>
          </button>

          {block?.lang === "ics" && (
            <button
              type="button"
              onClick={() => downloadFile("event.ics", block.code, "text/calendar;charset=utf-8")}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/15 px-2.5 py-1.5 text-[11px] text-red-200 hover:bg-red-500/25 transition-colors cursor-pointer"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span>.ics</span>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {tab === "preview" ? (
          canRenderHtml && block ? (
            <div className="h-full min-h-[420px] rounded-xl overflow-hidden border border-white/10 bg-white">
              <iframe
                title="Rage AI HTML Preview"
                sandbox=""
                srcDoc={
                  block.lang === "svg"
                    ? `<!doctype html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0b0909;">${block.code}</body></html>`
                    : block.code
                }
                className="w-full h-full min-h-[420px] border-0"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.08] bg-[#141010] p-5 text-zinc-200">
              <MarkdownRenderer content={content} />
            </div>
          )
        ) : (
          <pre className="rounded-xl border border-white/[0.08] bg-[#141010] p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-words">
            {block?.code || content}
          </pre>
        )}
      </div>
    </aside>
  )
}
