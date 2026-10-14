import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'
import { getAdminSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Second line of defence behind proxy.ts.
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen">
      <AdminHeader email={session.user.email} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
