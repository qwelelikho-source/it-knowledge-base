import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-md font-semibold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
        <BookOpen className="h-4 w-4" aria-hidden />
      </span>
      <span>IT Knowledge Base</span>
    </Link>
  )
}
