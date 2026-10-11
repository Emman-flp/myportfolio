import { SectionHeader } from '@/components/primitives/SectionHeader'
import { PLACEHOLDER_AFFILIATIONS } from '@/lib/fixtures'
import type { Affiliation } from '@/lib/types'

/** Spec §4.14. Exactly one of `logo` / `emoji`. */
export function AffiliationList({
  items = PLACEHOLDER_AFFILIATIONS,
}: {
  items?: Affiliation[]
}) {
  return (
    <section id="affiliations" className="py-14">
      <SectionHeader
        index="05"
        title="affiliations"
        action={{ label: 'all affiliations', href: '/affiliations' }}
        mb="mb-7"
      />

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {items.map((item) => (
          <a key={item.id} href={item.href} className="group inline-flex items-center gap-3">
            {item.emoji ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-[18px] leading-none">
                {item.emoji}
              </span>
            ) : (
              <img
                src={item.logo}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1.5"
              />
            )}
            <div>
              <div
                data-placeholder={item.name.startsWith('[') ? 'true' : undefined}
                className="text-[13px] font-medium leading-snug text-ink group-hover:text-gray-500"
              >
                {item.name}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
                {item.role}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
