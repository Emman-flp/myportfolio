import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/server'
import { isConfigured } from '@/lib/supabase/admin'
import { hasLiveData, getMessages } from '@/lib/data-admin'
import { signOut } from '../actions'

/**
 * Guarded admin shell.
 *
 * Everything inside the `(app)` route group requires a signed-in user who also
 * has a row in `admins`. `/admin/login` sits outside this group, so it is
 * reachable while signed out.
 *
 * The redirect here is a convenience. The real protection is `requireAdmin()`
 * inside every server action — middleware can be bypassed, an action cannot.
 */

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/messages', label: 'Messages' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/certifications', label: 'Certifications' },
  { href: '/admin/affiliations', label: 'Affiliations' },
  { href: '/admin/posts', label: 'Posts' },
]

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect('/admin/login')

  const live = isConfigured() ? await hasLiveData() : false

  let unread = 0
  if (live) {
    try {
      unread = (await getMessages()).filter((m) => !m.is_read).length
    } catch {
      unread = 0
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold">Admin</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                live ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {live ? 'database connected' : 'placeholders only'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              View site
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-5 py-6">
        <nav className="w-44 shrink-0">
          <ul className="sticky top-4 space-y-0.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2.5 py-1.5 text-sm text-neutral-700 hover:bg-white"
                >
                  {item.label}
                  {item.href === '/admin/messages' && unread > 0 && (
                    <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
