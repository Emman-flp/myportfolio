import { SectionHeader } from '@/components/primitives/SectionHeader'
import { PLACEHOLDER_EXPERIENCE, PLACEHOLDER_STACK } from '@/lib/fixtures'
import type { ExperienceEntry } from '@/lib/types'

/**
 * Spec §4.11.
 * Below `sm` the organisation wraps to its own full-width row (col-span-12) —
 * that is the reference's mobile behaviour, keep it.
 */
export function ExperienceList({
  entries = PLACEHOLDER_EXPERIENCE,
  stack = PLACEHOLDER_STACK,
}: {
  entries?: ExperienceEntry[]
  stack?: string[]
}) {
  return (
    <section id="experience" className="py-14">
      <SectionHeader
        index="03"
        title="experience"
        action={{ label: 'full history', href: '/experience' }}
        mb="mb-6"
      />

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {entries.map((e) => (
          <div
            key={e.id}
            className="group grid grid-cols-12 items-baseline gap-3 py-2.5 hover:bg-gray-50/80"
          >
            <div className="col-span-2 font-mono text-[11px] text-gray-400" data-placeholder={e.period.startsWith('[') ? 'true' : undefined}>
              {e.period}
            </div>
            <div className="col-span-10 text-[14px] font-medium text-ink sm:col-span-6" data-placeholder={e.role.startsWith('[') ? 'true' : undefined}>
              {e.role}
            </div>
            <div className="col-span-12 text-[13px] text-gray-500 sm:col-span-4 sm:text-right" data-placeholder={e.org.startsWith('[') ? 'true' : undefined}>
              {e.org}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7" data-guide="stack">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-gray-400">Stack</h3>
          <a
            href="/stack"
            className="font-mono text-[11px] uppercase tracking-wider text-gray-500 hover:text-ink"
          >
            view all →
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          {stack.map((s) => (
            <span
              key={s}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-mono text-[12px] text-gray-600"
            >
              {s}
            </span>
          ))}
          <a
            href="/stack"
            className="rounded-md border border-dashed border-gray-300 px-2.5 py-1 font-mono text-[12px] text-gray-500 hover:border-gray-500 hover:text-ink"
          >
            + more
          </a>
        </div>
      </div>
    </section>
  )
}
