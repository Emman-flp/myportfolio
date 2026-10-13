import 'server-only'
import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Local admin session.
 *
 * Supabase Auth is the intended gate, but it requires a working project, so the
 * admin also works with a single shared password held in `ADMIN_PASSWORD`.
 * The session is a signed, httpOnly cookie — the password itself is never stored
 * client-side or written to disk.
 *
 * Once Supabase is connected, `isAdmin()` prefers the Supabase session and this
 * becomes a fallback only.
 */

const COOKIE = 'portfolio_admin'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-only-insecure-secret'
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

export function passwordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export async function localSignIn(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  if (!timingSafeEqualStr(password, expected)) return false

  const token = sign('admin')
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
  return true
}

export async function localSignOut() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function hasLocalSession(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return false
  return timingSafeEqualStr(token, sign('admin'))
}

/** True when the local password gate is switched on. */
export function localAuthEnabled(): boolean {
  return passwordConfigured()
}
