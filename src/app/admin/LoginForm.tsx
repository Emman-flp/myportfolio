'use client'

import { useActionState } from 'react'
import { signIn } from './actions'

type LoginState = { ok: boolean; error?: string }

const INIT: LoginState = { ok: false }

/**
 * Admin sign-in.
 *
 * Shows an optional email field only once Supabase is actually reachable. Leave
 * it blank to use `ADMIN_PASSWORD` from `.env.local` — that gate stays available
 * even when the database is connected, so a lost Supabase account can never lock
 * the owner out of their own site.
 */
export function LoginForm({
  action,
  live = false,
}: {
  action: (s: LoginState, f: FormData) => Promise<LoginState>
  /** True when Supabase is reachable, so Supabase Auth can be used. */
  live?: boolean
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(action, INIT)

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Admin sign in</h1>

        <p className="mt-1 text-sm text-neutral-500">
          {live ? (
            <>
              Supabase Auth. The account must also exist in the <code>admins</code> table. Leave the
              email blank to use the local <code>ADMIN_PASSWORD</code> instead.
            </>
          ) : (
            <>
              No database connected, so this uses the <code>ADMIN_PASSWORD</code> from{' '}
              <code>.env.local</code>.
            </>
          )}
        </p>

        <form action={formAction} className="mt-5 space-y-3">
          {live && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-neutral-700">
                Email <span className="font-normal text-neutral-400">(optional)</span>
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-700">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>

          {state.error && (
            <p role="alert" className="text-xs text-red-700">
              {state.error}
            </p>
          )}
        </form>

        <p className="mt-5 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
          Content you save is written to <code>content/content.json</code> until Supabase has rows in
          it.
        </p>
      </div>
    </div>
  )
}