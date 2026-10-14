import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === 'ADMIN'

    const isProtectedRoute = req.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = req.nextUrl.pathname === '/admin/login'
    const isApiRoute = req.nextUrl.pathname.startsWith('/api')

    // Allow access to login page
    if (isLoginPage) {
      return NextResponse.next()
    }

    // Protect admin routes
    if (isProtectedRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Protect mutating API routes
    if (isApiRoute && !isAdmin) {
      const method = req.method
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow unauthenticated access to login page
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/guides/:path*', '/api/categories/:path*'],
}
