import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/supabase/server'
import { isConfigured } from '@/lib/supabase/admin'
import { hasLiveData, getMessages } from '@/lib/data-admin'
import { getProfile } from '@/lib/data'
import { signOut } from '../actions'
import { AdminNav, type AdminNavItem } from '@/components/admin/AdminNav'
import { AdminIcon } from '@/components/admin/icons'

/**
 * Guarded admin shell.
 *
 * Everything inside the `(app)` route group requires a signed-in user who also
 * has a row in `admins`. `/admin/login` sits outside this group, so it is
 * reachable while signed out.
 *
 * The redirect here is a convenience. The real protection is `requireAdmin()`
 * inside every server action — middleware can be bypassed, an action cannot.
 *
 * `/admin` renders no portfolio chrome; the shell in `components/shell` bails
 * out on this path so the sidebar, nav and footer of the public site do not
 * appear around the editor.
 */

const NAV: Omit<AdminNavItem, 'badge'>[] = [
  { href: '/admin', label: 'Overview', icon: 'overview' },
  { href: '/admin/messages', label: 'Messages', icon: 'messages' },
  { href: '/admin/profile', label: 'Profile', icon: 'profile' },
  { href: '/admin/projects', label: 'Projects', icon: 'projects' },
  { href: '/admin/experience', label: 'Experience', icon: 'experience' },
  { href: '/admin/skills', label: 'Skills', icon: 'skills' },
  { href: '/admin/certifications', label: 'Certifications', icon: 'certifications' },
  { href: '/admin/affiliations', label: 'Affiliations', icon: 'affiliations' },
  { href: '/admin/posts', label: 'Posts', icon: 'posts' },
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

  const nav = NAV.map((n) => (n.href === '/admin/messages' && unread > 0 ? { ...n, badge: unread } : n))
  const { name } = await getProfile()

  return (
    <div className="min-h-screen bg-gray-50 text-ink">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
              <AdminIcon name="database" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] leading-tight font-semibold">{name || 'Admin'}</p>
              <p
                className={`flex items-center gap-1 text-[11px] leading-tight ${
                  live ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
                {live ? 'database connected' : 'placeholder content'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] font-medium text-gray-700 transition hover:bg-gray-50 hover:text-ink"
            >
              View site
              <AdminIcon name="external" className="h-3.5 w-3.5" />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium text-white transition hover:opacity-85"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-5 lg:flex-row lg:gap-8 lg:py-7">
        <AdminNav items={nav} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}