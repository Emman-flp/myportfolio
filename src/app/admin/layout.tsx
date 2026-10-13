import type { Metadata } from 'next'

/**
 * Minimal root for /admin.
 *
 * The auth guard deliberately lives in `admin/(app)/layout.tsx`, NOT here.
 * Putting it here would also guard `/admin/login`, which sends signed-out users
 * into a redirect loop back to the sign-in page.
 */
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s' },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
