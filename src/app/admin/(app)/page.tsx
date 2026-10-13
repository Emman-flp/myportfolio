import Link from 'next/link'
import { isConfigured } from '@/lib/supabase/admin'
import { hasLiveData, getMessages } from '@/lib/data-admin'

export const metadata = { title: 'Admin — Overview' }

export default async function AdminHome() {
  const configured = isConfigured()
  const live = configured ? await hasLiveData() : false

  let messages = 0
  let unread = 0
  if (live) {
    try {
      messages = (await getMessages()).length
      unread = (await getMessages()).filter((m) => !m.is_read).length
    } catch {
      messages = 0
    }
  }

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

      {live && <Banner tone="emerald">Connected. Everything below reads and writes live data.</Banner>}

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Messages" value={messages} href="/admin/messages" />
        <Stat label="Unread" value={unread} href="/admin/messages" />
        <Stat label="Site" value="view" href="/" />
      </div>

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
            <code className="mt-1 block text-xs">insert into admins (user_id, email) values (&apos;&lt;user-id&gt;&apos;, &apos;you@example.com&apos;);</code>
          </li>
          <li>Sign in above, then edit content on the left.</li>
        </ol>
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
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>
  )
}

function Stat({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </Link>
  )
}
