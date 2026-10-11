import { PROFILE } from '@/lib/fixtures'

/** Spec §4.16. */
export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <p className="font-mono text-[11px] text-gray-400">
          © {new Date().getFullYear()} {PROFILE.name}
        </p>
        <a href="/" className="font-mono text-[11px] text-gray-400 hover:text-ink">
          ← back to site
        </a>
      </div>
    </footer>
  )
}
