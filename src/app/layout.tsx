import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider, type Theme } from '@/components/theme-provider'
import { Toaster } from '@/components/toaster'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: {
    default: 'IT Knowledge Base',
    template: '%s · IT Knowledge Base',
  },
  description: 'Searchable library of IT troubleshooting guides',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stored = (await cookies()).get('theme')?.value
  const theme: Theme = stored === 'light' || stored === 'dark' ? stored : 'system'

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable, theme !== 'system' && theme)}
    >
      <body>
        <ThemeProvider initialTheme={theme}>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
