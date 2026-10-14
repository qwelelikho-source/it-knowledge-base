import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { CategoryManager } from '@/components/admin/category-manager'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Admin · Categories' }

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { guides: true } } },
  })

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">
        Categories group guides on the home page and in search. A category can only be deleted when it has no guides.
      </p>
      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          guideCount: c._count.guides,
        }))}
      />
    </div>
  )
}
