import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getEpisodeById } from '@/lib/api'
import EpisodeForm from '@/components/admin/EpisodeForm'

export const metadata: Metadata = { title: 'Edit Episode | ZARD Admin' }

export default async function EditEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const episode = await getEpisodeById(id)
  if (!episode) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[9px] tracking-[0.25em] uppercase font-inter mb-1" style={{ color: '#999999' }}>
          {episode.isLive ? 'Live Session' : `Episode ${episode.episode ?? '—'}`}
        </p>
        <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Edit Episode</h1>
      </div>
      <EpisodeForm episode={episode} />
    </div>
  )
}
