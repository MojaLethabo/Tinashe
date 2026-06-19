'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { WAVEFORM_BARS } from '@/lib/episodes'

interface AudioPlayerProps {
  src: string
  title: string
  episodeId?: string
  episode?: number | null
  isLive?: boolean
  category?: string
  variant?: 'light' | 'dark'
}

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

function ping(episodeId: string, type: 'play' | 'progress', seconds?: number) {
  const body = JSON.stringify({ episodeId, type, seconds })
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {}
}

export default function AudioPlayer({
  src, title, episodeId, episode, isLive, category, variant = 'light',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)

  const lastTimeRef = useRef(0)
  const accumulatedRef = useRef(0)
  const playCountedRef = useRef(false)
  const isDark = variant === 'dark'

  useEffect(() => {
    return () => {
      if (episodeId && accumulatedRef.current > 2) {
        const body = JSON.stringify({ episodeId, type: 'progress', seconds: accumulatedRef.current })
        try { navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' })) } catch {}
      }
    }
  }, [episodeId])

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const now = audio.currentTime
    setCurrentTime(now)
    if (!episodeId) { lastTimeRef.current = now; return }
    const delta = now - lastTimeRef.current
    if (delta > 0 && delta < 2) {
      accumulatedRef.current += delta
      if (!playCountedRef.current && accumulatedRef.current > 3) {
        playCountedRef.current = true
        ping(episodeId, 'play')
      }
      if (accumulatedRef.current >= 15) {
        ping(episodeId, 'progress', accumulatedRef.current)
        accumulatedRef.current = 0
      }
    }
    lastTimeRef.current = now
  }, [episodeId])

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    playing ? a.pause() : a.play().catch(() => {})
    setPlaying(!playing)
  }, [playing])

  const seekByPct = (clientX: number, rect: DOMRect) => {
    if (!audioRef.current || !duration) return
    audioRef.current.currentTime = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration
  }

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    setMuted(v === 0)
    if (audioRef.current) audioRef.current.volume = v
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    if (muted) { audioRef.current.volume = volume || 0.8; setMuted(false) }
    else { audioRef.current.volume = 0; setMuted(true) }
  }

  const skip = (delta: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + delta))
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const playedIndex = Math.floor((progressPct / 100) * WAVEFORM_BARS.length)

  const T = {
    label: isDark ? 'text-white/30' : 'text-black/30',
    labelFaint: isDark ? 'text-white/15' : 'text-black/15',
    title: isDark ? 'text-white' : 'text-black',
    muted: isDark ? 'text-white/40' : 'text-black/40',
    accent: '#ffffff',
    accentText: isDark ? 'text-white/60' : 'text-black/60',
    waveUnplayed: isDark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.09)',
    wavePlayedA: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.85)',
    wavePlayedB: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    trackBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    ctrl: isDark ? 'text-white/28 hover:text-white' : 'text-black/30 hover:text-black',
    thumbColor: isDark ? '#ffffff' : '#111111',
    volFill: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.7)',
    volTrack: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.09)',
  }

  const playBtnClass = playing
    ? (isDark
        ? 'bg-white border-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.15)]'
        : 'bg-black border-black text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)]')
    : (isDark
        ? 'border-white/20 text-white/60 hover:border-white/50 hover:bg-white/8 hover:text-white'
        : 'border-black/18 text-black/50 hover:border-black hover:bg-black hover:text-white')

  const volBg = `linear-gradient(to right, ${T.volFill} ${(muted ? 0 : volume) * 100}%, ${T.volTrack} ${(muted ? 0 : volume) * 100}%)`

  return (
    <div className="space-y-5">
      <audio
        ref={audioRef}
        src={src || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />

      {/* Status row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isLive && (
            <span
              className="text-[7px] font-black tracking-[0.2em] uppercase px-2 py-0.5"
              style={{ background: isDark ? '#ffffff' : '#111111', color: isDark ? '#111111' : '#ffffff' }}
            >
              ● REC
            </span>
          )}
          {!isLive && episode != null && (
            <span className={`text-[9px] tracking-[0.3em] uppercase font-inter font-semibold ${T.label}`}>
              EP {String(episode).padStart(2, '0')}
            </span>
          )}
          {category && episode != null && (
            <span className={`text-[9px] font-inter ${T.labelFaint}`}>· {category}</span>
          )}
        </div>

        {playing ? (
          <span className={`flex items-center gap-1.5 text-[9px] font-inter font-medium ${T.accentText}`}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
              style={{ background: T.accent }}
            />
            Now Playing
          </span>
        ) : (
          <span className={`text-[8px] font-inter tracking-[0.22em] uppercase ${T.labelFaint}`}>Paused</span>
        )}
      </div>

      {/* Title */}
      {title && (
        <p className={`font-playfair text-[1.15rem] leading-snug ${T.title}`}>{title}</p>
      )}

      {/* Waveform */}
      <div
        className="flex items-end gap-[2px] h-11 cursor-pointer select-none group"
        onClick={e => seekByPct(e.clientX, e.currentTarget.getBoundingClientRect())}
        title="Click to seek"
      >
        {WAVEFORM_BARS.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-[1px] transition-opacity duration-75 group-hover:opacity-75"
            style={{
              height: `${h}%`,
              background: i < playedIndex
                ? `linear-gradient(to top, ${T.wavePlayedA}, ${T.wavePlayedB})`
                : T.waveUnplayed,
            }}
          />
        ))}
      </div>

      {/* Progress + time */}
      <div className="space-y-2">
        <div
          className="relative h-[3px] rounded-full cursor-pointer group/bar"
          style={{ background: T.trackBg }}
          onClick={e => seekByPct(e.clientX, e.currentTarget.getBoundingClientRect())}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progressPct}%`, background: T.accent }}
          />
          <div
            className="absolute top-1/2 w-3.5 h-3.5 rounded-full -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{ left: `${progressPct}%`, background: isDark ? '#fff' : '#111', boxShadow: '0 0 8px rgba(0,0,0,0.2)' }}
          />
        </div>
        <div className={`flex justify-between text-[10px] font-inter tabular-nums ${T.label}`}>
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-5">
          <button
            onClick={() => skip(-15)}
            className={`flex items-center gap-1 text-[9px] font-inter font-medium transition-colors ${T.ctrl}`}
            title="Back 15s"
          >
            <SkipBack size={13} strokeWidth={2.5} />
            <span>15</span>
          </button>

          <button
            onClick={toggle}
            className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${playBtnClass}`}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} className="ml-px" />}
          </button>

          <button
            onClick={() => skip(15)}
            className={`flex items-center gap-1 text-[9px] font-inter font-medium transition-colors ${T.ctrl}`}
            title="Forward 15s"
          >
            <span>15</span>
            <SkipForward size={13} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={toggleMute} className={`transition-colors ${T.ctrl}`} title={muted ? 'Unmute' : 'Mute'}>
            {muted ? <VolumeX size={14} strokeWidth={2} /> : <Volume2 size={14} strokeWidth={2} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.01}
            value={muted ? 0 : volume}
            onChange={changeVolume}
            aria-label="Volume"
            className="w-20"
            style={{ background: volBg, '--range-thumb': T.thumbColor } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  )
}
