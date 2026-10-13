import { HalftoneDivider } from '@/components/primitives/HalftoneDivider'
import { Hero } from '@/components/home/Hero'
import { BlogList } from '@/components/home/BlogList'
import { ProjectDeck } from '@/components/home/ProjectDeck'
import { ExperienceList } from '@/components/home/ExperienceList'
import { CertificationGrid } from '@/components/home/CertificationGrid'
import { AffiliationList } from '@/components/home/AffiliationList'
import { GithubGraph } from '@/components/home/GithubGraph'
import { getProfile, getProjects, getPosts, getExperienceEntries, getStackChips, getCertifications, getAffiliations } from '@/lib/data'
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

/**
 * Section order and headings mirror docs/UI-SPECIFICATION.md §3.
 * Sections 01–06 follow the reference's 01–07 with the two
 * social-proof sections (sponsor strip, testimonials) removed — spec §11 #1.
 *
 * Content comes from Supabase when it is reachable, and falls back to
 * `lib/fixtures.ts` otherwise, so the layout always renders in its real shape.
 */
export default async function HomePage() {
  const [profile, posts, projects, experience, stack, certs, affiliations] = await Promise.all([
    getProfile(),
    getPosts(3),
    getProjects(3),
    getExperienceEntries(4),
    getStackChips(10),
    getCertifications(),
    getAffiliations(),
  ])

  return (
    <main id="top" className="relative z-10 lg:pl-56">
      <div className="mx-auto max-w-2xl px-6">
        <Hero profile={profile} />
        <HalftoneDivider />
        <BlogList posts={posts} />
        <ProjectDeck projects={projects} />
        <ExperienceList entries={experience} stack={stack} />
        <CertificationGrid certs={certs} />
        <AffiliationList items={affiliations} />
        <GithubGraph username={profile.githubUsername} />
        <HalftoneDivider tall />
      </div>
    </main>
  )
}
