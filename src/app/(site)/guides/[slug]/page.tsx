import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Clock, ListChecks } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/format'
import { FeedbackWidget } from '@/components/feedback-widget'
import { Markdown } from '@/components/markdown'
import { StepNav } from '@/components/step-nav'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

async function getGuide(slug: string) {
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: { category: true, steps: { orderBy: { order: 'asc' } } },
  })
  return guide && guide.published ? guide : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = await getGuide(slug)
  return guide ? { title: guide.title, description: guide.summary } : { title: 'Guide not found' }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = await getGuide(slug)
  if (!guide) notFound()

  const related = await prisma.guide.findMany({
    where: { published: true, categoryId: guide.categoryId, NOT: { id: guide.id } },
    orderBy: { updatedAt: 'desc' },
    take: 3,
    select: { id: true, slug: true, title: true, summary: true },
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link href={`/search?category=${guide.category.slug}`} className="hover:text-foreground">
          {guide.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span aria-current="page" className="truncate text-foreground">{guide.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          <header className="max-w-3xl">
            <Badge variant="secondary">{guide.category.name}</Badge>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {guide.title}
            </h1>
            <p className="mt-3 text-pretty text-lg text-muted-foreground">{guide.summary}</p>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden />
                Updated {formatDate(guide.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" aria-hidden />
                {guide.steps.length} {guide.steps.length === 1 ? 'step' : 'steps'}
              </span>
            </p>
          </header>

          <ol className="mt-10 max-w-3xl">
            {guide.steps.map((step, index) => {
              const last = index === guide.steps.length - 1
              return (
                <li key={step.id} id={`step-${step.id}`} className="relative pb-8 pl-14 last:pb-0">
                  {!last && (
                    <span aria-hidden className="absolute left-[17px] top-10 bottom-0 w-px bg-border" />
                  )}
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-soft ring-4 ring-background"
                  >
                    {index + 1}
                  </span>
                  <Card className="rounded-xl p-5 shadow-soft sm:p-6">
                    <h2 className="text-lg font-semibold leading-snug">
                      <span className="sr-only">Step {index + 1}: </span>
                      {step.title}
                    </h2>
                    <Markdown className="mt-2">{step.body}</Markdown>
                  </Card>
                </li>
              )
            })}
          </ol>

          <div className="mt-12 max-w-3xl">
            <FeedbackWidget guideId={guide.id} />
          </div>

          {related.length > 0 && (
            <section className="mt-12 max-w-3xl">
              <h2 className="text-lg font-semibold">More in {guide.category.name}</h2>
              <ul className="mt-3 divide-y rounded-xl border bg-card shadow-soft">
                {related.map((g) => (
                  <li key={g.id}>
                    <Link href={`/guides/${g.slug}`} className="block px-4 py-3 transition-colors hover:bg-accent/50">
                      <span className="font-medium">{g.title}</span>
                      <span className="mt-0.5 line-clamp-1 block text-sm text-muted-foreground">{g.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <StepNav steps={guide.steps.map((s) => ({ id: s.id, title: s.title }))} />
          </div>
        </aside>
      </div>
    </div>
  )
}
