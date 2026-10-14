import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteShell } from '@/components/site-shell'

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
          <FileQuestion className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">We can&apos;t find that page</h1>
        <p className="mt-2 text-muted-foreground">
          The guide may have been moved, unpublished or deleted. Try searching instead.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/search">Search guides</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  )
}
