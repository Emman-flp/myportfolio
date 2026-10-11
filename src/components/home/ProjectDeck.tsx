'use client'

import { useState } from 'react'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { PLACEHOLDER_PROJECTS } from '@/lib/fixtures'
import type { Project } from '@/lib/types'

/**
 * Spotlight card deck. Spec §4.10, CSS §5.4.
 *
 * Clicking a side card swaps slots, exactly as the reference's activateCard()
 * does: the clicked card becomes `is-center`, the old centre takes its slot.
 * Slot classes are derived from index distance rather than stored, so a change
 * is a pure render.
 */
export function ProjectDeck({ projects = PLACEHOLDER_PROJECTS }: { projects?: Project[] }) {
  const [center, setCenter] = useState(0)

  const slotFor = (i: number) => {
    if (i === center) return 'is-center'
    const d = i - center
    if (d === -1 || (center === projects.length - 1 && d === 1)) return 'is-left'
    return 'is-right'
  }

  return (
    <section id="projects" className="py-14">
      <SectionHeader index="02" title="projects" action={{ label: 'all projects', href: '/projects' }} />

      <div className="deck" data-deck>
        {projects.map((project, i) => {
          const slot = slotFor(i)
          const isCenter = slot === 'is-center'
          return (
            <article
              key={project.id}
              className={`deck-card ${slot} rounded-2xl border border-gray-200 bg-white p-5`}
              onClick={() => !isCenter && setCenter(i)}
              onKeyDown={(e) => {
                if (!isCenter && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  setCenter(i)
                }
              }}
              role={isCenter ? undefined : 'button'}
              tabIndex={isCenter ? -1 : 0}
              aria-label={isCenter ? undefined : `Show ${project.title}`}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {project.badges.map((badge, bi) =>
                  bi === 0 ? (
                    <span
                      key={badge}
                      data-placeholder={badge.startsWith('[') ? 'true' : undefined}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white"
                    >
                      {badge}
                      <span className="inline-flex -scale-x-100" aria-hidden="true">
                        ↗
                      </span>
                    </span>
                  ) : (
                    <span
                      key={badge}
                      data-placeholder={badge.startsWith('[') ? 'true' : undefined}
                      className="rounded-full border border-gray-300 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gray-500"
                    >
                      {badge}
                    </span>
                  ),
                )}
              </div>

              <div className="mt-4 flex items-center gap-3.5">
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-300 shadow-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3
                  data-placeholder={project.title.startsWith('[') ? 'true' : undefined}
                  className="font-pixel text-base leading-tight text-ink"
                >
                  {project.title}
                </h3>
              </div>

              <p
                data-placeholder={project.summary.startsWith('[') ? 'true' : undefined}
                className="mt-3 text-[13px] leading-relaxed text-gray-600"
              >
                {project.summary}
              </p>

              {project.links.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  {project.links.map((link) => (
                    <a key={link.href} href={link.href} className="transition-opacity hover:opacity-80">
                      <span className="sr-only">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
