'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  defaultValue?: string
  /** Keeps the current category filter when searching again. */
  category?: string
  size?: 'lg' | 'md'
  autoFocus?: boolean
  placeholder?: string
}

export function SearchBox({
  defaultValue = '',
  category,
  size = 'md',
  autoFocus,
  placeholder = 'Search guides',
}: Props) {
  const [value, setValue] = useState(defaultValue)
  const [shortcut, setShortcut] = useState('Ctrl K')

  // Resolved lazily so the server and first client render agree.
  const onFocus = () => {
    if (/mac|iphone|ipad/i.test(navigator.platform)) setShortcut('⌘K')
  }

  const lg = size === 'lg'

  return (
    <form action="/search" method="GET" role="search" className="w-full">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <div
        className={cn(
          'group flex items-center gap-2 rounded-xl border bg-card shadow-soft transition-shadow focus-within:border-ring focus-within:shadow-lift focus-within:ring-1 focus-within:ring-ring',
          lg ? 'p-2 pl-4' : 'p-1.5 pl-3'
        )}
      >
        <Search className={cn('shrink-0 text-muted-foreground', lg ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden />
        <input
          id="kb-search"
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={onFocus}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder={placeholder}
          aria-label="Search guides"
          className={cn(
            'min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden',
            lg ? 'h-11 text-base sm:text-lg' : 'h-9 text-sm'
          )}
        />
        <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
          {shortcut}
        </kbd>
        <Button type="submit" size={lg ? 'lg' : 'default'} className={lg ? 'h-11' : undefined}>
          Search
        </Button>
      </div>
    </form>
  )
}
