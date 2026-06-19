export interface Episode {
  id: string
  episode: number | null
  title: string
  description: string
  duration: string
  date: string
  audioSrc: string
  category: string
  isLive: boolean
  originalViewers?: string
  status?: 'published' | 'scheduled' | 'draft'
  publishAt?: string
}

export const WAVEFORM_BARS = [22, 40, 62, 80, 52, 88, 68, 42, 76, 92, 58, 48, 84, 72, 44, 28, 62, 82, 54, 38, 72, 88, 64, 50, 78, 94, 58, 44, 72, 52, 38, 66, 82, 72, 54, 44, 62, 78, 48, 68]
