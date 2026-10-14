import { prisma } from '@/lib/prisma'
import { Search as SearchIcon, BookOpen, ArrowRight } from 'lucide-react'
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

  let guides = []
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">IT Knowledge Base</h1>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Search Guides
          </h2>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <form action="/search" method="GET">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search guides..."
                    defaultValue={query}
                    className="w-full px-4 py-3 pl-12 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  name="category"
                  defaultValue={categorySlug}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                >
                  Search
                </button>
              </div>
            </form>

            {query || categorySlug ? (
              <p className="text-gray-600">
                <span className="font-semibold">{totalCount}</span> result{totalCount !== 1 ? 's' : ''} found
              </p>
            ) : (
              <p className="text-gray-600">
                Enter a search term or select a category to find guides
              </p>
            )}
          </div>

          {/* Results */}
          {guides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug}`}
                  className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full mb-3">
                    {guide.category.name}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {guide.summary}
                  </p>
                </Link>
              ))}
            </div>
          ) : query || categorySlug ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                No guides found matching your search.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try different keywords or browse by category
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
