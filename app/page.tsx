import Link from 'next/link'
import { ArrowRight, Play, Radio, ImageIcon } from 'lucide-react'
import FeaturedPodcast from '@/components/FeaturedPodcast'
import { WAVEFORM_BARS } from '@/lib/episodes'
import { getEpisodes, getLiveSessions, getBlogPosts } from '@/lib/api'

const RESEARCH_AREAS = [
  {
    n: '01',
    title: 'African Cultural Economies & Music',
    desc: 'How creative practice, music, and digital industries generate economic value and social meaning — with focus on migrant placemaking and Zimbabwe\'s independent music economy.',
  },
  {
    n: '02',
    title: 'Civic University & Community Engagement',
    desc: 'Frameworks for authentic university–community partnership grounded in community-based participatory research (CBPR) and critical service learning.',
  },
  {
    n: '03',
    title: 'Entrepreneurship Ecosystems & Digital Skills',
    desc: 'Research on entrepreneurial ecosystems, digital economy workforce transitions, and M&E in higher education entrepreneurship programmes across South Africa.',
  },
]

export default async function HomePage() {
  const [episodes, liveSessions, blogPosts] = await Promise.all([getEpisodes(), getLiveSessions(), getBlogPosts()])
  const recentEpisodes = episodes.slice(0, 4)
  const latestPosts = blogPosts.slice(0, 3)

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="relative flex flex-col" style={{ background: '#ffffff', minHeight: '100svh' }}>
        <div style={{ height: 1, background: '#e5e5e5' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 sm:pt-24 w-full">
          <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #ebebeb' }}>
            <div className="flex items-center gap-3">
              <span className="font-inter font-semibold" style={{ fontSize: '0.625rem', letterSpacing: '0.45em', textTransform: 'uppercase', color: '#aaaaaa' }}>
                ZARD
              </span>
              <span style={{ display: 'inline-block', width: 1, height: 9, background: '#dddddd' }} />
              <span className="font-inter" style={{ fontSize: '0.5625rem', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#bbbbbb' }}>
                Research Podcast
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="animate-pulse-dot w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#999999' }} />
              <span className="font-inter hidden sm:inline" style={{ fontSize: '0.5625rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#aaaaaa' }}>
                {episodes.length} Episodes Available
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
            <h1 className="font-playfair leading-none" style={{ fontSize: 'clamp(2.6rem, 8.5vw, 8.5rem)', letterSpacing: '-0.025em', marginBottom: '2rem', color: '#111111' }}>
              <br />Tinashe Mutero
            </h1>
            <div style={{ width: 56, height: 1, background: '#cccccc', marginBottom: '1.75rem' }} />
            <p className="font-inter leading-relaxed" style={{ fontSize: 'clamp(0.875rem, 1.35vw, 1.05rem)', color: '#555555', maxWidth: 500, marginBottom: '2.5rem' }}>
              Research conversations at the intersection of music, peace, and social justice —
              from Zimbabwe and South Africa.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e5e5' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 sm:py-7" style={{ borderBottom: '1px solid #ebebeb' }}>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/podcast"
                  className="inline-flex items-center gap-2.5 font-inter font-black text-white uppercase transition-opacity hover:opacity-80"
                  style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', background: '#111111', padding: '0.75rem 1.5rem' }}
                >
                  <Play size={9} strokeWidth={3} />Listen to the Podcast
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 font-inter uppercase transition-colors hover:text-[#333333]"
                  style={{ fontSize: '0.5625rem', letterSpacing: '0.18em', border: '1px solid #d5d5d5', color: '#666666', padding: '0.75rem 1.25rem' }}
                >
                  About <ArrowRight size={9} strokeWidth={1.8} />
                </Link>
              </div>
              <p className="font-inter leading-relaxed hidden md:block" style={{ fontSize: '0.6875rem', color: '#777777', textAlign: 'right', maxWidth: 320, lineHeight: 1.7 }}>
                PhD (Public Administration) · DMus (Ethnomusicology)<br />
                Research & M&E Lead · JBS, University of Johannesburg
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex overflow-x-auto divide-x" style={{ borderColor: '#ebebeb' }}>
              {[
                { n: String(episodes.length), label: 'Episodes' },
                { n: String(liveSessions.length), label: 'Live Sessions' },
                { n: '18+', label: 'Publications' },
                { n: '198', label: 'Citations' },
              ].map(({ n, label }, i) => (
                <div key={label} className="flex-shrink-0 py-5" style={{ paddingLeft: i === 0 ? 0 : 20, paddingRight: 20 }}>
                  <p className="font-inter font-black leading-none" style={{ fontSize: '1.2rem', letterSpacing: '-0.03em', marginBottom: '0.3rem', color: '#111111' }}>{n}</p>
                  <p className="font-inter uppercase whitespace-nowrap" style={{ fontSize: '0.4375rem', letterSpacing: '0.25em', color: '#999999' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ LATEST BLOG ══ */}
      <section className="py-14 sm:py-20" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-end justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <span className="section-label mb-2.5">Writing</span>
              <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>
                Latest from the Blog
              </h2>
            </div>
            <Link href="/blog" className="flex items-center gap-1.5 font-inter uppercase transition-colors hover:text-[#111111]" style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', color: '#777777' }}>
              All Posts <ArrowRight size={10} strokeWidth={1.8} />
            </Link>
          </div>

          {latestPosts.length === 0 ? (
            <p className="font-inter text-sm py-10" style={{ color: '#888888' }}>
              No posts yet — check back soon.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
              {latestPosts.map(post => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden transition-all hover:-translate-y-1"
                  style={{ background: '#ffffff', border: '1px solid #e0e0e0' }}
                >
                  <div
                    className="relative flex-shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ height: 180, background: '#eeeeee' }}
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <ImageIcon size={28} style={{ color: '#cccccc' }} />
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
                  <div className="flex flex-col flex-1 p-5 sm:p-6">
                    <p className="font-inter text-[9px] tracking-[0.18em] uppercase mb-2.5" style={{ color: '#aaaaaa' }}>
                      {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h3 className="font-playfair leading-snug mb-2.5 group-hover:opacity-60 transition-opacity" style={{ fontSize: '1.05rem', color: '#111111' }}>
                      {post.title}
                    </h3>
                    <p className="font-inter text-[12px] leading-relaxed flex-1 line-clamp-2" style={{ color: '#666666' }}>
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1.5 mt-4 font-inter uppercase transition-colors group-hover:text-[#111111]"
                      style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: '#888888' }}>
                      Read More <ArrowRight size={8} strokeWidth={1.8} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ FEATURED EPISODE ══ */}
      <section className="py-14 sm:py-20" style={{ background: '#eeeeee' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-end justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <span className="section-label mb-2.5">Latest Release</span>
              <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>
                Featured Episode
              </h2>
            </div>
            <Link href="/podcast" className="flex items-center gap-1.5 font-inter uppercase transition-colors hover:text-[#111111]" style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', color: '#777777' }}>
              All Episodes <ArrowRight size={10} strokeWidth={1.8} />
            </Link>
          </div>
          <FeaturedPodcast />
        </div>
      </section>

      {/* ══ RECENT EPISODES ══ */}
      <section className="py-14 sm:py-20" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-end justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <span className="section-label mb-2.5">Episodes</span>
              <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>
                Recent Episodes
              </h2>
            </div>
            <Link href="/podcast" className="flex items-center gap-1.5 font-inter uppercase transition-colors hover:text-[#111111]" style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', color: '#777777' }}>
              All {episodes.length} <ArrowRight size={10} strokeWidth={1.8} />
            </Link>
          </div>

          <div>
            {recentEpisodes.map((ep) => (
              <Link
                key={ep.id}
                href="/podcast"
                className="group relative flex items-start gap-4 sm:gap-8 py-6 sm:py-8 transition-colors hover:bg-black/[0.03]"
                style={{ borderBottom: '1px solid #e0e0e0' }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: '#333333' }} />

                <span className="hidden md:block font-inter font-black select-none flex-shrink-0 leading-none" style={{ width: 52, fontSize: '2rem', letterSpacing: '-0.06em', paddingTop: '0.2rem', color: '#dddddd' }}>
                  {ep.episode != null ? String(ep.episode).padStart(2, '0') : '—'}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                    <span className="inline-block font-inter uppercase" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', border: '1px solid #cccccc', color: '#555555', padding: '2px 8px' }}>
                      {ep.category}
                    </span>
                    {ep.isLive && (
                      <span className="inline-flex items-center gap-1 font-inter font-black uppercase" style={{ fontSize: '0.4375rem', letterSpacing: '0.15em', background: '#111111', color: '#ffffff', padding: '2px 6px' }}>
                        <Radio size={6} />LIVE REC
                      </span>
                    )}
                  </div>
                  <h3 className="font-playfair leading-tight group-hover:opacity-60 transition-opacity" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', marginBottom: '0.5rem', color: '#111111' }}>
                    {ep.title}
                  </h3>
                  {ep.description && (
                    <p className="font-inter text-[13px] leading-relaxed line-clamp-2" style={{ color: '#555555' }}>
                      {ep.description}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-2 pt-1">
                  <span className="font-inter" style={{ fontSize: '0.6875rem', color: '#888888' }}>{ep.duration}</span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 font-inter font-semibold uppercase opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontSize: '0.5rem', letterSpacing: '0.15em', color: '#333333' }}>
                    <Play size={7} strokeWidth={3} />Play
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RESEARCH AREAS ══ */}
      <section className="py-14 sm:py-20" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-end justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <span className="section-label mb-2.5">Scholarly Work</span>
              <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>Research Areas</h2>
            </div>
            <Link href="/research" className="flex items-center gap-1.5 font-inter uppercase transition-colors hover:text-[#111111]" style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', color: '#777777' }}>
              View All <ArrowRight size={10} strokeWidth={1.8} />
            </Link>
          </div>

          {RESEARCH_AREAS.map(({ n, title, desc }) => (
            <Link
              key={n}
              href="/research"
              className="group grid md:grid-cols-[72px_1fr_32px] gap-x-8 items-start py-8 sm:py-10 transition-colors hover:bg-black/[0.03]"
              style={{ borderBottom: '1px solid #e0e0e0' }}
            >
              <span className="font-inter font-semibold uppercase hidden md:block" style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: '#aaaaaa', paddingTop: '0.35rem' }}>{n}</span>
              <div>
                <h3 className="font-playfair leading-tight group-hover:opacity-60 transition-opacity" style={{ fontSize: 'clamp(1.05rem, 2vw, 1.5rem)', marginBottom: '0.75rem', color: '#111111' }}>
                  {title}
                </h3>
                <p className="font-inter text-[13px] leading-relaxed" style={{ color: '#555555', maxWidth: 580 }}>{desc}</p>
              </div>
              <ArrowRight size={13} strokeWidth={1.5} className="hidden md:block opacity-0 group-hover:opacity-40 transition-all group-hover:translate-x-0.5 mt-1 flex-shrink-0" style={{ color: '#333333' }} />
            </Link>
          ))}
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="py-14 sm:py-24" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-[1fr_280px] gap-10 md:gap-20 items-start">
            <div>
              <span className="section-label mb-8 sm:mb-10">About the Researcher</span>
              <span className="font-playfair block select-none" style={{ fontSize: '4.5rem', color: '#eeeeee', lineHeight: 0.72, marginBottom: '0.5rem' }} aria-hidden>"</span>
              <blockquote className="font-playfair leading-snug" style={{ fontSize: 'clamp(1.2rem, 2.4vw, 1.8rem)', marginBottom: '1.25rem', color: '#111111' }}>
                Community–university partnerships and entrepreneurial ecosystems generate
                socially embedded knowledge that drives inclusive wellbeing and local development.
              </blockquote>
              <cite className="not-italic font-inter uppercase block" style={{ fontSize: '0.5rem', letterSpacing: '0.28em', color: '#999999', marginBottom: '2rem' }}>
                — Innocent Tinashe Mutero
              </cite>
              <div style={{ width: 40, height: 1, background: '#d0d0d0', marginBottom: '1.75rem' }} />
              <p className="font-inter text-[14px] leading-relaxed" style={{ color: '#555555', maxWidth: 460, marginBottom: '2.5rem' }}>
                Interdisciplinary scholar at the intersection of African cultural economies,
                civic university theory, and participatory research. Research & M&E Lead at the
                Johannesburg Business School Centre for Entrepreneurship, University of Johannesburg.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 font-inter uppercase group transition-colors hover:text-[#111111]" style={{ fontSize: '0.5625rem', letterSpacing: '0.22em', color: '#666666' }}>
                Full Biography
                <ArrowRight size={10} strokeWidth={1.8} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="relative overflow-hidden" style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', aspectRatio: '3/4' }}>
                <span className="absolute inset-0 flex items-center justify-center font-playfair font-bold select-none" style={{ fontSize: '4.5rem', color: '#e8e8e8' }} aria-hidden>ITM</span>
                <div className="absolute bottom-0 left-0 right-0 flex items-end gap-[2px] px-4 pb-4" style={{ height: 48 }} aria-hidden>
                  {WAVEFORM_BARS.slice(0, 26).map((h, i) => (
                    <div key={i} className="flex-1 rounded-[1px]" style={{ height: `${h * 0.58}%`, background: `rgba(0,0,0,${0.08 + (i / 26) * 0.2})` }} />
                  ))}
                </div>
                <p className="absolute top-3.5 left-4 font-inter uppercase" style={{ fontSize: '0.4375rem', letterSpacing: '0.22em', color: '#bbbbbb' }}>Portrait</p>
              </div>
              {[
                { label: 'Focus', value: 'African Cultural Economies · Entrepreneurship Ecosystems' },
                { label: 'Credentials', value: 'PhD (Public Administration) · DMus (Ethnomusicology)' },
                { label: 'Institution', value: 'Johannesburg Business School · University of Johannesburg' },
              ].map(({ label, value }) => (
                <div key={label} className="px-4 py-3.5" style={{ borderBottom: '1px solid #ebebeb' }}>
                  <p className="font-inter uppercase" style={{ fontSize: '0.4375rem', letterSpacing: '0.22em', color: '#aaaaaa', marginBottom: '0.375rem' }}>{label}</p>
                  <p className="font-inter leading-snug" style={{ fontSize: '0.8125rem', color: '#444444' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-12 sm:py-14" style={{ background: '#f2f2f2', borderTop: '1px solid #e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
          <div>
            <p className="font-inter uppercase" style={{ fontSize: '0.5rem', letterSpacing: '0.35em', color: '#999999', marginBottom: '0.625rem' }}>
              Free to listen · No sign-up required
            </p>
            <h2 className="font-playfair leading-tight" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', marginBottom: '0.5rem', color: '#111111' }}>
              Start listening to the research.
            </h2>
            <p className="font-inter" style={{ fontSize: '0.8125rem', color: '#666666' }}>
              {episodes.length} episodes · {liveSessions.length} live sessions
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end gap-3 flex-wrap">
            <Link href="/podcast" className="inline-flex items-center gap-3 font-inter font-black text-white uppercase hover:opacity-90 transition-opacity" style={{ fontSize: '0.5625rem', letterSpacing: '0.2em', background: '#111111', padding: '0.875rem 1.75rem' }}>
              <Play size={10} strokeWidth={3} />Browse All Episodes
            </Link>
            <Link href="/research" className="inline-flex items-center gap-1.5 font-inter uppercase transition-colors hover:text-[#111111]" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: '#666666' }}>
              View Research Areas <ArrowRight size={9} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
