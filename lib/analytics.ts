export { getAllStats } from './api'
export type { EpisodeStats } from './api'

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

export async function recordPlay(episodeId: string): Promise<void> {
  await fetch(`${BASE}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'play', episodeId }),
    cache: 'no-store',
  }).catch(() => {})
}

export async function recordProgress(episodeId: string, seconds: number): Promise<void> {
  await fetch(`${BASE}/analytics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'progress', episodeId, seconds }),
    cache: 'no-store',
  }).catch(() => {})
}
