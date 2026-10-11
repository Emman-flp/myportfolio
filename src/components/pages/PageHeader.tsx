/**
 * Inner-page header. Spec §8.
 * `h1` is lowercase Geist Pixel; the lead paragraph is 15px relaxed, g600, capped at max-w-xl.
 */
export function PageHeader({
  title,
  lead,
  headerClass = 'mb-12',
  leadClass = 'mb-12',
  action,
}: {
  title: string
  lead?: string
  headerClass?: string
  leadClass?: string
  action?: React.ReactNode
}) {
  return (
    <header className={`flex flex-wrap items-start justify-between gap-6 ${headerClass}`}>
      <div>
        <h1 className="reveal font-pixel text-2xl leading-none">{title}</h1>
        {lead && (
          <p
            data-placeholder={lead.startsWith('[') ? 'true' : undefined}
            className={`reveal mt-5 max-w-xl text-[15px] leading-relaxed text-gray-600 ${leadClass}`}
          >
            {lead}
          </p>
        )}
      </div>
      {action}
    </header>
  )
}
