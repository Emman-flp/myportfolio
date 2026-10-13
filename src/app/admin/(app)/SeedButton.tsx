'use client'

import { useActionState } from 'react'
import { seedSupabase } from '../actions'

type Report = { table: string; inserted: number; skipped: number; error?: string }
type SeedState = {
  ok: boolean
  message?: string
  error?: string
  report?: Report[]
}

const INIT: SeedState = { ok: false }

/**
 * One-click copy of `content/content.json` into Supabase.
 *
 * Only shown when the database is reachable but its tables are still empty, so
 * there is no chance of it overwriting anything.
 */
export function SeedButton() {
  const [state, action, pending] = useActionState<SeedState, FormData>(seedSupabase, INIT)

  return (
    <div>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-amber-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-800 disabled:opacity-50"
        >
          {pending ? 'Seeding…' : 'Seed Supabase from local content'}
        </button>
      </form>

      {state.message && (
        <p role="status" className="mt-2 text-xs text-amber-900">
          {state.message}
        </p>
      )}

      {state.error && (
        <p role="alert" className="mt-2 text-xs text-red-800">
          {state.error}
        </p>
      )}

      {state.report && state.report.length > 0 && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-amber-800">Per-table result</summary>
          <ul className="mt-1 space-y-0.5">
            {state.report.map((r) => (
              <li key={r.table} className="font-mono">
                {r.table}:{' '}
                {r.error ? (
                  <span className="text-red-800">{r.error}</span>
                ) : (
                  <span>
                    +{r.inserted} inserted{r.skipped ? `, ${r.skipped} skipped` : ''}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}