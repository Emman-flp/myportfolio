import { HalftoneDivider } from '@/components/primitives/HalftoneDivider'
import { Hero } from '@/components/home/Hero'
import { BlogList } from '@/components/home/BlogList'
import { ProjectDeck } from '@/components/home/ProjectDeck'
import { ExperienceList } from '@/components/home/ExperienceList'
import { CertificationGrid } from '@/components/home/CertificationGrid'
import { AffiliationList } from '@/components/home/AffiliationList'
import { GithubGraph } from '@/components/home/GithubGraph'
import { PROFILE } from '@/lib/fixtures'

/**
 * Section order and headings mirror docs/UI-SPECIFICATION.md §3.
 * Sections 01–06 follow the reference's 01–07 with the two
 * social-proof sections (sponsor strip, testimonials) removed — spec §11 #1.
 */
export default function HomePage() {
  return (
    <main id="top" className="relative z-10 lg:pl-56">
      <div className="mx-auto max-w-2xl px-6">
        <Hero />
        <HalftoneDivider />
        <BlogList />
        <ProjectDeck />
        <ExperienceList />
        <CertificationGrid />
        <AffiliationList />
        <GithubGraph username={PROFILE.githubUsername} />
        <HalftoneDivider tall />
      </div>
    </main>
  )
}
