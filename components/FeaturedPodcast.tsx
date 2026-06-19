import { Radio } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import { getEpisodes, getLiveSessions } from '@/lib/api'

export default async function FeaturedPodcast() {
  const [episodes, liveSessions] = await Promise.all([getEpisodes(), getLiveSessions()])
  const ep = episodes[0] ?? liveSessions[0]
  if (!ep) return null

  const dateStr = new Date(ep.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const hasEpNum = !ep.isLive && ep.episode != null

  return (
    <div className="overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e0e0e0' }}>

      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5" style={{ borderBottom: '1px solid #ebebeb' }}>
        <div className="flex items-center gap-3">
          {ep.isLive ? (
            <span className="inline-flex items-center gap-1.5 font-inter font-black text-[7px] tracking-[0.2em] uppercase px-2 py-0.5" style={{ background: '#111111', color: '#ffffff' }}>
              <Radio size={7} />LIVE REC
            </span>
          ) : (
            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: '#333333' }} />
          )}
          <span className="font-inter text-[8px] tracking-[0.4em] uppercase" style={{ color: '#888888' }}>
            {ep.isLive ? 'Past Live Session' : 'Latest Episode'}
          </span>
        </div>
        <span className="font-inter text-[9px]" style={{ color: '#aaaaaa' }}>{dateStr}</span>
      </div>

      <div className="grid md:grid-cols-[1fr_1.1fr]">

        <div className="relative flex flex-col justify-between p-5 sm:p-8 md:p-10 overflow-hidden" style={{ borderRight: '1px solid #ebebeb', borderBottom: '1px solid #ebebeb' }}>
          <span className="absolute left-5 top-3 font-playfair select-none pointer-events-none leading-none" style={{ fontSize: '8rem', color: '#f0f0f0', lineHeight: 0.75 }} aria-hidden="true">"</span>

          {hasEpNum && (
            <span className="absolute right-6 bottom-6 font-inter font-black select-none pointer-events-none leading-none" style={{ fontSize: '8rem', color: '#f2f2f2', letterSpacing: '-0.05em' }} aria-hidden="true">
              {String(ep.episode).padStart(2, '0')}
            </span>
          )}

          <div className="relative">
            <div className="flex items-center flex-wrap gap-2.5 mb-7">
              {hasEpNum && (
                <>
                  <span className="font-inter font-semibold text-[9px] tracking-[0.35em] uppercase" style={{ color: '#888888' }}>
                    EP {String(ep.episode).padStart(2, '0')}
                  </span>
                  <span className="w-4 h-px" style={{ background: '#d5d5d5' }} />
                </>
              )}
              {ep.category && (
                <span className="font-inter text-[8px] tracking-[0.22em] uppercase px-2.5 py-1" style={{ border: '1px solid #d0d0d0', color: '#666666' }}>
                  {ep.category}
                </span>
              )}
            </div>

            <h3 className="font-playfair leading-snug mb-5" style={{ fontSize: 'clamp(1.3rem, 2.4vw, 1.9rem)', color: '#111111' }}>
              {ep.title}
            </h3>

            {ep.description && (
              <p className="font-inter text-[14px] leading-relaxed line-clamp-4" style={{ color: '#555555' }}>
                {ep.description}
              </p>
            )}
          </div>

          <div className="relative flex items-center gap-4 pt-6 mt-6" style={{ borderTop: '1px solid #ebebeb' }}>
            {ep.duration && (
              <span className="font-inter text-[11px]" style={{ color: '#888888' }}>{ep.duration}</span>
            )}
            {ep.duration && <span style={{ color: '#d0d0d0' }}>·</span>}
            <span className="font-inter text-[11px]" style={{ color: '#aaaaaa' }}>Free to listen</span>
            {ep.isLive && ep.originalViewers && (
              <>
                <span style={{ color: '#d0d0d0' }}>·</span>
                <span className="font-inter text-[11px]" style={{ color: '#aaaaaa' }}>{ep.originalViewers} originally</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center p-5 sm:p-8 md:p-10">
          <div className="w-full">
            <AudioPlayer
              src={ep.audioSrc}
              title={ep.title}
              episodeId={ep.id}
              episode={ep.episode}
              category={ep.category}
              isLive={ep.isLive}
              variant="light"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
