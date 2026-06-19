import type { Metadata } from 'next'
import EpisodeForm from '@/components/admin/EpisodeForm'

export const metadata: Metadata = { title: 'New Episode | ZARD Admin' }

export default function NewEpisodePage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>New Episode</h1>
        <p className="text-sm font-inter mt-1" style={{ color: '#888888' }}>
          Fill in the details and upload the recording.
        </p>
      </div>
      <EpisodeForm />
    </div>
  )
}
