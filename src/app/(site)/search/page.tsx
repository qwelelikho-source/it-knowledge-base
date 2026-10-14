import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, SearchX } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/format'
import { excerpt, matchesTitleOrSummary, scoreGuide, searchTerms } from '@/lib/search'
import { Highlight } from '@/components/highlight'
import { SearchBox } from '@/components/search-box'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Search guides' }

type SearchParams = Promise<{ q?: string | string[]; category?: string | string[] }>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

function buildHref(q: string, category?: string) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const qs = params.toString()
  return qs ? `/search?${qs}` : '/search'
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const query = first(sp.q).trim().slice(0, 100)
  const categorySlug = first(sp.category)
  const terms = searchTerms(query)

  const [categories, allInScope] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { guides: { where: { published: true } } } } },
    }),
    prisma.guide.findMany({
      where: { published: true, ...(categorySlug ? { category: { slug: categorySlug } } : {}) },
      include: { category: true, steps: { orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  // Every term must match somewhere; best matches (title > summary > steps) first,
  // newest first within the same score.
  const guides = terms.length
    ? allInScope
        .map((guide) => ({ guide, score: scoreGuide(guide, terms) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score || +b.guide.updatedAt - +a.guide.updatedAt)
        .map((r) => r.guide)
    : allInScope

  const activeCategory = categories.find((c) => c.slug === categorySlug)
  const total = categories.reduce((n, c) => n + c._count.guides, 0)
  const filtered = Boolean(query || categorySlug)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {activeCategory ? activeCategory.name : 'All guides'}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Search by keyword. Every word you type has to appear somewhere in the guide.
      </p>

      <div className="mt-6 max-w-2xl">
        <SearchBox defaultValue={query} category={categorySlug || undefined} autoFocus={!query} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <Chip href={buildHref(query)} active={!categorySlug}>
          All <span className="text-muted-foreground">{total}</span>
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} href={buildHref(query, c.slug)} active={c.slug === categorySlug}>
            {c.name} <span className="text-muted-foreground">{c._count.guides}</span>
          </Chip>
        ))}
      </div>

      <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
        {guides.length} {guides.length === 1 ? 'guide' : 'guides'}
        {query ? <> matching “{query}”</> : null}
        {activeCategory ? <> in {activeCategory.name}</> : null}
      </p>

      {guides.length > 0 ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {guides.map((guide) => {
            const stepHit = terms.length
              ? guide.steps
                  .map((s, i) => ({ i, text: excerpt(`${s.title}. ${s.body}`, terms) }))
                  .find((s) => s.text)
              : undefined
            const inTitleOrSummary = matchesTitleOrSummary(guide, terms)

            return (
              <li key={guide.id}>
                <Link
                  href={`/guides/${guide.slug}`}
                  className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="flex h-full flex-col gap-3 rounded-xl p-5 shadow-soft transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lift">
                    <Badge variant="secondary" className="w-fit">
                      {guide.category.name}
                    </Badge>
                    <h2 className="font-semibold leading-snug group-hover:text-primary">
                      <Highlight text={guide.title} terms={terms} />
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      <Highlight text={guide.summary} terms={terms} />
                    </p>
                    {stepHit && !inTitleOrSummary && (
                      <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Step {stepHit.i + 1}:</span>{' '}
                        <Highlight text={stepHit.text!} terms={terms} />
                      </p>
                    )}
                    <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      Updated {formatDate(guide.updatedAt)} · {guide.steps.length}{' '}
                      {guide.steps.length === 1 ? 'step' : 'steps'}
                    </p>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <Card className="mt-4 flex flex-col items-center rounded-xl px-6 py-14 text-center shadow-soft">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <SearchX className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold">
            {filtered ? 'No guides match your search' : 'No guides have been published yet'}
          </h2>
          {filtered && (
            <>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>Check the spelling, or try a shorter keyword.</li>
                <li>Use fewer words. Every word has to match.</li>
                <li>Remove the category filter to search everything.</li>
              </ul>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/search">Clear search and filters</Link>
              </Button>
            </>
          )}
        </Card>
      )}
    </div>
  )
}

function Chip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground [&_span]:text-primary-foreground/80'
          : 'bg-card text-foreground hover:border-primary/40'
      )}
    >
      {children}
    </Link>
  )
}
