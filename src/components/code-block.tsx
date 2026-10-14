'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

export function CodeBlock({ code, children }: { code: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy. Select the text and copy it manually.')
    }
  }

  return (
    <div className="group relative my-4">
      <pre className="overflow-x-auto rounded-lg border bg-muted/60 p-4 pr-12 font-mono text-[13px] leading-relaxed">
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border bg-card text-muted-foreground shadow-soft transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}
