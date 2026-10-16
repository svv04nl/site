import { NextResponse, type NextRequest } from 'next/server'
import {
  ACCESS_COOKIE,
  ACCESS_PATH,
  accessToken,
  getAccessCode,
  isExemptPath,
  safeEqual,
} from '@/lib/access-gate'

// Zet de hele website achter de toegangscode uit SITE_ACCESS_CODE (zie lib/access-gate.ts).
export async function proxy(request: NextRequest) {
  const code = getAccessCode()
  if (!code) return NextResponse.next()

  const { pathname, search } = request.nextUrl
  if (isExemptPath(pathname)) return NextResponse.next()

  const cookie = request.cookies.get(ACCESS_COOKIE)?.value
  if (cookie && safeEqual(cookie, await accessToken(code))) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = ACCESS_PATH
  url.search = ''
  if (pathname !== '/') url.searchParams.set('next', `${pathname}${search}`)

  const response = NextResponse.redirect(url)
  // Zoekmachines en tussenliggende caches mogen de poort niet onthouden.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Cache-Control', 'no-store')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
