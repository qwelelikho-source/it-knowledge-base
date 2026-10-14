import { AdminProviders } from '@/components/providers'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminProviders>{children}</AdminProviders>
}
