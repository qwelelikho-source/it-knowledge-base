import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Next.js 16 renamed `middleware` to `proxy`.
// This only gates the admin *pages*. Every mutating API route also checks the
// session itself, so the API stays protected even if this file is bypassed.
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const token = await getToken({ req })
  if (token?.role === 'ADMIN') return NextResponse.next()

  const loginUrl = new URL('/admin/login', req.url)
  loginUrl.searchParams.set('callbackUrl', pathname + search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*'],
}
