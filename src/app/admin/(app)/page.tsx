import Link from 'next/link'
import { isConfigured } from '@/lib/supabase/admin'
import { hasLiveData, getMessages } from '@/lib/data-admin'
import { getSource, getSourceSummary } from '@/lib/data'
import { isStorePersistable, STORE_PERSISTENCE_WARNING } from '@/lib/store'
import { SeedButton } from './SeedButton'

export const metadata = { title: 'Admin — Overview' }

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const configured = isConfigured()
  const live = configured ? await hasLiveData() : false

  let messages = 0
  let unread = 0
  if (live) {
    try {
      const rows = await getMessages()
      messages = rows.length
      unread = rows.filter((m) => !m.is_read).length
    } catch {
      messages = 0
    }
  }

  const source = await getSource()
  const summary = live ? await getSourceSummary() : null

  // Reads only fall back to the local store. If the host cannot write to disk
  // — every serverless platform, Vercel included — saving there would report
  // success and then lose the edit on the next cold start.
  const storeWritable = !live ? await isStorePersistable() : true

  // The schema exists but nothing has been copied into it yet. Reads fall back
  // to content/content.json, so the site looks fine — but a new record created
  // in the admin would land in Supabase alone and appear next to nothing.
  const needsSeed =
    live &&
    summary !== null &&
    summary.supabase.profile === 0 &&
    Object.values(summary.local).some((n) => n > 0)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Overview</h1>

      {!configured && (
        <Banner tone="amber">
          Supabase is not configured. Copy <code>.env.local.example</code> to{' '}
          <code>.env.local</code> and fill in the keys. The public site keeps working on
          placeholder content until then.
        </Banner>
      )}

      {configured && !live && (
        <Banner tone="red">
          Keys are present but the database is not answering — either the keys are wrong or{' '}
          <code>supabase/migrations/0001_init.sql</code> has not been run yet. Run it in the
          Supabase SQL Editor.
        </Banner>
      )}

      {live && source === 'supabase' && (
        <Banner tone="emerald">Connected. Everything below reads and writes live data.</Banner>
      )}

      {live && source === 'local' && (
        <Banner tone="amber">
          Supabase is connected but its tables are empty, so the site is serving{' '}
          <code>content/content.json</code>. Seed it below so both agree.
        </Banner>
      )}

      {!storeWritable && (
        <Banner tone="red">
          <strong>Saving will not work on this host.</strong> {STORE_PERSISTENCE_WARNING}
        </Banner>
      )}

      {needsSeed && summary && <SeedPanel summary={summary} />}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Messages" value={messages} href="/admin/messages" />
        <Stat label="Unread" value={unread} href="/admin/messages" />
        <Stat label="Site" value="view" href="/" />
      </div>

      {!live && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">First-time setup</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              Run <code className="text-xs">supabase/migrations/0001_init.sql</code> in Supabase → SQL
              Editor.
            </li>
            <li>
              Supabase → Authentication → Users → <strong>Add user</strong> (your admin login).
            </li>
            <li>
              Insert that user into the <code className="text-xs">admins</code> table:
              <code className="mt-1 block text-xs">
                insert into admins (user_id, email) values (&apos;&lt;user-id&gt;&apos;, &apos;you@example.com&apos;);
              </code>
            </li>
            <li>Sign in above, then edit content on the left.</li>
          </ol>
        </div>
      )}

      {live && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">Signing in with Supabase</p>
          <p className="mt-1">
            The password box is still accepted, but Supabase Auth is the intended route. Create a
            user under Authentication → Users, then grant it admin:
          </p>
          <code className="mt-2 block text-xs">
            insert into admins (user_id, email) values (&apos;&lt;user-id&gt;&apos;, &apos;you@example.com&apos;);
          </code>
          <p className="mt-2 text-xs text-neutral-500">
            Only accounts in this table may reach <code>/admin</code>. RLS enforces the same rule
            on every query.
          </p>
        </div>
      )}
    </div>
  )
}

function SeedPanel({ summary }: { summary: { supabase: Record<string, number>; local: Record<string, number> } }) {
  const rows = Object.keys(summary.local)
    .map((k) => ({ key: k, local: summary.local[k] ?? 0, supabase: summary.supabase[k] ?? 0 }))
    .filter((r) => r.local > 0)

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold">Copy local content into Supabase</p>
      <p className="mt-1 text-amber-900">
        Nothing is uploaded twice — a table that already has rows is left alone. Run it once,
        then Supabase becomes the source of truth.
      </p>

      <table className="mt-3 w-full max-w-sm text-left text-xs">
        <thead>
          <tr className="text-amber-800">
            <th className="py-1 font-medium">Collection</th>
            <th className="py-1 text-right font-medium">Local</th>
            <th className="py-1 text-right font-medium">Supabase</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-amber-200">
              <td className="py-1 font-mono">{r.key}</td>
              <td className="py-1 text-right tabular-nums">{r.local}</td>
              <td className="py-1 text-right tabular-nums">{r.supabase}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3">
        <SeedButton />
      </div>
    </div>
  )
}

function Banner({ tone, children }: { tone: 'amber' | 'red' | 'emerald'; children: React.ReactNode }) {
  const tones = {
    amber: 'border-amber-300 bg-amber-50 text-amber-900',
    red: 'border-red-300 bg-red-50 text-red-900',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  }
  return <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
}

function Stat({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </Link>
  )
}