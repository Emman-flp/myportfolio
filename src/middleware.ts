import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Keeps the Supabase session cookie fresh and gates /admin.
 *
 * Auth is enforced in two places on purpose:
 *   1. here, as a cheap redirect so signed-out users never render admin markup;
 *   2. in every server action via `requireAdmin()`, which is the check that
 *      actually protects data — middleware can be bypassed, an action cannot.
 */

const PROTECTED = ['/admin']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return response

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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isLogin = pathname === '/admin/login'

  if (isProtected && !isLogin && !user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/admin/login'
    redirect.searchParams.set('next', pathname)
    return NextResponse.redirect(redirect)
  }

  if (isLogin && user) {
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
