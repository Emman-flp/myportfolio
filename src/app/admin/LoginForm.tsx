'use client'

import { useActionState } from 'react'
import { signIn, type ActionState } from './actions'

export function LoginForm({ action }: { action: (s: ActionState, f: FormData) => Promise<ActionState> }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, { ok: false })

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Supabase Auth. The account must also exist in the <code>admins</code> table.
        </p>

        <form action={formAction} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-700">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </label>

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
          No account yet? Supabase dashboard → Authentication → Users → Add user. Then insert a row
          into <code>admins</code> with that user&apos;s id.
        </p>
      </div>
    </div>
  )
}
