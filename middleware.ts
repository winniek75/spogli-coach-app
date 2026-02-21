import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false
})

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and API routes
  if (
    pathname.includes('.') || // files with extensions
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return
  }

  // Apply internationalization middleware first
  const intlResponse = intlMiddleware(request)

  // If intl middleware redirects, return that response
  if (intlResponse && intlResponse.status === 307) {
    return intlResponse
  }

  // Then update Supabase session
  const supabaseResponse = await updateSession(request)

  // If Supabase redirects (e.g., for auth), return that response
  if (supabaseResponse && supabaseResponse.status === 307) {
    return supabaseResponse
  }

  // Otherwise return the intl response or continue with the request
  return intlResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}