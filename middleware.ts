import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Check if request is directed to the admin subdomain
  // e.g. admin.kidsengregy.com, admin.kidengregy.com, or admin.localhost:3000
  const isAdminSubdomain =
    host.startsWith('admin.') ||
    host.includes('admin.kidsengregy.com') ||
    host.includes('admin.kidengregy.com')

  if (isAdminSubdomain) {
    // If accessing root on admin subdomain, rewrite to /admin
    if (pathname === '/') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }

    // If accessing subpaths like /orders, /shipments on admin subdomain, rewrite to /admin/orders, etc.
    if (
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/_next') &&
      !pathname.startsWith('/api') &&
      !pathname.includes('.')
    ) {
      url.pathname = `/admin${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // Gracefully redirect legacy /admin-demo URLs to /admin
  if (pathname.startsWith('/admin-demo')) {
    const newPath = pathname.replace('/admin-demo', '/admin')
    url.pathname = newPath || '/admin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, icons
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
