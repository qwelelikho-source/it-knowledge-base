'use client'

import * as React from 'react'

export type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const MEDIA = '(prefers-color-scheme: dark)'

function subscribeToSystem(onChange: () => void) {
  const media = window.matchMedia(MEDIA)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode
  initialTheme: Theme
}) {
  const [theme, setThemeState] = React.useState<Theme>(initialTheme)

  const systemDark = React.useSyncExternalStore(
    subscribeToSystem,
    () => window.matchMedia(MEDIA).matches,
    () => false
  )

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next)
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (next !== 'system') root.classList.add(next)
    document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`
  }, [])

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemDark ? 'dark' : 'light') : theme

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
