import { SectionHeader } from '@/components/primitives/SectionHeader'
import { PLACEHOLDER_CERTS } from '@/lib/fixtures'
import type { Cert } from '@/lib/types'

/**
 * Spec §4.12.
 * The `inset-[5px]` inner border is a "card within card" detail — easy to miss, keep it.
 */
export function CertificationGrid({ certs = PLACEHOLDER_CERTS }: { certs?: Cert[] }) {
  return (
    <section id="certifications" className="py-14">
      <SectionHeader
        index="04"
        title="certifications"
        action={{ label: 'all certifications', href: '/certifications' }}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {certs.map((cert) => (
          <a
            key={cert.id}
            href={cert.verifyUrl ?? '#'}
            className="group relative flex flex-col items-center rounded-xl bg-gradient-to-b from-gray-50 to-white px-4 py-5 text-center shadow-cert transition hover:-translate-y-0.5 hover:shadow-cert-hover"
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
              <svg viewBox="0 0 12 14" className="h-3.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 7H2.5v5H7.5V9.5M7 7l4-4M7.5 1.5H11V5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gray-400 group-hover:text-ink">
                Verify
              </span>
              <span className="inline-flex -scale-x-100" aria-hidden="true">
                ↗
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
