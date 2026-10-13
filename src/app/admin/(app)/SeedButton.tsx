'use client'

import { useActionState } from 'react'
import { seedSupabase } from '../actions'
import { Button, Status } from '@/components/admin/Controls'
import { AdminIcon } from '@/components/admin/icons'

type Report = { table: string; inserted: number; skipped: number; error?: string }
type SeedState = { ok: boolean; message?: string; error?: string; report?: Report[] }

const INIT: SeedState = { ok: false }

/**
 * One-click copy of `content/content.json` into Supabase.
 *
 * Only rendered when the database is reachable but its tables are still empty,
 * so there is no chance of it overwriting anything.
 */
export function SeedButton() {
  const [state, action, pending] = useActionState<SeedState, FormData>(seedSupabase, INIT)

  return (
    <div>
      <form action={action}>
        <Button type="submit" loading={pending} icon="database">
          {pending ? 'Seeding…' : 'Seed Supabase from local content'}
        </Button>
      </form>

      {state.message && (
        <p role="status" className="mt-2 text-[12px] text-emerald-700">
          {state.message}
        </p>
      )}

      {state.error && (
        <p role="alert" className="mt-2 text-[12px] text-red-700">
          {state.error}
        </p>
      )}

      {state.report && state.report.length > 0 && (
        <details className="mt-3 text-[12px]">
          <summary className="cursor-pointer text-gray-500 hover:text-ink">Per-table result</summary>
          <ul className="mt-2 space-y-1">
            {state.report.map((r) => (
              <li key={r.table} className="flex items-center gap-2 font-mono text-[11px]">
                <AdminIcon
                  name={r.error ? 'alert' : r.inserted ? 'check' : 'chevron'}
                  className={`h-3 w-3 ${r.error ? 'text-red-600' : r.inserted ? 'text-emerald-600' : 'text-gray-400'}`}
                />
                <span className="text-gray-600">{r.table}</span>
                <span className="ml-auto text-gray-400">
                  {r.error ? r.error : `+${r.inserted}${r.skipped ? ` / ${r.skipped} skipped` : ''}`}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}