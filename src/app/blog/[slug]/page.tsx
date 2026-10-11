import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/pages/PageShell'
import { Markdown } from '@/components/pages/Markdown'
import { getPost, getPosts } from '@/lib/data'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  }
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <PageShell width="3xl">
      <article>
        <header className="mb-10">
          <Link
            href="/blog"
            className="font-mono text-[11px] uppercase tracking-wider text-gray-400 hover:text-ink"
          >
            ← blog
          </Link>
          <h1
            data-placeholder={post.placeholder ? 'true' : undefined}
            className="mt-4 font-pixel text-[26px] leading-tight text-ink sm:text-3xl"
          >
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-gray-400">
            <time>{post.date}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readMinutes} min read</span>
          </div>
        </header>

        <Markdown source={post.body} placeholder={post.placeholder} />
      </article>
    </PageShell>
  )
}
