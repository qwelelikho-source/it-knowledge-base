'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, Monitor, Moon, Search, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme, type Theme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'All guides' },
]

const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [shortcut, setShortcut] = useState('Ctrl K')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (/mac|iphone|ipad/i.test(navigator.platform)) setShortcut('⌘K')
  }, [])

  // Cmd/Ctrl+K focuses the page's search box, or opens the search page.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = document.getElementById('kb-search') as HTMLInputElement | null
        if (input) {
          input.focus()
          input.select()
        } else {
          router.push('/search')
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [router])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:text-foreground',
                isActive(item.href) ? 'bg-secondary text-foreground' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 w-56 justify-start gap-2 font-normal text-muted-foreground shadow-soft lg:flex"
            asChild
          >
            <Link href="/search">
              <Search className="h-4 w-4" />
              <span>Search guides</span>
              <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px]">
                {shortcut}
              </kbd>
            </Link>
          </Button>

          <div className="hidden md:flex md:items-center md:gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">Site navigation and theme</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6 flex flex-col gap-1">
                {[...NAV, { href: '/admin', label: 'Admin' }].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-secondary',
                      isActive(item.href) ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 border-t pt-4">
                <p className="mb-2 px-3 text-sm font-medium text-muted-foreground">Theme</p>
                <div className="flex gap-2 px-1">
                  {THEMES.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={theme === value ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setTheme(value)}
                      className="flex-1 gap-1.5"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
