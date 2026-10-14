import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { categoryIcon } from '@/lib/category-icon'
import { formatDate } from '@/lib/format'
import { SearchBox } from '@/components/search-box'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [categories, recentGuides] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { guides: { where: { published: true } } } } },
    }),
    prisma.guide.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    }),
  ])

  const suggestions = recentGuides.slice(0, 4)

  return (
    <>
      <section className="relative isolate overflow-hidden border-b">
        <div className="bg-grid absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Find the fix for your IT problem
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-muted-foreground">
              Search step-by-step troubleshooting guides, or browse by category.
            </p>
            <div className="mt-8">
              <SearchBox size="lg" placeholder="Describe the problem, e.g. printer offline" />
            </div>
            {suggestions.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Try:</span>
                {suggestions.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.slug}`}
                    className="rounded-full border bg-card px-3 py-1 text-muted-foreground shadow-soft transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {guide.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Browse by category</h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = categoryIcon(category.slug)
              const count = category._count.guides
              return (
                <Link
                  key={category.id}
                  href={`/search?category=${category.slug}`}
                  className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="flex h-full items-center gap-4 rounded-xl p-5 shadow-soft transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lift">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {count} {count === 1 ? 'guide' : 'guides'}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Recently updated</h2>
          <Link href="/search" className="text-sm font-medium text-primary hover:underline">
            View all guides
          </Link>
        </div>
        {recentGuides.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No guides have been published yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentGuides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="flex h-full flex-col gap-3 rounded-xl p-5 shadow-soft transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lift">
                  <Badge variant="secondary" className="w-fit">
                    {guide.category.name}
                  </Badge>
                  <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
                    {guide.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{guide.summary}</p>
                  <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    Updated {formatDate(guide.updatedAt)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
