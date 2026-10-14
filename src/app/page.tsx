import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  const recentGuides = await prisma.guide.findMany({
    where: { published: true },
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
    take: 6,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IT Knowledge Base
          </h1>
          <p className="text-lg text-gray-600">
            Find solutions to common IT problems quickly and easily
          </p>
        </header>

        <div className="max-w-2xl mx-auto mb-12">
          <form action="/search" method="GET">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search guides..."
                className="w-full px-4 py-3 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </form>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-900">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recently Updated Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentGuides.map((guide) => (
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
        </section>
      </div>
    </div>
  )
}
