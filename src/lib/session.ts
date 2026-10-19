import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** Returns the session only if the current user is an admin. */
export async function getAdminSession() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN' ? session : null
}
