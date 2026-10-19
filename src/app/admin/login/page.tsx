import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Logo } from '@/components/logo'
import { LoginForm } from '@/components/admin/login-form'
import { getAdminSession } from '@/lib/session'

export const metadata: Metadata = { title: 'Admin sign in' }
export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  // Only allow redirects back into the admin area.
  const safeCallback = callbackUrl && /^\/admin(\/|$|\?)/.test(callbackUrl) ? callbackUrl : '/admin'

  if (await getAdminSession()) redirect(safeCallback)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <LoginForm callbackUrl={safeCallback} />
      <Link href="/" className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        Back to the knowledge base
      </Link>
    </div>
  )
}
