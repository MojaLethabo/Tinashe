import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, User, Tag } from 'lucide-react'
import { getBlogPostBySlug, getBlogPosts } from '@/lib/api'
import CommentSection from '@/components/CommentSection'
import BlogViewTracker from '@/components/BlogViewTracker'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}
  return {
    title: `${post.title} | ZARD Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()])
  if (!post || post.status !== 'published') notFound()

  const related = allPosts.filter(p => p.id !== post.id).slice(0, 3)

  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)

  return (
    <>
      <BlogViewTracker slug={post.slug} />
      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-10 sm:pb-12" style={{ background: '#ffffff' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-inter uppercase mb-8 transition-colors hover:text-[#111111]"
            style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: '#888888' }}
          >
            <ArrowLeft size={9} strokeWidth={1.8} /> Back to Blog
          </Link>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="font-inter text-[8px] tracking-[0.2em] uppercase px-3 py-1.5"
                  style={{ border: '1px solid #d0d0d0', color: '#555555' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="font-playfair leading-tight mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#111111' }}>
            {post.title}
          </h1>

          <p className="font-inter text-[15px] leading-relaxed mb-8 max-w-2xl" style={{ color: '#555555' }}>
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-5" style={{ borderTop: '1px solid #e0e0e0' }}>
            <span className="flex items-center gap-1.5 font-inter text-[10px] tracking-[0.15em] uppercase" style={{ color: '#888888' }}>
              <User size={11} /> {post.author}
            </span>
            <span className="flex items-center gap-1.5 font-inter text-[10px] tracking-[0.15em] uppercase" style={{ color: '#888888' }}>
              <CalendarDays size={11} />
              {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </section>

      {/* Cover image */}
      {post.imageUrl && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-12" style={{ background: '#ffffff' }}>
          <div className="overflow-hidden" style={{ border: '1px solid #e0e0e0' }}>
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full object-cover"
              style={{ maxHeight: 480 }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="pb-20" style={{ background: '#ffffff' }}>
        <div className="max-w-3xl mx-auto px-8">
          <div className="space-y-6">
            {paragraphs.map((para, i) => (
              <p key={i} className="font-inter leading-relaxed" style={{ fontSize: '1.0625rem', color: '#333333', lineHeight: 1.85 }}>
                {para}
              </p>
            ))}
          </div>
          <CommentSection targetId={post.slug} targetType="blog" />
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16" style={{ background: '#f6f6f6', borderTop: '1px solid #e0e0e0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex items-end justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
              <div>
                <span className="section-label mb-2.5">Continue Reading</span>
                <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.1rem', color: '#111111' }}>More Posts</h2>
              </div>
              <Link href="/blog" className="flex items-center gap-1.5 font-inter uppercase transition-colors hover:text-[#111111]"
                style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', color: '#777777' }}>
                All Posts <ArrowLeft size={10} strokeWidth={1.8} className="rotate-180" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(p => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden transition-all hover:-translate-y-1"
                  style={{ background: '#ffffff', border: '1px solid #e0e0e0' }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ height: 140, background: '#f0f0f0' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    ) : (
                      <span className="font-playfair font-bold" style={{ fontSize: '2rem', color: '#e8e8e8' }}>B</span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-inter text-[9px] tracking-[0.18em] uppercase mb-2" style={{ color: '#aaaaaa' }}>
                      {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <h3 className="font-playfair leading-snug group-hover:opacity-70 transition-opacity" style={{ fontSize: '0.95rem', color: '#111111' }}>
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
