'use client'
import { useState } from 'react'
import { Play, Pause, Radio, ChevronDown } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import { type Episode, WAVEFORM_BARS } from '@/lib/episodes'
import CommentSection from './CommentSection'

function EpisodeRow({ ep, isActive, onToggle }: { ep: Episode; isActive: boolean; onToggle: () => void }) {
  const playedBars = isActive ? Math.floor(WAVEFORM_BARS.length * 0.28) : 0

  return (
    <div
      className="relative transition-colors duration-150"
      style={{ borderBottom: '1px solid #e5e5e5', background: isActive ? '#f9f9f9' : '#ffffff' }}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: '#333333' }} />
      )}

      {!ep.isLive && ep.episode != null && (
        <span
          className="absolute right-6 top-1/2 -translate-y-1/2 font-inter font-black select-none pointer-events-none leading-none"
          style={{ fontSize: '5.5rem', color: '#f0f0f0', letterSpacing: '-0.04em' }}
          aria-hidden="true"
        >
          {String(ep.episode).padStart(2, '0')}
        </span>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-expanded={isActive}
        onClick={onToggle}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
        className={`relative flex items-start gap-5 p-6 cursor-pointer select-none transition-colors ${isActive ? 'pl-8' : 'pl-6 hover:bg-[#fafafa]'}`}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-200 mt-0.5"
          style={isActive
            ? { background: '#111111', borderColor: '#111111', color: '#ffffff' }
            : { borderColor: '#cccccc', color: '#666666' }}
          aria-hidden="true"
        >
          {isActive ? <Pause size={13} strokeWidth={2.5} /> : <Play size={13} strokeWidth={2.5} className="ml-0.5" />}
        </div>

        <div className="flex-1 min-w-0 pr-2 sm:pr-8">
          <div className="flex items-center flex-wrap gap-2 mb-2.5">
            {ep.isLive ? (
              <>
                <span className="inline-flex items-center gap-1 font-inter font-black text-[7px] tracking-[0.18em] uppercase px-2 py-0.5" style={{ background: '#111111', color: '#ffffff' }}>
                  <Radio size={7} />LIVE REC
                </span>
                <span className="font-inter text-[9px]" style={{ color: '#888888' }}>
                  {new Date(ep.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {ep.originalViewers && (
                  <span className="font-inter text-[9px]" style={{ color: '#aaaaaa' }}>· {ep.originalViewers}</span>
                )}
              </>
            ) : (
              <>
                <span className="font-inter font-semibold text-[9px] tracking-[0.28em] uppercase" style={{ color: '#777777' }}>
                  EP {String(ep.episode).padStart(2, '0')}
                </span>
                <span style={{ color: '#cccccc' }}>·</span>
                <span className="font-inter text-[8px] tracking-wider uppercase px-2 py-0.5" style={{ border: '1px solid #cccccc', color: '#666666' }}>
                  {ep.category}
                </span>
              </>
            )}
          </div>

          <h3 className="font-playfair text-[1.05rem] leading-snug mb-2" style={{ color: '#111111' }}>{ep.title}</h3>
          <p className="font-inter text-[13px] leading-relaxed mb-4 line-clamp-2" style={{ color: '#555555' }}>{ep.description}</p>

          <div className="flex items-end gap-[2px] h-4 mb-3" aria-hidden="true">
            {WAVEFORM_BARS.slice(0, 32).map((h, i) => (
              <div key={i} className="flex-1 rounded-[1px]" style={{ height: `${h}%`, background: i < playedBars ? '#555555' : '#d8d8d8' }} />
            ))}
          </div>

          <div className="flex items-center gap-3 font-inter text-[10px]" style={{ color: '#888888' }}>
            <span>{ep.duration}</span>
            <span>·</span>
            <span>{new Date(ep.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <ChevronDown
          size={15}
          strokeWidth={2}
          className={`flex-shrink-0 mt-1 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`}
          style={{ color: '#aaaaaa' }}
        />
      </div>

      {isActive && (
        <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-5" style={{ borderTop: '1px solid #e5e5e5' }} onClick={e => e.stopPropagation()}>
          <AudioPlayer
            src={ep.audioSrc}
            title={ep.title}
            episodeId={ep.id}
            episode={ep.episode}
            isLive={ep.isLive}
            category={ep.category}
            variant="light"
          />
          <CommentSection targetId={ep.id} targetType="episode" />
        </div>
      )}
    </div>
  )
}

export default function PodcastList({ episodes }: { episodes: Episode[] }) {
  const [activeId, setActiveId] = useState<string>(episodes[0]?.id ?? '')
  const toggle = (id: string) => setActiveId(prev => prev === id ? '' : id)

  return (
    <div style={{ border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      {episodes.map(ep => (
        <EpisodeRow key={ep.id} ep={ep} isActive={activeId === ep.id} onToggle={() => toggle(ep.id)} />
      ))}
    </div>
  )
}
