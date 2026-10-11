import { SectionHeader } from '@/components/primitives/SectionHeader'
import { PLACEHOLDER_POSTS } from '@/lib/fixtures'
import type { Post } from '@/lib/types'

/** Spec §4.9. Measured row height 87–88px, title 23px, excerpt 20px, time 18px. */
export function BlogList({ posts = PLACEHOLDER_POSTS }: { posts?: Post[] }) {
  return (
    <section id="blog" className="relative py-14">
      <div
        aria-hidden="true"
        className="halftone mask-circle pointer-events-none absolute -left-10 bottom-6 h-32 w-32 opacity-20"
      />

      <SectionHeader index="01" title="blog" action={{ label: 'all posts', href: '/blog' }} />

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {posts.map((post) => (
          <a
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex items-baseline justify-between gap-6 py-5 hover:bg-gray-50/80"
          >
            <div className="min-w-0">
              <h3
                data-placeholder={post.placeholder ? 'true' : undefined}
                className="truncate text-[15px] font-medium text-ink group-hover:text-gray-500"
              >
                {post.title}
              </h3>
              <p
                data-placeholder={post.placeholder ? 'true' : undefined}
                className="mt-1 truncate text-sm text-gray-500"
              >
                {post.excerpt}
              </p>
            </div>
            <time className="shrink-0 font-mono text-[12px] text-gray-400">{post.date}</time>
          </a>
        ))}
      </div>
    </section>
  )
}
