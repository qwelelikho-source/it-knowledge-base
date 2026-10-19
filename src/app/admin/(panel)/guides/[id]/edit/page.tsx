import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { GuideForm } from '@/components/admin/guide-form'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin · Edit guide' }

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [guide, categories] = await Promise.all([
    prisma.guide.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  if (!guide) notFound()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Edit guide</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">{guide.title}</p>
      <GuideForm
        categories={categories}
        initial={{
          id: guide.id,
          title: guide.title,
          summary: guide.summary,
          categoryId: guide.categoryId,
          published: guide.published,
          steps: guide.steps.map((s) => ({ title: s.title, body: s.body })),
        }}
      />
    </div>
  )
}
