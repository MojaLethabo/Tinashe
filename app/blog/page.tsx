import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ImageIcon } from 'lucide-react'
import { getBlogPosts } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Blog | ZARD',
  description: 'Insights, reflections, and research notes from Innocent Tinashe Mutero.',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <>
      {/* Header */}
      <section className="pt-32" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <span className="section-label mb-4">ZARD · Blog</span>
          <div className="pb-12" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <h1 className="font-playfair leading-none mb-5" style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', color: '#111111' }}>
              Blog &amp; Insights
            </h1>
            <p className="font-inter text-[15px] leading-relaxed max-w-xl" style={{ color: '#555555' }}>
              Research reflections, field notes, and commentary on music, community, and scholarship.
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {posts.length === 0 ? (
            <p className="font-inter text-sm py-20 text-center" style={{ color: '#888888' }}>
              No posts published yet — check back soon.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden transition-all hover:-translate-y-1"
                  style={{ background: '#ffffff', border: '1px solid #e0e0e0' }}
                >
                  {/* Image */}
                  <div
                    className="relative overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ height: 200, background: '#f0f0f0' }}
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <ImageIcon size={32} style={{ color: '#dddddd' }} />
                    )}
                    {post.tags.length > 0 && (
                      <span
                        className="absolute top-3 left-3 font-inter text-[8px] tracking-[0.2em] uppercase px-2.5 py-1"
                        style={{ background: '#ffffff', color: '#555555', border: '1px solid #e0e0e0' }}
                      >
                        {post.tags[0]}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-6">
                    <p className="font-inter text-[10px] tracking-[0.18em] uppercase mb-3" style={{ color: '#aaaaaa' }}>
                      {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h2 className="font-playfair leading-snug mb-3 group-hover:opacity-70 transition-opacity" style={{ fontSize: '1.1rem', color: '#111111' }}>
                      {post.title}
                    </h2>
                    <p className="font-inter text-[13px] leading-relaxed flex-1 line-clamp-3" style={{ color: '#555555' }}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-1.5 mt-5 font-inter uppercase transition-colors group-hover:text-[#111111]"
                      style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: '#888888' }}>
                      Read More <ArrowRight size={9} strokeWidth={1.8} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
