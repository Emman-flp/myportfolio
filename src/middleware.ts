import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Gates /admin.
 *
 * ⚠️ This is a UX redirect, NOT the security boundary. Middleware runs on the
 * edge runtime where `process.env` only exposes NEXT_PUBLIC_* vars, so it cannot
 * verify the local session's HMAC and must not try. It therefore only checks
 * that *a* cookie is present.
 *
 * The real protection is twofold and both run on Node:
 *   1. `isAdmin()` in `admin/(app)/layout.tsx` — verifies the cookie properly
 *      and redirects before any admin markup renders
 *   2. `requireAdmin()` in every server action — refuses every write
 *
 * A forged cookie gets past middleware and is then stopped by the layout, and
 * would be stopped again by every action.
 */

const COOKIE = 'portfolio_admin'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLogin = pathname === '/admin/login'
  const isProtected = pathname.startsWith('/admin') && !isLogin

  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const urlLooksValid = typeof url === 'string' && /^https?:\/\//.test(url)

  let hasSupabaseSession = false

  if (urlLooksValid && key) {
    try {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            )
          },
        },
      })

      // Do not run code between createServerClient and getUser — it can deadlock.
      const result = await supabase.auth.getUser()
      hasSupabaseSession = Boolean(result.data.user)
    } catch {
      // Misconfigured or unreachable Supabase must never lock the admin out.
      hasSupabaseSession = false
    }
  }

  const looksSignedIn = hasSupabaseSession || Boolean(request.cookies.get(COOKIE)?.value)

  if (isProtected && !looksSignedIn) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/admin/login'
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  if (isLogin && hasSupabaseSession) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/admin'
    redirect.search = ''
    return NextResponse.redirect(redirect)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
