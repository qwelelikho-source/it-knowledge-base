'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Markdown } from '@/components/markdown'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { slugify } from '@/lib/slug-client'

type FormStep = { key: string; title: string; body: string }

export type GuideFormValues = {
  id?: string
  title: string
  summary: string
  categoryId: string
  published: boolean
  steps: { title: string; body: string }[]
}

const EMPTY: GuideFormValues = {
  title: '',
  summary: '',
  categoryId: '',
  published: false,
  steps: [{ title: '', body: '' }],
}

export function GuideForm({
  categories,
  initial = EMPTY,
}: {
  categories: { id: string; name: string }[]
  initial?: GuideFormValues
}) {
  const router = useRouter()
  const isEdit = Boolean(initial.id)

  const [title, setTitle] = useState(initial.title)
  const [summary, setSummary] = useState(initial.summary)
  const [categoryId, setCategoryId] = useState(initial.categoryId)
  const [published, setPublished] = useState(initial.published)
  const nextKey = useRef(initial.steps.length)
  const [steps, setSteps] = useState<FormStep[]>(() =>
    (initial.steps.length ? initial.steps : EMPTY.steps).map((s, i) => ({ key: `step-${i}`, ...s }))
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const updateStep = (key: string, patch: Partial<FormStep>) =>
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)))

  const addStep = () =>
    setSteps((prev) => [...prev, { key: `step-${nextKey.current++}`, title: '', body: '' }])

  const removeStep = (key: string) =>
    setSteps((prev) => (prev.length === 1 ? prev : prev.filter((s) => s.key !== key)))

  const moveStep = (index: number, delta: -1 | 1) =>
    setSteps((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !summary.trim()) return setError('Add a title and a summary.')
    if (!categoryId) return setError('Choose a category.')
    if (steps.some((s) => !s.title.trim() || !s.body.trim())) {
      return setError('Every step needs a title and instructions.')
    }

    setSaving(true)
    try {
      const res = await fetch(isEdit ? `/api/guides/${initial.id}` : '/api/guides', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          categoryId,
          published,
          steps: steps.map((s, order) => ({ title: s.title, body: s.body, order })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save the guide')

      toast.success(isEdit ? 'Guide saved' : 'Guide created')
      router.push('/admin')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save the guide'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="space-y-5 rounded-xl p-6 shadow-soft">
        <h2 className="font-semibold">Details</h2>

        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Wi-Fi not connecting"
            required
          />
          {title.trim() && (
            <p className="text-xs text-muted-foreground">
              Address: <span className="font-mono">/guides/{slugify(title) || 'guide'}</span>
              {isEdit && ' (changes only if you rename the guide)'}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="summary" className="text-sm font-medium">Summary</label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="One or two sentences on the problem this guide solves."
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="category" className="text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No categories yet. <Link href="/admin/categories" className="text-primary underline">Create one first</Link>.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <Select value={published ? 'published' : 'draft'} onValueChange={(v) => setPublished(v === 'published')}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (hidden from the public)</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Steps</h2>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-4 w-4" />
            Add step
          </Button>
        </div>

        {steps.map((step, index) => (
          <Card key={step.key} className="space-y-4 rounded-xl p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <Input
                value={step.title}
                onChange={(e) => updateStep(step.key, { title: e.target.value })}
                placeholder="Step title, e.g. Restart your router"
                aria-label={`Step ${index + 1} title`}
              />
              <div className="flex shrink-0 gap-0.5">
                <Button type="button" variant="ghost" size="icon" onClick={() => moveStep(index, -1)} disabled={index === 0} aria-label="Move step up">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1} aria-label="Move step down">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(step.key)} disabled={steps.length === 1} aria-label="Delete step" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="write">
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write">
                <Textarea
                  value={step.body}
                  onChange={(e) => updateStep(step.key, { body: e.target.value })}
                  rows={7}
                  placeholder={'Instructions in Markdown. Use **bold**, lists, and ``` fenced code blocks.'}
                  aria-label={`Step ${index + 1} instructions`}
                  className="font-mono text-[13px]"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="min-h-[11rem] rounded-md border bg-background p-4">
                  {step.body.trim() ? (
                    <Markdown>{step.body}</Markdown>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create guide'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}
