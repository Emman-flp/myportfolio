import { SectionHeader } from '@/components/primitives/SectionHeader'

const COLS = 53
const ROWS = 7

/**
 * Spec §4.15.
 * Never render a fake grid: if the real contribution data is unavailable the
 * section shows the header row only.
 */
export function GithubGraph({
  username,
  cells,
  total,
}: {
  username: string
  cells?: number[]
  total?: number
}) {
  const hasData = Array.isArray(cells) && cells.length >= COLS * ROWS

  return (
    <section id="github" className="py-14">
      <SectionHeader
        index="06"
        title="github"
        action={{ label: `@${username}`, href: `https://github.com/${username}` }}
        mb="mb-6"
      />

      {hasData ? (
        <a href={`https://github.com/${username}`} className="group block">
          <svg
            viewBox={`0 0 ${COLS * 12} ${ROWS * 12}`}
            className="h-auto w-full"
            role="img"
            aria-label={`${total ?? 0} contributions in the last year`}
          >
            {cells!.slice(0, COLS * ROWS).map((level, i) => (
              <circle
                key={i}
                cx={(i % COLS) * 12 + 6}
                cy={Math.floor(i / COLS) * 12 + 6}
                r={level >= 4 ? 5 : level >= 3 ? 4 : level >= 2 ? 3.5 : level >= 1 ? 2.5 : 2}
                className={level >= 4 ? 'fill-ink' : level >= 2 ? 'fill-gray-600' : 'fill-gray-300'}
              />
            ))}
          </svg>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-gray-400">
            {total?.toLocaleString()} contributions in the last year
          </p>
        </a>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400" data-placeholder>
          [github graph — set GITHUB_USERNAME to enable]
        </p>
      )}
    </section>
  )
}
