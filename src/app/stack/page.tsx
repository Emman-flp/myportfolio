import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { PLACEHOLDER_STACK_GROUPS } from '@/lib/fixtures'

export const metadata = {
  title: 'Stack',
  description: 'The tools, languages and platforms I work with.',
}

/** Spec §8 — /stack, max-w-3xl. Grouped sections of `.tag` pills. */
export default function StackPage() {
  return (
    <PageShell width="3xl">
      <PageHeader
        title="tech stack"
        lead="[One sentence on how you choose tools.]"
      />

      <div className="space-y-10">
        {PLACEHOLDER_STACK_GROUPS.map((group) => (
          <section key={group.id} className="reveal">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-gray-400">
              {group.title}
            </h2>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="tag rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  )
}
