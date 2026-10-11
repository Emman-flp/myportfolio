import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { ContactForm } from '@/components/pages/ContactForm'
import { PROFILE } from '@/lib/fixtures'

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
