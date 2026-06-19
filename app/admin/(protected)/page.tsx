import Link from 'next/link'
import { getAllEpisodes, getAllLiveSessions, deleteEpisode, getAllStats, getPageViews } from '@/lib/api'
import { Plus, Pencil, Trash2, Radio, Headphones, BarChart2, CalendarClock, FileText, Globe } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Episode } from '@/lib/episodes'

function fmtSeconds(s: number): string {
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

function parseDurationSecs(d: string): number {
  const p = d.split(':').map(Number)
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2]
  if (p.length === 2) return p[0] * 60 + p[1]
  return 0
}

function getEffectiveStatus(ep: Episode): 'live' | 'scheduled' | 'draft' {
  const status = ep.status ?? 'published'
  if (status === 'draft') return 'draft'
  if (status === 'scheduled' && ep.publishAt && new Date(ep.publishAt) > new Date()) return 'scheduled'
  return 'live'
}

function StatusBadge({ ep }: { ep: Episode }) {
  const s = getEffectiveStatus(ep)
  if (s === 'draft') return (
    <span className="inline-flex items-center gap-1 text-[8px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 font-inter"
      style={{ border: '1px solid #d0d0d0', color: '#888888' }}>
      <FileText size={8} />Draft
    </span>
  )
  if (s === 'scheduled') {
    const d = ep.publishAt ? new Date(ep.publishAt) : null
    return (
      <span
        className="inline-flex items-center gap-1 text-[8px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 font-inter"
        style={{ background: '#fffbeb', border: '1px solid #f59e0b', color: '#b45309' }}
        title={d?.toLocaleString()}
      >
        <CalendarClock size={8} />
        {d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Scheduled'}
      </span>
    )
  }
  return null
}

async function handleDelete(id: string) {
  'use server'
  await deleteEpisode(id)
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/podcast')
  redirect('/admin')
}

export default async function AdminDashboard() {
  const [episodes, liveSessions, stats, pageViews] = await Promise.all([
    getAllEpisodes(),
    getAllLiveSessions(),
    getAllStats(),
    getPageViews(),
  ])

  const liveEpisodes = episodes.filter(e => getEffectiveStatus(e) === 'live')
  const scheduledAll = [
    ...episodes.filter(e => getEffectiveStatus(e) === 'scheduled'),
    ...liveSessions.filter(e => getEffectiveStatus(e) === 'scheduled'),
  ].sort((a, b) => new Date(a.publishAt!).getTime() - new Date(b.publishAt!).getTime())

  const totalPlays = Object.values(stats).reduce((sum, s) => sum + s.plays, 0)
  const totalSeconds = Object.values(stats).reduce((sum, s) => sum + s.secondsListened, 0)

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Dashboard</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: '#888888' }}>
            {liveEpisodes.length} published · {scheduledAll.length} scheduled
          </p>
        </div>
        <Link
          href="/admin/episodes/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-inter font-bold tracking-[0.15em] uppercase transition-opacity hover:opacity-85"
          style={{ background: '#111111', color: '#ffffff' }}
        >
          <Plus size={12} /> New Episode
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { icon: <Globe size={14} />, value: pageViews.site, label: 'Site Visits' },
          { icon: <Headphones size={14} />, value: totalPlays, label: 'Total Plays' },
          { icon: <BarChart2 size={14} />, value: fmtSeconds(totalSeconds), label: 'Total Listened' },
          { icon: <CalendarClock size={14} />, value: scheduledAll.length, label: 'Scheduled' },
          { icon: null, value: liveEpisodes.length, label: 'Live Episodes' },
        ].map(({ icon, value, label }) => (
          <div key={label} className="px-5 py-5" style={{ background: '#ffffff', border: '1px solid #e0e0e0' }}>
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-inter" style={{ color: '#999999' }}>
              {icon}
              <span className="tracking-[0.15em] uppercase">{label}</span>
            </div>
            <p className="font-inter font-black text-2xl" style={{ color: '#111111' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Scheduled queue */}
      {scheduledAll.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock size={14} style={{ color: '#b45309' }} />
            <h2 className="font-inter font-semibold text-sm tracking-wide" style={{ color: '#555555' }}>Scheduled Queue</h2>
            <span
              className="text-[9px] tracking-widest uppercase font-inter px-2 py-0.5"
              style={{ color: '#b45309', background: '#fffbeb', border: '1px solid #f59e0b' }}
            >
              {scheduledAll.length} pending
            </span>
          </div>
          <div className="overflow-hidden" style={{ border: '1px solid #f59e0b', background: '#fffbeb' }}>
            {scheduledAll.map((ep, i) => (
              <div
                key={ep.id}
                className="flex items-center gap-4 px-5 py-4"
                style={i > 0 ? { borderTop: '1px solid #fde68a' } : {}}
              >
                <CalendarClock size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-medium truncate" style={{ color: '#111111' }}>{ep.title}</p>
                  <p className="text-[10px] font-inter mt-0.5" style={{ color: '#888888' }}>
                    Publishes{' '}
                    {ep.publishAt
                      ? new Date(ep.publishAt).toLocaleDateString('en-GB', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        }) +
                        ' at ' +
                        new Date(ep.publishAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/admin/episodes/${ep.id}`}
                    className="w-8 h-8 flex items-center justify-center transition-all hover:text-[#111111]"
                    style={{ color: '#aaaaaa' }}
                  >
                    <Pencil size={13} />
                  </Link>
                  <form action={handleDelete.bind(null, ep.id)}>
                    <button type="submit" className="w-8 h-8 flex items-center justify-center transition-all hover:text-red-600"
                      style={{ color: '#aaaaaa' }}>
                      <Trash2 size={13} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Episodes */}
      <EpisodeTable title="Episodes" items={episodes} stats={stats} showLiveTag={false} onDelete={handleDelete} />

      {/* Live Sessions */}
      <EpisodeTable title="Live Sessions" items={liveSessions} stats={stats} showLiveTag onDelete={handleDelete} addLink="/admin/episodes/new?live=1" />
    </div>
  )
}

function EpisodeTable({
  title, items, stats, showLiveTag, onDelete, addLink,
}: {
  title: string
  items: Episode[]
  stats: Record<string, { plays: number; secondsListened: number }>
  showLiveTag: boolean
  onDelete: (id: string) => Promise<void>
  addLink?: string
}) {
  function fmtSeconds(s: number): string {
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s / 60)}m`
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  }

  function parseDurationSecs(d: string): number {
    const p = d.split(':').map(Number)
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2]
    if (p.length === 2) return p[0] * 60 + p[1]
    return 0
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {showLiveTag && <Radio size={14} style={{ color: '#888888' }} />}
          <h2 className="font-inter font-semibold text-sm tracking-wide" style={{ color: '#555555' }}>{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] tracking-widest uppercase font-inter" style={{ color: '#aaaaaa' }}>{items.length} total</span>
          {addLink && (
            <Link href={addLink} className="text-[9px] tracking-[0.15em] uppercase font-inter transition-colors hover:text-[#111111]"
              style={{ color: '#777777' }}>
              + Add session
            </Link>
          )}
        </div>
      </div>
      <div className="overflow-hidden" style={{ border: '1px solid #e0e0e0', background: '#ffffff' }}>
        {items.length === 0 ? (
          <p className="p-6 text-sm font-inter" style={{ color: '#888888' }}>No {title.toLowerCase()} yet.</p>
        ) : (
          items.map((ep, i) => (
            <div
              key={ep.id}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#f9f9f9]"
              style={i > 0 ? { borderTop: '1px solid #ebebeb' } : {}}
            >
              {showLiveTag ? (
                <span className="inline-flex items-center gap-1 text-[7px] font-black tracking-[0.1em] uppercase px-1.5 py-0.5 flex-shrink-0"
                  style={{ background: '#111111', color: '#ffffff' }}>
                  <Radio size={6} />LIVE
                </span>
              ) : (
                <span className="text-[9px] font-inter w-8 flex-shrink-0 font-semibold" style={{ color: '#cccccc' }}>
                  {ep.episode ? String(ep.episode).padStart(2, '0') : '—'}
                </span>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-inter text-sm font-medium truncate" style={{ color: '#111111' }}>{ep.title}</p>
                  <StatusBadge ep={ep} />
                </div>
                <p className="text-[10px] font-inter" style={{ color: '#888888' }}>
                  {ep.category} · {ep.duration} ·{' '}
                  {new Date(ep.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 text-[9px] font-inter" style={{ color: '#aaaaaa' }}>
                {stats[ep.id] ? (
                  <>
                    <span>{stats[ep.id].plays} plays</span>
                    <span style={{ color: '#dddddd' }}>·</span>
                    <span>{fmtSeconds(Math.round(stats[ep.id].secondsListened / Math.max(1, stats[ep.id].plays)))} avg</span>
                    {parseDurationSecs(ep.duration) > 0 && (
                      <>
                        <span style={{ color: '#dddddd' }}>·</span>
                        <span>
                          {Math.round(
                            Math.min(100,
                              (stats[ep.id].secondsListened / Math.max(1, stats[ep.id].plays)) /
                              parseDurationSecs(ep.duration) * 100)
                          )}%
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#cccccc' }}>no plays yet</span>
                )}
              </div>

              {ep.audioSrc && (
                <span className="text-[8px] tracking-[0.1em] uppercase font-inter flex-shrink-0 px-2 py-0.5"
                  style={{ color: '#888888', border: '1px solid #d5d5d5' }}>
                  Audio ✓
                </span>
              )}

              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/admin/episodes/${ep.id}`}
                  className="w-8 h-8 flex items-center justify-center transition-all hover:text-[#111111]"
                  style={{ color: '#aaaaaa' }}
                >
                  <Pencil size={13} />
                </Link>
                <form action={onDelete.bind(null, ep.id)}>
                  <button type="submit" className="w-8 h-8 flex items-center justify-center transition-all hover:text-red-600"
                    style={{ color: '#aaaaaa' }}>
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
