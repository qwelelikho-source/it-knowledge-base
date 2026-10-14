'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { ExternalLink, LogOut, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Guides', match: (p: string) => p === '/admin' || p.startsWith('/admin/guides') },
  { href: '/admin/categories', label: 'Categories', match: (p: string) => p.startsWith('/admin/categories') },
]

export function AdminHeader({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <div className="flex items-center gap-2">
          <Logo href="/admin" />
          <Badge variant="secondary" className="hidden sm:inline-flex">Admin</Badge>
        </div>

        <nav aria-label="Admin" className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground',
                  active ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild className="hidden gap-1.5 sm:inline-flex">
            <Link href="/" target="_blank">
              View site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account menu">
                <UserRound className="h-[18px] w-[18px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/' })} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
