import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider, themeInitScript } from '@/components/theme-provider'
import { Toaster } from '@/components/toaster'

export const metadata: Metadata = {
  title: {
    default: 'IT Knowledge Base',
    template: '%s · IT Knowledge Base',
  },
  description: 'Searchable library of IT troubleshooting guides',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
