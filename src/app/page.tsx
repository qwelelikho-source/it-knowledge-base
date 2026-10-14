import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Search, FileText, TrendingUp, ArrowRight, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-20 md:py-32">
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Find Solutions Fast
            </h1>
            <p className="text-xl text-muted-foreground">
              Search our comprehensive library of IT troubleshooting guides to resolve common issues quickly and efficiently.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form action="/search" method="GET" className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 rounded-xl blur-xl opacity-20"></div>
                <div className="relative flex items-center bg-background border-2 border-primary/20 rounded-xl shadow-lg">
                  <Search className="absolute left-4 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    name="q"
                    placeholder="Search for guides..."
                    className="pl-12 pr-32 h-14 text-lg border-0 bg-transparent focus-visible:ring-0"
                  />
                  <div className="absolute right-2 flex items-center gap-2">
                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-md border">
                      <Command className="h-3 w-3" />
                      K
                    </kbd>
                    <Button type="submit" size="lg" className="h-10">
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <div className="flex items-center gap-2 mb-8">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Browse by Category</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription>
                    Browse all {category.name.toLowerCase()} guides
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    View guides
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Guides Section */}
      <section className="container py-16">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Recently Updated</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentGuides.map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {guide.category.name}
                  </Badge>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {guide.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Updated {new Date(guide.updatedAt).toLocaleDateString()}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-semibold">IT Knowledge Base</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted source for troubleshooting guides
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
