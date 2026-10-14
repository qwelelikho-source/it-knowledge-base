import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
import { BookOpen, Clock, CheckCircle2, ArrowLeft } from 'lucide-react'
import { FeedbackWidget } from '@/components/feedback-widget'

export default async function GuidePage({
  params,
}: {
  params: { slug: string }
}) {
  const guide = await prisma.guide.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!guide || !guide.published) {
    notFound()
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
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={`/search?category=${guide.category.slug}`} className="hover:text-blue-600 transition-colors">
            {guide.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{guide.title}</span>
        </nav>

        {/* Guide Content */}
        <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-white/20 rounded-full mb-4">
              {guide.category.name}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {guide.title}
            </h1>
            <p className="text-lg text-blue-100 max-w-3xl">
              {guide.summary}
            </p>
            <div className="flex items-center gap-2 mt-4 text-blue-100 text-sm">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date(guide.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Steps */}
          <div className="px-8 py-8">
            <div className="space-y-8">
              {guide.steps.map((step, index) => (
                <div key={step.id} className="relative pl-8">
                  {/* Step Number */}
                  <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>

                  {/* Step Content */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {step.title}
                    </h2>
                    <div className="prose prose-blue max-w-none text-gray-700">
                      <ReactMarkdown>{step.body}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="px-8 py-8 border-t border-gray-100 bg-gray-50">
            <FeedbackWidget guideId={guide.id} />
          </div>
        </article>

        {/* Related Guides */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">More in {guide.category.name}</h3>
          <Link
            href={`/search?category=${guide.category.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 text-blue-600 font-medium"
          >
            View all {guide.category.name} guides
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  )
}
