import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ChatWidget } from '@/components/chat-widget'

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
