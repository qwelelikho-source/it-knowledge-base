import Link from 'next/link'
import { Logo } from '@/components/logo'

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-card/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Step-by-step fixes for everyday IT problems.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <Link href="/search" className="hover:text-foreground">All guides</Link>
          <Link href="/admin" className="hover:text-foreground">Admin</Link>
        </nav>
      </div>
    </footer>
  )
}
