import Link from 'next/link'
import { PageShell } from '@/components/pages/PageShell'
import { PageHeader } from '@/components/pages/PageHeader'
import { getPosts } from '@/lib/data'
import type { Post } from '@/lib/types'

export const metadata = {
  title: 'Blog',
  description: 'Notes, write-ups and learning logs.',
}

/** Spec §8 — /blog. Rows: thumbnail, date, title, excerpt, read time, pagination. */
export default async function BlogIndexPage() {
  const posts = await getPosts()

  return (
    <PageShell width="3xl">
      <PageHeader
        title="blog"
        lead="[One sentence on what you write about.]"
        headerClass="mb-10"
        leadClass="mb-10"
      />

      <div className="divide-y divide-gray-200 border-y border-gray-200">
        {posts.map((post) => (
          <BlogRow key={post.id} post={post} />
        ))}
      </div>

      <nav
        aria-label="Pagination"
        className="mt-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider"
      >
        <span className="text-gray-300">← prev</span>
        <span className="text-gray-500">1 / 1</span>
        <span className="text-gray-300">next →</span>
      </nav>
    </PageShell>
  )
}

function BlogRow({ post }: { post: Post }) {
  return (
    <article>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col gap-5 py-6 hover:bg-gray-50/80 sm:flex-row sm:items-start"
      >
        <div
          aria-hidden="true"
          className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:h-[104px] sm:w-[132px]"
        >
          <span className="halftone absolute inset-0 opacity-[0.18]" />
        </div>

        <div className="min-w-0 flex-1">
          <time className="font-mono text-[11px] uppercase tracking-wider text-gray-400">
            {post.date}
          </time>
          <h2
            data-placeholder={post.placeholder ? 'true' : undefined}
            className="mt-1.5 text-[17px] font-medium leading-snug text-ink group-hover:text-gray-500"
          >
            {post.title}
          </h2>
          <p
            data-placeholder={post.placeholder ? 'true' : undefined}
            className="mt-1.5 text-[14px] leading-relaxed text-gray-500"
          >
            {post.excerpt}
          </p>
          <span className="mt-2.5 inline-block font-mono text-[11px] text-gray-400">
            Read · {post.readMinutes} min
          </span>
        </div>
      </Link>
    </article>
  )
}
