import Link from 'next/link'
import { isConfigured } from '@/lib/supabase/admin'
import { hasLiveData, getMessages } from '@/lib/data-admin'
import { getSource, getSourceSummary } from '@/lib/data'
import { isStorePersistable, STORE_PERSISTENCE_WARNING } from '@/lib/store'
import { Banner, Card } from '@/components/admin/Controls'
import { AdminIcon, type AdminIconName } from '@/components/admin/icons'
import { SeedButton } from './SeedButton'

export const metadata = { title: 'Admin — Overview' }

export const dynamic = 'force-dynamic'

const SECTIONS: { href: string; label: string; blurb: string; icon: AdminIconName }[] = [
  { href: '/admin/profile', label: 'Profile', blurb: 'Name, tagline, email and the hero paragraphs', icon: 'profile' },
  { href: '/admin/projects', label: 'Projects', blurb: 'Everything on the homepage and /projects', icon: 'projects' },
  { href: '/admin/experience', label: 'Experience', blurb: 'Roles and the organisations they belong to', icon: 'experience' },
  { href: '/admin/skills', label: 'Skills', blurb: 'Grouped on /stack, plus the flat chip row', icon: 'skills' },
  { href: '/admin/certifications', label: 'Certifications', blurb: 'The card grid on the homepage', icon: 'certifications' },
  { href: '/admin/affiliations', label: 'Affiliations', blurb: 'Communities and organisations', icon: 'affiliations' },
  { href: '/admin/posts', label: 'Posts', blurb: 'Blog entries and their bodies', icon: 'posts' },
  { href: '/admin/messages', label: 'Messages', blurb: 'Submissions from the contact form', icon: 'messages' },
]

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

  const needsSeed =
    live &&
    summary !== null &&
    summary.supabase.profile === 0 &&
    Object.values(summary.local).some((n) => n > 0)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Edit any section from the left. Changes are live as soon as you save.
        </p>
      </header>

      {!configured && (
        <Banner tone="warn" title="Supabase is not configured">
          Copy <code className="font-mono">.env.local.example</code> to{' '}
          <code className="font-mono">.env.local</code> and fill in the keys. The site keeps
          working on placeholder content until then.
        </Banner>
      )}

      {configured && !live && (
        <Banner tone="danger" title="The database is not answering">
          Either the keys are wrong or{' '}
          <code className="font-mono">supabase/migrations/0001_init.sql</code> has not been run
          yet. Run it in the Supabase SQL Editor.
        </Banner>
      )}

      {live && source === 'supabase' && (
        <Banner tone="ok" title="Connected">
          Everything below reads and writes live data.
        </Banner>
      )}

      {live && source === 'local' && (
        <Banner tone="warn" title="Supabase is empty">
          The site is serving <code className="font-mono">content/content.json</code>. Seed it
          below so both agree.
        </Banner>
      )}

      {!storeWritable && (
        <Banner tone="danger" title="Saving will not work on this host">
          {STORE_PERSISTENCE_WARNING}
        </Banner>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Messages" value={messages} href="/admin/messages" />
        <Stat label="Unread" value={unread} href="/admin/messages" accent={unread > 0} />
        <Stat label="Site" value="view" href="/" external />
        <Stat label="Backend" value={live ? 'live' : 'local'} />
      </div>

      {needsSeed && summary && <SeedPanel summary={summary} />}

      <Card title="Content" count={SECTIONS.length}>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex items-start gap-2.5 rounded-lg p-2.5 transition hover:bg-gray-50"
              >
                <AdminIcon
                  name={s.icon}
                  className="mt-0.5 h-4 w-4 text-gray-400 transition group-hover:text-ink"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[13px] font-medium text-ink">
                    {s.label}
                    <AdminIcon
                      name="chevron"
                      className="h-3 w-3 -translate-x-1 text-gray-300 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-gray-500">{s.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {!live ? (
        <Card title="First-time setup">
          <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-gray-600">
            <li>
              Run <code className="font-mono text-[12px]">supabase/migrations/0001_init.sql</code>{' '}
              in Supabase → SQL Editor.
            </li>
            <li>
              Supabase → Authentication → Users → <strong>Add user</strong>.
            </li>
            <li>
              Grant it admin:
              <code className="mt-1.5 block rounded-md bg-gray-50 p-2 font-mono text-[11px]">
                insert into admins (user_id, email) values (&apos;&lt;user-id&gt;&apos;, &apos;you@example.com&apos;);
              </code>
            </li>
            <li>Sign in, then edit content from the left.</li>
          </ol>
        </Card>
      ) : (
        <Card title="Signing in with Supabase">
          <p className="text-[13px] leading-relaxed text-gray-600">
            Supabase Auth is the intended route, though the <code className="font-mono text-[12px]">ADMIN_PASSWORD</code>{' '}
            fallback still works — leave the email blank on the login screen. Create a user under
            Authentication → Users, then grant it:
          </p>
          <code className="mt-2 block rounded-md bg-gray-50 p-2 font-mono text-[11px]">
            insert into admins (user_id, email) values (&apos;&lt;user-id&gt;&apos;, &apos;you@example.com&apos;);
          </code>
          <p className="mt-2 text-[12px] text-gray-500">
            Only accounts in this table can reach <code className="font-mono">/admin</code>. RLS
            enforces the same rule on every query, and every server action re-checks.
          </p>
        </Card>
      )}
    </div>
  )
}

function SeedPanel({
  summary,
}: {
  summary: { supabase: Record<string, number>; local: Record<string, number> }
}) {
  const rows = Object.keys(summary.local)
    .map((k) => ({ key: k, local: summary.local[k] ?? 0, supabase: summary.supabase[k] ?? 0 }))
    .filter((r) => r.local > 0)

  return (
    <Card title="Seed Supabase from local content" description="Tables that already have rows are left alone, so this is safe to run twice.">
      <div className="mb-3 overflow-x-auto">
        <table className="w-full max-w-sm text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wider text-gray-500">
              <th className="py-1.5 font-semibold">Collection</th>
              <th className="py-1.5 text-right font-semibold">Local</th>
              <th className="py-1.5 text-right font-semibold">Supabase</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-gray-100 last:border-0">
                <td className="py-1.5 font-mono text-[12px]">{r.key}</td>
                <td className="py-1.5 text-right tabular-nums">{r.local}</td>
                <td className="py-1.5 text-right tabular-nums">{r.supabase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SeedButton />
    </Card>
  )
}

/** A tile. Plain, static, and a link unless it is reporting a value only. */
function Stat({
  label,
  value,
  href,
  accent,
  external,
}: {
  label: string
  value: string | number
  href?: string
  accent?: boolean
  external?: boolean
}) {
  const body = (
    <>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
        {external && <AdminIcon name="external" className="h-3 w-3" />}
      </div>
      <div
        className={`mt-1 text-2xl leading-none font-semibold tabular-nums ${accent ? 'text-red-600' : 'text-ink'}`}
      >
        {value}
      </div>
    </>
  )

  const cls = `block rounded-xl border bg-white p-3.5 transition ${
    accent ? 'border-red-200' : 'border-gray-200'
  }`

  return href ? (
    <Link href={href} className={`${cls} hover:border-gray-400`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}