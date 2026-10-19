import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, FileText, Pencil, Plus, ThumbsDown, ThumbsUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/format'
import { DeleteGuideButton } from '@/components/admin/delete-guide-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin · Guides' }

export default async function AdminDashboard() {
  const [guides, counts] = await Promise.all([
    prisma.guide.findMany({ include: { category: true }, orderBy: { updatedAt: 'desc' } }),
    prisma.feedback.groupBy({ by: ['guideId', 'helpful'], _count: { _all: true } }),
  ])

  const feedback = new Map<string, { up: number; down: number }>()
  for (const row of counts) {
    const entry = feedback.get(row.guideId) ?? { up: 0, down: 0 }
    if (row.helpful) entry.up = row._count._all
    else entry.down = row._count._all
    feedback.set(row.guideId, entry)
  }

  const published = guides.filter((g) => g.published).length
  const stats = [
    { label: 'Total guides', value: guides.length },
    { label: 'Published', value: published },
    { label: 'Drafts', value: guides.length - published },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guides</h1>
          <p className="text-sm text-muted-foreground">Create, edit and publish troubleshooting guides.</p>
        </div>
        <Button asChild>
          <Link href="/admin/guides/new">
            <Plus className="h-4 w-4" />
            New guide
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-xl p-5 shadow-soft">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{s.value}</p>
          </Card>
        ))}
      </div>

      {guides.length === 0 ? (
        <Card className="flex flex-col items-center rounded-xl px-6 py-14 text-center shadow-soft">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="font-semibold">No guides yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Write your first guide to get started.</p>
          <Button asChild className="mt-5">
            <Link href="/admin/guides/new">New guide</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-xl shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guide</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.map((guide) => {
                const fb = feedback.get(guide.id) ?? { up: 0, down: 0 }
                return (
                  <TableRow key={guide.id}>
                    <TableCell className="max-w-xs">
                      <p className="truncate font-medium">{guide.title}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">/guides/{guide.slug}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{guide.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {guide.published ? (
                        <Badge className="border-transparent bg-success/15 text-success hover:bg-success/15">Published</Badge>
                      ) : (
                        <Badge className="border-transparent bg-warning/15 text-warning hover:bg-warning/15">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-3 text-sm tabular-nums text-muted-foreground">
                        <span className="inline-flex items-center gap-1" title="Helpful">
                          <ThumbsUp className="h-3.5 w-3.5" /> {fb.up}
                        </span>
                        <span className="inline-flex items-center gap-1" title="Not helpful">
                          <ThumbsDown className="h-3.5 w-3.5" /> {fb.down}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(guide.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {guide.published && (
                          <Button variant="ghost" size="icon" asChild aria-label={`View ${guide.title}`}>
                            <Link href={`/guides/${guide.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild aria-label={`Edit ${guide.title}`}>
                          <Link href={`/admin/guides/${guide.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteGuideButton guideId={guide.id} guideTitle={guide.title} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
