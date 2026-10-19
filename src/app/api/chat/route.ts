import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { buildSystemPrompt, retrieve } from '@/lib/chat'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const DEFAULT_MODEL = 'claude-haiku-5-5'
const MAX_OUTPUT_TOKENS = 700

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
  guideSlug: z.string().max(200).optional(),
})

const json = (error: string, status: number, headers?: Record<string, string>) =>
  NextResponse.json({ error }, { status, headers })

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return json(
      'The assistant is not set up yet. Add ANTHROPIC_API_KEY to .env and restart the server.',
      503
    )
  }

  // Per-visitor limits: a burst limit and an hourly limit.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const burst = rateLimit(`chat:burst:${ip}`, 8, 60_000)
  const hourly = rateLimit(`chat:hour:${ip}`, 60, 3_600_000)
  if (!burst.ok || !hourly.ok) {
    const wait = Math.max(burst.retryAfter, hourly.retryAfter)
    return json('You are sending messages too quickly. Please wait a moment and try again.', 429, {
      'Retry-After': String(wait),
    })
  }

  let parsed: z.infer<typeof bodySchema>
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return json('Invalid request.', 400)
  }

  // The conversation must start with, and end on, a user message.
  const messages = parsed.messages.slice(-10)
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (messages.length === 0 || messages.at(-1)?.role !== 'user') {
    return json('Invalid request.', 400)
  }

  const guides = await prisma.guide.findMany({
    where: { published: true },
    include: { category: true, steps: { orderBy: { order: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })

  const picked = retrieve(guides, messages, parsed.guideSlug)
  const system = buildSystemPrompt(guides, picked)
  const sources = picked.map((g) => ({ slug: g.slug, title: g.title }))

  const client = new Anthropic({ apiKey })
  const stream = client.messages.stream({
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    system,
    messages,
  })
  request.signal.addEventListener('abort', () => stream.abort())

  async function* textChunks() {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text
      }
    }
  }
  const chunks = textChunks()

  // Wait for the first piece of text so failures (bad key, overloaded API)
  // become a proper error response instead of a broken stream.
  let first: IteratorResult<string>
  try {
    first = await chunks.next()
  } catch (error) {
    console.error('Chat request failed:', error)
    const status = error instanceof Anthropic.APIError ? error.status : undefined
    if (status === 429 || status === 529) {
      return json('The assistant is busy right now. Please try again in a minute.', 503)
    }
    return json('The assistant is unavailable right now. Please try again later.', 502)
  }

  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      if (!first.done) controller.enqueue(encoder.encode(first.value))
      if (first.done) controller.close()
    },
    async pull(controller) {
      if (first.done) return
      try {
        const next = await chunks.next()
        if (next.done) controller.close()
        else controller.enqueue(encoder.encode(next.value))
      } catch (error) {
        console.error('Chat stream failed:', error)
        controller.error(error)
      }
    },
    cancel() {
      stream.abort()
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
      'X-Sources': encodeURIComponent(JSON.stringify(sources)),
    },
  })
}
