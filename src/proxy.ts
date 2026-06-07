import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const session = request.cookies.get('gym_session')
  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/login', '/registro']

  if (!session && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && (pathname === '/login' || pathname === '/registro')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|icon|apple-icon|screenshots|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2?|ttf|otf)).*)',
  ],
}
