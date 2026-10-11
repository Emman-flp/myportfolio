import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { PLACEHOLDER_AFFILIATIONS } from '@/lib/fixtures'
import type { Affiliation } from '@/lib/types'

export const metadata = {
  title: 'Affiliations',
  description: 'Communities and organisations I am part of.',
}

/** Spec §8 — /affiliations, max-w-2xl. Gradient cards with a giant pixel watermark. */
export default function AffiliationsPage() {
  return (
    <PageShell width="2xl">
      <PageHeader
        title="affiliations"
        lead="[One sentence on these communities.]"
      />

      <div className="space-y-4">
        {PLACEHOLDER_AFFILIATIONS.map((a) => (
          <AffiliationCard key={a.id} item={a} />
        ))}
      </div>
    </PageShell>
  )
}

function AffiliationCard({ item }: { item: Affiliation }) {
  return (
    <a
      href={item.href}
      className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white p-5 transition hover:-translate-y-0.5 sm:p-6"
    >
      <span
        aria-hidden="true"
        data-placeholder
        className="pointer-events-none absolute -bottom-5 right-1 select-none font-pixel text-[64px] leading-none text-gray-100"
      >
        {item.name.slice(0, 4).toUpperCase()}
      </span>
      <div className="halftone mask-tr pointer-events-none absolute right-0 top-0 h-24 w-48 opacity-[0.14]" />

      <div className="relative flex items-start gap-4 sm:gap-5">
        {item.emoji ? (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[22px] leading-none shadow-sm">
            {item.emoji}
          </span>
        ) : (
          <img
            src={item.logo}
            alt=""
            className="h-14 w-14 shrink-0 rounded-xl border border-gray-200 bg-white object-contain p-2 shadow-sm"
          />
        )}

        <div className="min-w-0 flex-1">
          <h2
            data-placeholder={item.name.startsWith('[') ? 'true' : undefined}
            className="text-[15px] font-medium leading-snug text-ink group-hover:text-gray-500"
          >
            {item.name}
          </h2>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-gray-400">
            {item.role}
          </p>
          <p data-placeholder className="mt-2.5 text-[13px] leading-relaxed text-gray-600">
            [One sentence about what this organisation is and what you do in it.]
          </p>
        </div>
      </div>
    </a>
  )
}
