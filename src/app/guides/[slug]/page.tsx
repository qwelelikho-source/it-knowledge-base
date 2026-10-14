import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Home
        </Link>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <header className="mb-8">
            <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded mb-4">
              {guide.category.name}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {guide.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{guide.summary}</p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(guide.updatedAt).toLocaleDateString()}
            </p>
          </header>

          <div className="space-y-8">
            {guide.steps.map((step, index) => (
              <div key={step.id} className="border-l-4 border-blue-500 pl-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Step {index + 1}: {step.title}
                </h2>
                <div className="prose prose-blue max-w-none text-gray-700">
                  <ReactMarkdown>{step.body}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          <FeedbackWidget guideId={guide.id} />
        </article>
      </div>
    </div>
  )
}
