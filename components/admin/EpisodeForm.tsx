'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Episode } from '@/lib/episodes'
import { Upload, Loader2, Music, Clock, Globe, CalendarClock, FileText } from 'lucide-react'

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function readAudioDuration(file: File): Promise<string> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      const dur = isFinite(audio.duration) ? formatDuration(audio.duration) : ''
      URL.revokeObjectURL(url)
      resolve(dur)
    })
    audio.addEventListener('error', () => { URL.revokeObjectURL(url); resolve('') })
  })
}

function toIso(local: string): string {
  if (!local) return ''
  return new Date(local).toISOString()
}

function toLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface Props {
  episode?: Episode
}

const inputStyle = {
  background: '#ffffff',
  border: '1px solid #d5d5d5',
  color: '#333333',
}

const inputCls =
  'w-full text-sm px-4 py-2.5 focus:outline-none transition-all font-inter placeholder:text-[#cccccc] focus:border-[#999999]'

const labelCls = 'block text-[10px] tracking-[0.2em] uppercase mb-1.5 font-inter'

type Status = 'published' | 'scheduled' | 'draft'

const STATUS_OPTIONS: { value: Status; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: 'published',
    label: 'Publish Now',
    icon: <Globe size={13} strokeWidth={2} />,
    desc: 'Visible to listeners immediately',
  },
  {
    value: 'scheduled',
    label: 'Schedule',
    icon: <CalendarClock size={13} strokeWidth={2} />,
    desc: 'Goes live at a specific date & time',
  },
  {
    value: 'draft',
    label: 'Draft',
    icon: <FileText size={13} strokeWidth={2} />,
    desc: 'Saved privately, not visible yet',
  },
]

