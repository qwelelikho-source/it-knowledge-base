'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BookOpen, Plus, FolderOpen, LogOut, Edit, Trash2, ExternalLink, FileText, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [guides, setGuides] = useState<any[]>([])
  const [feedbackMap, setFeedbackMap] = useState<Record<string, { helpful: number; notHelpful: number }>>({})

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/admin/guides')
      const data = await response.json()
      setGuides(data.guides)
      setFeedbackMap(data.feedbackMap)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Site
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Guides</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{guides.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {guides.filter((g) => g.published).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {guides.filter((g) => !g.published).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Guides</h2>
          <div className="flex gap-4">
            <Link
              href="/admin/guides/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Guide
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors border border-gray-200"
            >
              <FolderOpen className="h-4 w-4" />
              Manage Categories
            </Link>
          </div>
        </div>

        {/* Guides Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Helpful
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Not Helpful
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guides.map((guide) => {
                  const feedback = feedbackMap[guide.id] || { helpful: 0, notHelpful: 0 }
                  return (
                    <tr key={guide.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {guide.title}
                        </div>
                        <div className="text-xs text-gray-500">{guide.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {guide.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          guide.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {guide.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {feedback.helpful}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {feedback.notHelpful}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(guide.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/guides/${guide.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteButton guideId={guide.id} guideTitle={guide.title} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteButton({ guideId, guideTitle }: { guideId: string; guideTitle: string }) {
  return (
    <form
      action={`/api/guides/${guideId}`}
      method="DELETE"
      onSubmit={(e) => {
        if (!confirm(`Are you sure you want to delete "${guideTitle}"?`)) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  )
}
