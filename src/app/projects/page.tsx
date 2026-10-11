import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { getProjects, getProjectStack } from '@/lib/data'
import type { ProjectDetail, ProjectStackRow } from '@/lib/types'

export const metadata = {
  title: 'Projects',
  description: 'Data projects and case studies.',
}

/** Spec §8 — /projects, max-w-2xl. */
export default async function ProjectsPage() {
  const [projects, stack] = await Promise.all([getProjects(), getProjectStack()])

  return (
    <PageShell width="2xl">
      <PageHeader
        title="projects"
        lead="[One or two sentences on what you build and what you have shipped so far.]"
      />

      <div className="mb-10 space-y-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}

        <article className="reveal overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white">
          <div className="p-6 sm:p-7">
            <span
              data-placeholder
              className="font-mono text-[10px] uppercase tracking-wider text-gray-400"
            >
              [Category · Category · Category]
            </span>
            <h2 data-placeholder className="mt-3 font-pixel text-xl leading-none">
              [Case study title — placeholder]
            </h2>
            <p
              data-placeholder
              className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-gray-600"
            >
              [What the problem was, what you built, and what came out of it.]
            </p>
            <a
              data-placeholder
              href="#"
              className="mt-4 inline-block font-mono text-[11px] uppercase tracking-wider text-gray-500 hover:text-ink"
            >
              Watch on YouTube ↗
            </a>
          </div>
          <div className="edge-fade-divider flex aspect-video items-center justify-center bg-gray-950">
            <span className="font-mono text-[11px] uppercase tracking-wider text-gray-600">
              [video embed — placeholder]
            </span>
          </div>
        </article>
      </div>

      <div className="project-stack overflow-hidden rounded-2xl border border-gray-200">
        {stack.map((row) => (
          <ProjectStackRowView key={row.id} row={row} />
        ))}
      </div>
    </PageShell>
  )
}

function ProjectCard({ project }: { project: ProjectDetail }) {
  return (
    <div className="reveal rounded-2xl bg-gradient-to-br from-gray-50 to-white p-6 transition hover:-translate-y-0.5 sm:p-7">
      <div className="flex items-start gap-4 sm:gap-5">
        <ProjectIcon />
        <div className="min-w-0">
          {project.badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {project.badges.map((b, i) =>
                i === 0 ? (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white"
                  >
                    {b}
                    <span className="inline-flex -scale-x-100" aria-hidden="true">↗</span>
                  </span>
                ) : (
                  <span
                    key={b}
                    className="rounded-full border border-gray-300 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gray-500"
                  >
                    {b}
                  </span>
                ),
              )}
            </div>
          )}
          <h2
            data-placeholder={project.title.startsWith('[') ? 'true' : undefined}
            className={`font-pixel text-base leading-tight text-ink ${project.badges.length ? 'mt-3' : ''}`}
          >
            {project.title}
          </h2>
          <p
            data-placeholder={project.summary.startsWith('[') ? 'true' : undefined}
            className="mt-2 text-[13.5px] leading-relaxed text-gray-600"
          >
            {project.summary}
          </p>
        </div>
      </div>

      {project.links.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-mono text-[11px] text-gray-600 transition-opacity hover:opacity-80"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}

      {project.featuredIn && project.featuredIn.length > 0 && (
        <div className="edge-fade-divider mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
            Featured in
          </span>
          {project.featuredIn.map((f) => (
            <a
              key={f.label}
              href={f.href}
              className="font-mono text-[12px] text-gray-500 hover:text-ink"
            >
              {f.label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectStackRowView({ row }: { row: ProjectStackRow }) {
  return (
    <div className="reveal group flex flex-col gap-4 border-t border-gray-200 p-6 first:border-t-0 hover:bg-gray-50/60 sm:flex-row">
      <div className="flex shrink-0 items-center gap-3 sm:w-52">
        <a
          data-placeholder
          href={row.href}
          className="font-pixel text-base text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
        >
          {row.name} ↗
        </a>
      </div>
      <div className="flex-1">
        <span className="font-mono text-[11px] uppercase tracking-wider text-gray-400">
          {row.category}
        </span>
        <p
          data-placeholder={row.description.startsWith('[') ? 'true' : undefined}
          className="mt-1.5 text-[14px] leading-relaxed text-gray-600"
        >
          {row.description}
        </p>
      </div>
    </div>
  )
}

function ProjectIcon() {
  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
