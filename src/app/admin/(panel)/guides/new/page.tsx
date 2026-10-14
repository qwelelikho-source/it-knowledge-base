import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { GuideForm } from '@/components/admin/guide-form'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin · New guide' }

export default async function NewGuidePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">New guide</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Describe the problem, then add the steps in the order someone should follow them.
      </p>
      <GuideForm categories={categories} />
    </div>
  )
}
