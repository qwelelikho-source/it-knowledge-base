'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit, Trash2, X, FolderOpen } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; _count: { guides: number } }[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    }
    fetchCategories()
  }, [])

  const refreshCategories = async () => {
    const response = await fetch('/api/categories')
    const data = await response.json()
    setCategories(data)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      })

      if (!response.ok) {
        throw new Error('Failed to create category')
      }

      setNewCategoryName('')
      refreshCategories()
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string, guideCount: number) => {
    if (guideCount > 0) {
      alert(`Cannot delete "${name}" because it has ${guideCount} guide(s).`)
      return
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      refreshCategories()
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  const handleRename = async (id: string, currentName: string) => {
    const newName = prompt('Enter new name:', currentName)
    if (!newName || newName === currentName) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })

      if (!response.ok) {
        throw new Error('Failed to rename category')
      }

      refreshCategories()
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

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
            <a
              href="/admin"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Manage Categories</h2>
          <p className="text-gray-600 mt-2">Create, rename, or delete categories for organizing your guides.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Category */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h3>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              <Plus className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Guides
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category._count?.guides || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRename(category.id, category.name)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Rename"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name, category._count?.guides || 0)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
