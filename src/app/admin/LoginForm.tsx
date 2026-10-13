'use client'

import { useActionState } from 'react'
import { signIn } from './actions'
import { AdminIcon } from '@/components/admin/icons'

type LoginState = { ok: boolean; error?: string }

const INIT: LoginState = { ok: false }

/**
 * Admin sign-in.
 *
 * Shows an optional email field only once Supabase is reachable. Leave it blank
 * to use `ADMIN_PASSWORD` — that gate stays available even when the database is
 * connected, so a lost Supabase account can never lock the owner out.
 */
export function LoginForm({
  action,
  live = false,
}: {
  action: (s: LoginState, f: FormData) => Promise<LoginState>
  live?: boolean
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(action, INIT)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
            <AdminIcon name="database" className="h-5 w-5" />
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Admin sign in</h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="mb-4 text-[13px] leading-relaxed text-gray-500">
            {live ? (
              <>
                Sign in with Supabase. The account must also exist in the{' '}
                <code className="font-mono text-[12px]">admins</code> table — or leave the email
                blank to use the local <code className="font-mono text-[12px]">ADMIN_PASSWORD</code>.
              </>
            ) : (
              <>
                No database connected, so this uses the{' '}
                <code className="font-mono text-[12px]">ADMIN_PASSWORD</code> from{' '}
                <code className="font-mono text-[12px]">.env.local</code>.
              </>
            )}
          </p>

          <form action={formAction} className="space-y-3">
            {live && (
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Email <span className="font-normal normal-case tracking-normal text-gray-400">(optional)</span>
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/15"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/15"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:opacity-85 disabled:opacity-50"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>

            {state.error && (
              <p role="alert" className="flex items-start gap-1.5 text-[12px] text-red-700">
                <AdminIcon name="alert" className="mt-px h-3.5 w-3.5" />
                {state.error}
              </p>
            )}
          </form>
        </div>

        <p className="mt-4 text-center text-[12px] text-gray-500">
          <a href="/" className="underline underline-offset-2 hover:text-ink">
            ← back to the site
          </a>
        </p>
      </div>
    </div>
  )
}