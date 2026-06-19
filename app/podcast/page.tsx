import type { Metadata } from 'next'
import { Radio } from 'lucide-react'
import PodcastList from '@/components/PodcastList'
import { getEpisodes, getLiveSessions } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Podcast | ZARD',
  description: 'All episodes and live session recordings — ZARD research podcast by Innocent Tinashe Mutero.',
}

export default async function PodcastPage() {
  const [episodes, liveSessions] = await Promise.all([getEpisodes(), getLiveSessions()])
  const total = episodes.length + liveSessions.length

  return (
    <>
      <section className="pt-28 sm:pt-32" style={{ background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <span className="section-label mb-4">ZARD · Research Podcast</span>

          <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-end pb-10 sm:pb-12" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div>
              <h1 className="font-playfair leading-none mb-5" style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)', color: '#111111' }}>
                All Episodes
              </h1>
              <p className="font-inter text-[15px] leading-relaxed max-w-xl" style={{ color: '#555555' }}>
                Research conversations and live session recordings exploring arts for social change,
                conflict transformation, and community engagement across Southern Africa.
              </p>
            </div>
            <div className="md:text-right flex-shrink-0">
              <p className="font-inter font-black leading-none mb-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.04em', color: '#111111' }}>{total}</p>
              <p className="font-inter text-[9px] tracking-[0.25em] uppercase" style={{ color: '#999999' }}>Total Episodes</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: '#f6f6f6', borderBottom: '1px solid #e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center divide-x" style={{ borderColor: '#e0e0e0' }}>
            <div className="py-4 pr-8">
              <span className="font-inter text-[9px] tracking-[0.22em] uppercase" style={{ color: '#777777' }}>
                {episodes.length} Episodes · {liveSessions.length} Live Sessions
              </span>
            </div>
            <div className="py-4 px-8">
              <span className="font-inter text-[9px] tracking-[0.22em] uppercase" style={{ color: '#aaaaaa' }}>
                Free to listen
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20" style={{ background: '#f6f6f6' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-8 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>Episodes</h2>
            <span className="font-inter text-[9px] tracking-[0.25em] uppercase" style={{ color: '#999999' }}>
              {episodes.length} episodes
            </span>
          </div>
          <PodcastList episodes={episodes} />
        </div>
      </section>

      <section id="live" className="py-20" style={{ background: '#eeeeee', borderTop: '1px solid #e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-5 pb-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
            <div className="flex items-center gap-3">
              <Radio size={15} strokeWidth={2} style={{ color: '#777777' }} />
              <h2 className="font-inter font-black tracking-tight" style={{ fontSize: '1.375rem', color: '#111111' }}>Past Live Sessions</h2>
            </div>
            <span className="font-inter text-[9px] tracking-[0.25em] uppercase" style={{ color: '#999999' }}>
              {liveSessions.length} recordings
            </span>
          </div>

          <p className="font-inter text-[13px] mt-6 mb-8 max-w-2xl" style={{ color: '#555555' }}>
            Originally broadcast live with open audience Q&amp;A. Full recordings are now available below.
          </p>

          <div className="flex items-center gap-4 px-5 py-4 mb-8" style={{ border: '1px solid #e0e0e0', background: '#ffffff' }}>
            <span className="inline-flex items-center gap-1 font-inter font-black text-[7px] tracking-[0.15em] uppercase px-2 py-0.5 flex-shrink-0" style={{ background: '#111111', color: '#ffffff' }}>
              <Radio size={7} />LIVE REC
            </span>
            <p className="font-inter text-[12px]" style={{ color: '#666666' }}>
              Episodes marked <strong className="font-semibold" style={{ color: '#333333' }}>LIVE REC</strong> are
              recordings of sessions streamed live. Original viewer counts shown where available.
            </p>
          </div>

          <PodcastList episodes={liveSessions} />
        </div>
      </section>
    </>
  )
}
