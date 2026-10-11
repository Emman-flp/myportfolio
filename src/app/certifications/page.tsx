import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { CertificationGrid } from '@/components/home/CertificationGrid'
import { PLACEHOLDER_CERTS } from '@/lib/fixtures'

export const metadata = {
  title: 'Certifications',
  description: 'Credentials earned.',
}

/** Spec §8 — /certifications, max-w-4xl. */
export default function CertificationsPage() {
  return (
    <PageShell width="4xl">
      <PageHeader
        title="certifications"
        lead="[One sentence on what these cover.]"
        headerClass="mb-12"
        leadClass="mb-10"
      />

      <div className="space-y-12">
        <section className="reveal">
          <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.22em] text-gray-400">
            Data &amp; Analytics
          </h2>
          <div className="grid grid-cols-2 gap-0 sm:grid-cols-3 lg:grid-cols-4">
            {PLACEHOLDER_CERTS.map((c) => (
              <CertificationCard key={c.id} cert={c} />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

/**
 * Card markup matches the homepage's §4.12 spec, including the inset-[5px]
 * inner border. Extracted here rather than reusing CertificationGrid because
 * this page uses a 4-up grid with no gap (negative-margin hover, like the reference).
 */
function CertificationCard({ cert }: { cert: (typeof PLACEHOLDER_CERTS)[number] }) {
  return (
    <a
      href={cert.verifyUrl ?? '#'}
      className="cert-card group relative -m-1.5 flex flex-col items-center rounded-xl bg-gradient-to-b from-gray-50 to-white p-4 py-5 text-center shadow-cert transition hover:-translate-y-0.5 hover:shadow-cert-hover"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[5px] rounded-lg border border-gray-200/70"
      />
      <div className="relative flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3l2.4 5.1 5.6.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.6-.8L12 3z" strokeLinejoin="round" />
        </svg>
      </div>
      <h3
        data-placeholder={cert.name.startsWith('[') ? 'true' : undefined}
        className="relative mt-3 text-[13px] font-semibold leading-snug text-ink"
      >
        {cert.name}
      </h3>
      <p className="relative mt-1 font-mono text-[9.5px] uppercase tracking-wider text-gray-400">
        {cert.issuer}
      </p>
      <div className="relative mt-3 flex items-center gap-1.5 text-gray-300 group-hover:text-ink">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-400 group-hover:text-ink">
          Verify
        </span>
        <span className="inline-flex -scale-x-100" aria-hidden="true">↗</span>
      </div>
    </a>
  )
}
