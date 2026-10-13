import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { getStackGroups } from '@/lib/data'
/**
 * Rendered per request rather than baked at build time.
 *
 * Deviation from the reference, which is a static site with no admin. We have a
 * CMS behind these pages, so a build-time snapshot would be wrong twice over:
 * Vercel does not read `.env.local` at build, so a static build would bake the
 * placeholder fixtures into the deployed HTML and serve them forever, and any
 * edit made in /admin would need a redeploy to appear.
 *
 * Marking these dynamic means an admin write is live on the next request.
 */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Stack',
  description: 'The tools, languages and platforms I work with.',
}

/** Spec §8 — /stack, max-w-3xl. Grouped sections of `.tag` pills. */
export default async function StackPage() {
  const groups = await getStackGroups()

  return (
    <PageShell width="3xl">
      <PageHeader
        title="tech stack"
        lead="[One sentence on how you choose tools.]"
      />

      <div className="space-y-10">
        {groups.map((group) => (
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
