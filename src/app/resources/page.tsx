import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { getResourceGroups } from '@/lib/data'
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
  title: 'Resources',
  description: 'Tools and references I keep coming back to.',
}

/** Spec §8 — /resources, max-w-4xl. Grouped 2-column link lists. */
export default async function ResourcesPage() {
  const groups = await getResourceGroups()

  return (
    <PageShell width="4xl">
      <PageHeader
        title="resources"
        lead="[One sentence on how you pick these.]"
        headerClass="mb-12"
        leadClass="mb-0"
      />

      <div className="mt-12">
        {groups.map((group) => (
          <section key={group.id} className="reveal mb-11">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-gray-400">
              {group.title}
            </h2>
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {group.links.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className="group -mx-3 flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-gray-50"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300 transition group-hover:bg-ink"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      data-placeholder={link.title.startsWith('[') ? 'true' : undefined}
                      className="block text-[14px] font-medium text-ink group-hover:text-gray-500"
                    >
                      {link.title}
                    </span>
                    {link.description && (
                      <span
                        data-placeholder={link.description.startsWith('[') ? 'true' : undefined}
                        className="mt-0.5 block text-[13px] leading-relaxed text-gray-500"
                      >
                        {link.description}
                      </span>
                    )}
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  )
}
