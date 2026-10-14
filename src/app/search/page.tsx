import { prisma } from '@/lib/prisma'
import { Search as SearchIcon } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface SearchParams {
  q?: string
  category?: string
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const query = searchParams.q || ''
  const categorySlug = searchParams.category || ''

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  let guides: Array<{ id: string; title: string; slug: string; summary: string; category: { name: string } }> = []
  let totalCount = 0

  if (query || categorySlug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { published: true }

    if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { steps: { some: { body: { contains: query, mode: 'insensitive' } } } },
      ]
    }

    guides = await prisma.guide.findMany({
      where,
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    })

    totalCount = guides.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Search Guides
          </h1>

          <form action="/search" method="GET" className="mb-6">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="q"
                  placeholder="Search guides..."
                  defaultValue={query}
                  className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <select
                name="category"
                defaultValue={categorySlug}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>

          {query || categorySlug ? (
            <p className="text-gray-600">
              {totalCount} result{totalCount !== 1 ? 's' : ''} found
            </p>
          ) : (
            <p className="text-gray-600">
              Enter a search term or select a category to find guides
            </p>
          )}
        </header>

        {guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded mb-3">
                  {guide.category.name}
                </span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {guide.summary}
                </p>
              </Link>
            ))}
          </div>
        ) : query || categorySlug ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No guides found matching your search.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
