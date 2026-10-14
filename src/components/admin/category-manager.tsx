'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Category = { id: string; name: string; slug: string; guideCount: number }

async function request(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [renaming, setRenaming] = useState<Category | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (action: () => Promise<unknown>, success: string, done: () => void) => {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      done()
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      await request('/api/categories', 'POST', { name })
      toast.success('Category created')
      setName('')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the category')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl p-5 shadow-soft">
        <form onSubmit={onCreate} className="flex gap-3">
          <label htmlFor="new-category" className="sr-only">New category name</label>
          <Input
            id="new-category"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name, e.g. Security"
            maxLength={60}
          />
          <Button type="submit" disabled={creating || !name.trim()}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add category
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden rounded-xl shadow-soft">
        {categories.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No categories yet. Add one above, then you can write guides in it.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Guides</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.guideCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Rename ${c.name}`}
                        onClick={() => {
                          setRenaming(c)
                          setRenameValue(c.name)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${c.name}`}
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(c)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!renaming} onOpenChange={(open) => !open && setRenaming(null)}>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!renaming || !renameValue.trim()) return
              run(
                () => request(`/api/categories/${renaming.id}`, 'PUT', { name: renameValue }),
                'Category renamed',
                () => setRenaming(null)
              )
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename category</DialogTitle>
              <DialogDescription>
                Renaming also changes the category&apos;s address, so old links to its search page will stop working.
              </DialogDescription>
            </DialogHeader>
            <Input
              className="my-4"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              aria-label="Category name"
              maxLength={60}
              autoFocus
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenaming(null)} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !renameValue.trim()}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Save name
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete “{deleting?.name}”?</DialogTitle>
            <DialogDescription>
              {deleting && deleting.guideCount > 0
                ? `This category still has ${deleting.guideCount} ${deleting.guideCount === 1 ? 'guide' : 'guides'}. Move or delete them first, then try again.`
                : 'This can’t be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy || (deleting?.guideCount ?? 0) > 0}
              onClick={() =>
                deleting &&
                run(
                  () => request(`/api/categories/${deleting.id}`, 'DELETE'),
                  'Category deleted',
                  () => setDeleting(null)
                )
              }
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
