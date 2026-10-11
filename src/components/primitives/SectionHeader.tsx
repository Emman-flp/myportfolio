/** Spec §4.8. Note `items-baseline` — the link sits on the heading's baseline. */
export function SectionHeader({
  index,
  title,
  action,
  mb = 'mb-8',
}: {
  index: string
  title: string
  action?: { label: string; href: string }
  mb?: string
}) {
  return (
    <div className={`flex items-baseline justify-between ${mb}`}>
      <h2 className="font-pixel text-sm text-gray-400">
        {index} — {title}
      </h2>
      {action && (
        <a
          href={action.href}
          className="font-mono text-[11px] uppercase tracking-wider text-gray-500 hover:text-ink"
        >
          {action.label} →
        </a>
      )}
    </div>
  )
}
