'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, MessageCircle, RotateCcw, Send, Sparkles, Square, X } from 'lucide-react'
import { Markdown } from '@/components/markdown'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Source = { slug: string; title: string }
type Msg = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  error?: boolean
}

const SUGGESTIONS = [
  'My computer is running slowly',
  "I can't connect to Wi-Fi",
  'Outlook is not syncing',
]

export function ChatWidget() {
  const pathname = usePathname()
  const guideSlug = pathname.startsWith('/guides/') ? pathname.split('/')[2] : undefined

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const nextId = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, open])

  // Stop any in-flight request if the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), [])

  const patchLast = (patch: Partial<Msg>) =>
    setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, ...patch } : m)))

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || loading) return

    const history = messages
      .filter((m) => !m.error && m.content)
      .map(({ role, content }) => ({ role, content }))

    setInput('')
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      { id: `m${nextId.current++}`, role: 'user', content },
      { id: `m${nextId.current++}`, role: 'assistant', content: '' },
    ])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, { role: 'user', content }], guideSlug }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        patchLast({ content: data.error || 'Something went wrong. Please try again.', error: true })
        return
      }

      try {
        const header = res.headers.get('X-Sources')
        if (header) patchLast({ sources: JSON.parse(decodeURIComponent(header)) })
      } catch {
        // Sources are a nice-to-have.
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')
      const decoder = new TextDecoder()
      let answer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        answer += decoder.decode(value, { stream: true })
        patchLast({ content: answer })
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      patchLast({ content: 'The connection was interrupted. Please try again.', error: true })
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const stop = () => abortRef.current?.abort()

  const reset = () => {
    abortRef.current?.abort()
    setMessages([])
    setInput('')
    setLoading(false)
    inputRef.current?.focus()
  }

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="IT assistant"
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          className="fixed bottom-20 right-4 z-50 flex h-[min(620px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] animate-fade-in flex-col overflow-hidden rounded-2xl border bg-card shadow-lift sm:w-[400px]"
        >
          <header className="flex items-center gap-3 border-b px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold leading-tight">IT assistant</h2>
              <p className="truncate text-xs text-muted-foreground">
                {guideSlug ? 'Answers using this guide and others' : 'Answers from our guides'}
              </p>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={reset} aria-label="Start a new chat" className="h-8 w-8">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Describe what&apos;s going wrong and I&apos;ll walk you through the fix using the guides in this
                  knowledge base.
                </p>
                <div className="flex flex-col items-start gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border bg-background px-3 py-1.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent/50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => {
                const isLast = i === messages.length - 1
                const typing = isLast && loading && m.role === 'assistant' && !m.content
                return (
                  <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm',
                        m.role === 'user'
                          ? 'rounded-br-md bg-primary text-primary-foreground'
                          : m.error
                            ? 'rounded-bl-md border border-destructive/30 bg-destructive/10 text-destructive'
                            : 'rounded-bl-md bg-secondary'
                      )}
                    >
                      {typing ? (
                        <span className="flex items-center gap-1 py-1" role="status" aria-label="Assistant is typing">
                          {[0, 1, 2].map((d) => (
                            <span
                              key={d}
                              className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
                              style={{ animationDelay: `${d * 150}ms` }}
                            />
                          ))}
                        </span>
                      ) : m.role === 'user' || m.error ? (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      ) : (
                        <Markdown className="text-sm [&_p]:leading-6 [&_pre]:text-xs">{m.content}</Markdown>
                      )}

                      {m.role === 'assistant' && !m.error && m.sources && m.sources.length > 0 && m.content && !(isLast && loading) && (
                        <div className="mt-3 border-t pt-2">
                          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Related guides</p>
                          <ul className="space-y-1">
                            {m.sources.map((s) => (
                              <li key={s.slug}>
                                <Link
                                  href={`/guides/${s.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                >
                                  <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                  {s.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="border-t p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border bg-background p-1.5 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder="Describe your problem…"
                aria-label="Message"
                className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              {loading ? (
                <Button type="button" size="icon" variant="secondary" onClick={stop} aria-label="Stop" className="h-9 w-9 shrink-0">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send" className="h-9 w-9 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="mt-2 px-1 text-[11px] text-muted-foreground">
              AI can make mistakes. Check the linked guides for the full steps.
            </p>
          </form>
        </section>
      )}

      <Button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close IT assistant' : 'Open IT assistant'}
        className="fixed bottom-4 right-4 z-50 h-12 gap-2 rounded-full px-4 shadow-lift"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask AI'}</span>
      </Button>
    </>
  )
}
