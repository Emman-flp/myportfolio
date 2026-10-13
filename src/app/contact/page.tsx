import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { ContactForm } from '@/components/pages/ContactForm'
import { PROFILE } from '@/lib/fixtures'
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
  title: 'Contact',
  description: 'Get in touch.',
}

/** Spec §8 — contact form, modelled on the reference's /collabs form. */
export default function ContactPage() {
  return (
    <PageShell width="3xl">
      <PageHeader
        title="contact"
        lead="[One sentence on what you are open to hearing about.]"
        headerClass="mb-8"
        leadClass="mb-0"
      />

      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[13px]">
        <a href={`mailto:${PROFILE.email}`} className="text-ink hover:text-gray-500">
          {PROFILE.email}
        </a>
        <span className="text-gray-400">[Location]</span>
      </div>

      <ContactForm />
    </PageShell>
  )
}
