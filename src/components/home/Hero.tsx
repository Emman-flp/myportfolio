import { GazePortrait } from './GazePortrait'
import { PROFILE } from '@/lib/fixtures'
import type { Profile } from '@/lib/types'

/** Spec §4.4. */
export function Hero({ profile = PROFILE }: { profile?: Profile }) {
  const { name, paragraphs, socials } = profile

  return (
    <section className="relative pt-20 pb-16 sm:pt-28">
      <div className="grid gap-9 sm:grid-cols-[18rem_1fr] sm:items-start sm:gap-10">
        <div className="reveal d1 mx-auto w-full max-w-[18rem] sm:mx-0" data-guide="portrait">
          {/* faceY measured off this crop with scripts/preview-portrait.mjs:
              the eye line sits at 46% of the frame. The reference's own value
              is 0.45, measured against its headshot. */}
          <GazePortrait alt={name} src="/portrait.webp" faceY={0.46} />
        </div>

        <div>
          <h1 className="reveal d2 font-pixel text-3xl leading-none sm:text-[2.6rem]" data-guide="name">
            {name}
          </h1>

          {paragraphs.map((text, i) => (
            <p
              key={i}
              data-placeholder={text.startsWith('[') ? 'true' : undefined}
              className={`reveal text-[15px] leading-relaxed text-gray-600 ${
                i === 0 ? 'd3 mt-6' : 'd4 mt-5'
              }`}
            >
              {text}
            </p>
          ))}

          <div
            className="reveal d5 mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[12px] text-gray-500"
            data-guide="socials"
          >
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="hover:text-ink">
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