export default function EpisodeForm({ episode }: Props) {
  const router = useRouter()
  const isEdit = !!episode

  const [form, setForm] = useState({
    title: episode?.title ?? '',
    description: episode?.description ?? '',
    duration: episode?.duration ?? '',
    date: episode?.date ?? new Date().toISOString().split('T')[0],
    audioSrc: episode?.audioSrc ?? '',
    category: episode?.category ?? '',
    episodeNum: episode?.episode?.toString() ?? '',
    isLive: episode?.isLive ?? false,
    originalViewers: episode?.originalViewers ?? '',
    status: (episode?.status ?? 'published') as Status,
    publishAt: episode?.publishAt ? toLocal(episode.publishAt) : '',
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [durationAuto, setDurationAuto] = useState(!!episode?.duration)
  const fileRef = useRef<HTMLInputElement>(null)

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const detectedDuration = await readAudioDuration(file)
    if (detectedDuration) {
      setForm(prev => ({ ...prev, duration: detectedDuration }))
      setDurationAuto(true)
    }
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm(prev => ({ ...prev, audioSrc: data.url }))
      } else {
        setError(data.error ?? 'Upload failed')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.status === 'scheduled' && !form.publishAt) {
      setError('Please pick a date and time for the scheduled release.')
      return
    }
    setSaving(true)
    setError('')

    const payload: Episode = {
      id: episode?.id ?? Date.now().toString(),
      title: form.title,
      description: form.description,
      duration: form.duration,
      date: form.date,
      audioSrc: form.audioSrc,
      category: form.category,
      episode: form.episodeNum ? parseInt(form.episodeNum) : null,
      isLive: form.isLive,
      originalViewers: form.originalViewers || undefined,
      status: form.status,
      publishAt: form.status === 'scheduled' ? toIso(form.publishAt) : undefined,
    }

    const url = isEdit ? `/api/admin/episodes/${episode!.id}` : '/api/admin/episodes'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Save failed')
      }
    } catch {
      setError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const submitLabel =
    form.status === 'scheduled' ? 'Schedule Episode'
    : form.status === 'draft'   ? 'Save Draft'
    : isEdit                    ? 'Save Changes'
    : 'Publish Episode'

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <p className="text-red-600 text-sm font-inter px-4 py-3"
          style={{ border: '1px solid #fca5a5', background: '#fef2f2' }}>
          {error}
        </p>
      )}

      {/* ── Publish Status ── */}
      <div>
        <p className={labelCls} style={{ color: '#777777' }}>Publish Status</p>
        <div className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(({ value, label, icon, desc }) => {
            const active = form.status === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, status: value }))}
                className="flex flex-col items-start gap-1.5 px-4 py-3.5 text-left transition-all"
                style={active
                  ? { border: '1px solid #111111', background: '#111111', color: '#ffffff' }
                  : { border: '1px solid #d5d5d5', background: '#ffffff', color: '#777777' }}
              >
                <span className="flex items-center gap-1.5 text-[10px] font-inter font-bold tracking-[0.12em] uppercase">
                  {icon}{label}
                </span>
                <span className="text-[10px] font-inter leading-snug opacity-60">
                  {desc}
                </span>
              </button>
            )
          })}
        </div>

        {form.status === 'scheduled' && (
          <div className="mt-3 p-4" style={{ border: '1px solid #e0e0e0', background: '#f6f6f6' }}>
            <label className={labelCls} style={{ color: '#777777' }}>Publish Date &amp; Time</label>
            <input
              type="datetime-local"
              required
              value={form.publishAt}
              onChange={set('publishAt')}
              min={new Date().toISOString().slice(0, 16)}
              className={inputCls}
              style={inputStyle}
            />
            {form.publishAt && (
              <p className="mt-2 text-[10px] font-inter flex items-center gap-1.5" style={{ color: '#888888' }}>
                <Clock size={10} />
                Will publish on{' '}
                {new Date(form.publishAt).toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}{' '}
                at{' '}
                {new Date(form.publishAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Core fields ── */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className={labelCls} style={{ color: '#777777' }}>Title</label>
          <input type="text" required value={form.title} onChange={set('title')} placeholder="Episode title" className={inputCls} style={inputStyle} />
        </div>

        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Category</label>
          <input type="text" required value={form.category} onChange={set('category')} placeholder="Arts for Social Change" className={inputCls} style={inputStyle} />
        </div>

        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Episode Date</label>
          <input type="date" required value={form.date} onChange={set('date')} className={inputCls} style={inputStyle} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`${labelCls} mb-0`} style={{ color: '#777777' }}>Duration</label>
            {durationAuto && form.duration && (
              <span className="flex items-center gap-1 text-[9px] font-inter" style={{ color: '#888888' }}>
                <Clock size={9} />auto-detected
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={form.duration}
            onChange={e => { set('duration')(e); setDurationAuto(false) }}
            placeholder="Upload audio to auto-detect"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelCls} style={{ color: '#777777' }}>Episode Number</label>
          <input type="number" min="1" value={form.episodeNum} onChange={set('episodeNum')} placeholder="Leave blank for live sessions" className={inputCls} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className={labelCls} style={{ color: '#777777' }}>Description</label>
        <textarea required rows={4} value={form.description} onChange={set('description')} placeholder="Episode description" className={`${inputCls} resize-none`} style={inputStyle} />
      </div>

      {/* ── Audio ── */}
      <div>
        <label className={labelCls} style={{ color: '#777777' }}>Audio Recording</label>
        <div className="space-y-3">
          <input type="text" value={form.audioSrc} onChange={set('audioSrc')} placeholder="/recordings/file.mp3 or https://…" className={inputCls} style={inputStyle} />
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-inter" style={{ color: '#bbbbbb' }}>or</span>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-inter tracking-[0.15em] uppercase transition-all disabled:opacity-40"
              style={{ border: '1px solid #d5d5d5', background: '#ffffff', color: '#666666' }}
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? 'Uploading…' : 'Upload Audio File'}
            </button>
            <input ref={fileRef} type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
            {form.audioSrc && !uploading && (
              <span className="flex items-center gap-1.5 text-[10px] font-inter" style={{ color: '#888888' }}>
                <Music size={10} />{form.audioSrc.split('/').pop()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Live session ── */}
      <div className="pt-6 space-y-5" style={{ borderTop: '1px solid #e0e0e0' }}>
        <div className="flex items-center gap-3">
          <input
            id="isLive"
            type="checkbox"
            checked={form.isLive}
            onChange={e => setForm(prev => ({ ...prev, isLive: e.target.checked }))}
            className="w-4 h-4 accent-[#111111]"
          />
          <label htmlFor="isLive" className="text-sm font-inter cursor-pointer" style={{ color: '#555555' }}>
            This is a live session recording
          </label>
        </div>
        {form.isLive && (
          <div>
            <label className={labelCls} style={{ color: '#777777' }}>Original Viewers (optional)</label>
            <input type="text" value={form.originalViewers} onChange={set('originalViewers')} placeholder="142 live" className={inputCls} style={inputStyle} />
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 px-8 py-3 text-[10px] font-inter font-bold tracking-[0.18em] uppercase transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ background: '#111111', color: '#ffffff' }}
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-[10px] font-inter tracking-[0.15em] uppercase transition-colors hover:text-[#111111]"
          style={{ color: '#888888' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
