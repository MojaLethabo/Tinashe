import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, verifySession } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifySession(token))) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
