import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { getExperienceOrgs } from '@/lib/data'
import type { ExperienceOrg } from '@/lib/types'
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
  title: 'Experience',
  description: 'Education, roles and what I worked on.',
}

/** Spec §8 — /experience, max-w-2xl. Vertical timeline with monogram + connector. */
export default async function ExperiencePage() {
  const orgs = await getExperienceOrgs()

  return (
    <PageShell width="2xl">
      <PageHeader
        title="experience"
        lead="[One or two sentences summarising where you have studied and what you have done.]"
      />

      <div className="space-y-0">
        {orgs.map((org) => (
          <TimelineOrg key={org.id} org={org} />
        ))}
      </div>
    </PageShell>
  )
}

function TimelineOrg({ org }: { org: ExperienceOrg }) {
  const isPlaceholder = org.name.startsWith('[')

  return (
    <div className="reveal relative flex gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <div
          data-placeholder={isPlaceholder ? 'true' : undefined}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 font-mono text-[13px] font-medium text-gray-600"
        >
          {org.monogram}
        </div>
        <div className="mt-2 w-px flex-1 bg-gray-200" />
      </div>

      <div className="flex-1 pb-12">
        <h2
          data-placeholder={isPlaceholder ? 'true' : undefined}
          className="text-[16px] font-semibold leading-snug text-ink"
        >
          {org.name}
        </h2>
        <p data-placeholder className="mt-1 font-mono text-[12px] text-gray-500">
          {org.employment}
        </p>
        {org.meta && (
          <p data-placeholder className="mt-0.5 font-mono text-[11px] text-gray-400">
            {org.meta}
          </p>
        )}
        {org.location && (
          <p data-placeholder className="mt-0.5 font-mono text-[11px] text-gray-400">
            {org.location}
          </p>
        )}

        <div className="relative mt-5 space-y-7 border-l border-gray-200 pl-6">
          {org.roles.map((role) => (
            <div key={role.id}>
              <p className="font-mono text-[11px] text-gray-400" data-placeholder={role.period.startsWith('[') ? 'true' : undefined}>
                {role.period}
              </p>
              <h3
                data-placeholder={role.title.startsWith('[') ? 'true' : undefined}
                className="mt-0.5 text-[14px] font-medium text-ink"
              >
                {role.title}
              </h3>
              {role.summary && (
                <p
                  data-placeholder={role.summary.startsWith('[') ? 'true' : undefined}
                  className="mt-1.5 text-[13.5px] leading-relaxed text-gray-600"
                >
                  {role.summary}
                </p>
              )}
              {role.bullets && role.bullets.length > 0 && (
                <ul className="mt-2.5 space-y-1.5">
                  {role.bullets.map((b) => (
                    <li
                      key={b}
                      data-placeholder={b.startsWith('[') ? 'true' : undefined}
                      className="flex gap-2 text-[13px] leading-relaxed text-gray-600"
                    >
                      <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gray-300" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
