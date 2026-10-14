'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { BookOpen, Plus, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react'

interface Step {
  id: string
  title: string
  body: string
  order: number
}

export default function NewGuidePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [published, setPublished] = useState(false)
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', title: '', body: '', order: 0 },
  ])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
  }, [])

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: '',
      body: '',
      order: steps.length,
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (id: string) => {
    if (steps.length === 1) return
    setSteps(steps.filter((s) => s.id !== id))
  }

  const updateStep = (id: string, field: keyof Step, value: string) => {
    setSteps(
      steps.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps]
    if (direction === 'up' && index > 0) {
      ;[newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]]
    } else if (direction === 'down' && index < steps.length - 1) {
      ;[newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]]
    }
    setSteps(newSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!title || !summary || !categoryId) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (steps.some((s) => !s.title || !s.body)) {
      setError('Please fill in all step titles and bodies')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          categoryId,
          published,
          steps: steps.map((s, i) => ({ ...s, order: i })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create guide')
      }

      router.push('/admin')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
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
              Cancel
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create New Guide</h2>
          <p className="text-gray-600 mt-2">Fill in the details below to create a new troubleshooting guide.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Wi-Fi Not Connecting"
                />
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  Summary *
                </label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Brief description of what this guide covers..."
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                  Publish immediately
                </label>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Steps</h3>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-md font-medium text-gray-900">
                      Step {index + 1}
                    </h4>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        disabled={steps.length === 1}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                      placeholder="Step title"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Body (Markdown)
                        </label>
                        <textarea
                          value={step.body}
                          onChange={(e) => updateStep(step.id, 'body', e.target.value)}
                          placeholder="Step instructions in markdown..."
                          required
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preview
                        </label>
                        <div className="w-full h-48 px-4 py-2 border border-gray-200 rounded-lg bg-white overflow-auto">
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>
                              {step.body || '*Preview will appear here*'}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Guide'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-all border border-gray-200"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
