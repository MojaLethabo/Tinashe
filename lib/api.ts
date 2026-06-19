/**
 * Central API client — all data access goes through the Express backend.
 * Only called from Server Components and Server Actions (never from the browser).
 * INTERNAL_API_KEY is a server-only secret; it is never exposed to the client.
 */

import type { Episode }     from './episodes'
import type { BlogPost }    from './blog'
import type { Publication } from './publications'
import type { Comment }     from './comments'

const BASE         = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? ''

// =============================================================================
//  Base fetch helpers
// =============================================================================

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => String(res.status))
    throw new Error(`API ${init?.method ?? 'GET'} ${path} → ${res.status}: ${msg}`)
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

function withAdmin(init?: RequestInit): RequestInit {
  return { ...init, headers: { ...init?.headers, Authorization: `Bearer ${INTERNAL_KEY}` } }
}

async function apiAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  return apiFetch<T>(path, withAdmin(init))
}

// =============================================================================
//  Field mappers  (Supabase snake_case ↔ Next.js camelCase)
// =============================================================================

// ── Episodes ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEpisode(r: any): Episode {
  return {
    id:             r.id,
    episode:        r.episode_number ?? null,
    title:          r.title,
    description:    r.description ?? '',
    duration:       r.duration ?? '',
    date:           r.date,
    audioSrc:       r.audio_src ?? '',
    category:       r.category ?? '',
    isLive:         r.is_live ?? false,
    ...(r.original_viewers != null ? { originalViewers: r.original_viewers } : {}),
    status:         (r.status ?? 'published') as Episode['status'],
    ...(r.publish_at != null ? { publishAt: r.publish_at } : {}),
  }
}

export function toEpisodePayload(e: Partial<Episode>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (e.id             !== undefined) out.id               = e.id
  if (e.episode        !== undefined) out.episode_number   = e.episode
  if (e.title          !== undefined) out.title            = e.title
  if (e.description    !== undefined) out.description      = e.description
  if (e.duration       !== undefined) out.duration         = e.duration
  if (e.date           !== undefined) out.date             = e.date
  if (e.audioSrc       !== undefined) out.audio_src        = e.audioSrc
  if (e.category       !== undefined) out.category         = e.category
  if (e.isLive         !== undefined) out.is_live          = e.isLive
  if (e.originalViewers !== undefined) out.original_viewers = e.originalViewers
  if (e.status         !== undefined) out.status           = e.status
  if (e.publishAt      !== undefined) out.publish_at       = e.publishAt
  return out
}

// ── Blog posts ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBlogPost(r: any): BlogPost {
  return {
    id:       r.id,
    slug:     r.slug,
    title:    r.title,
    excerpt:  r.excerpt ?? '',
    content:  r.content ?? '',
    ...(r.image_url != null ? { imageUrl: r.image_url } : {}),
    author:   r.author ?? 'Innocent Tinashe Mutero',
    date:     r.date,
    tags:     Array.isArray(r.tags) ? r.tags : [],
    status:   (r.status ?? 'draft') as BlogPost['status'],
  }
}

export function toBlogPayload(p: Partial<BlogPost>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (p.id        !== undefined) out.id        = p.id
  if (p.slug      !== undefined) out.slug      = p.slug
  if (p.title     !== undefined) out.title     = p.title
  if (p.excerpt   !== undefined) out.excerpt   = p.excerpt
  if (p.content   !== undefined) out.content   = p.content
  if (p.imageUrl  !== undefined) out.image_url = p.imageUrl
  if (p.author    !== undefined) out.author    = p.author
  if (p.date      !== undefined) out.date      = p.date
  if (p.tags      !== undefined) out.tags      = p.tags
  if (p.status    !== undefined) out.status    = p.status
  return out
}

// ── Publications ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPublication(r: any): Publication {
  return {
    id:      r.id,
    title:   r.title,
    authors: r.authors,
    year:    r.year ?? '',
    type:    r.type as Publication['type'],
    venue:   r.venue ?? '',
    ...(r.abstract    != null ? { abstract:   r.abstract }        : {}),
    ...(r.scholar_url != null ? { scholarUrl: r.scholar_url }     : {}),
    ...(r.pdf_url     != null ? { pdfUrl:     r.pdf_url }         : {}),
    ...(r.doi         != null ? { doi:        r.doi }             : {}),
    order: r.sort_order ?? 0,
  }
}

export function toPublicationPayload(p: Partial<Publication>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  if (p.id         !== undefined) out.id         = p.id
  if (p.title      !== undefined) out.title      = p.title
  if (p.authors    !== undefined) out.authors    = p.authors
  if (p.year       !== undefined) out.year       = p.year
  if (p.type       !== undefined) out.type       = p.type
  if (p.venue      !== undefined) out.venue      = p.venue
  if (p.abstract   !== undefined) out.abstract   = p.abstract
  if (p.scholarUrl !== undefined) out.scholar_url = p.scholarUrl
  if (p.pdfUrl     !== undefined) out.pdf_url    = p.pdfUrl
  if (p.doi        !== undefined) out.doi        = p.doi
  if (p.order      !== undefined) out.sort_order = p.order
  return out
}

// ── Comments ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComment(r: any): Comment {
  return {
    id:         r.id,
    targetId:   r.target_id,
    targetType: r.target_type as Comment['targetType'],
    ...(r.parent_id != null ? { parentId: r.parent_id } : {}),
    name:    r.name,
    comment: r.comment,
    date:    r.date,
  }
}

// =============================================================================
//  Episodes
// =============================================================================

export async function getEpisodes(): Promise<Episode[]> {
  const data = await apiFetch<unknown[]>('/episodes')
  return data.map(mapEpisode)
}

export async function getLiveSessions(): Promise<Episode[]> {
  const data = await apiFetch<unknown[]>('/episodes/live')
  return data.map(mapEpisode)
}

export async function getAllEpisodes(): Promise<Episode[]> {
  const data = await apiAdmin<unknown[]>('/episodes/all')
  return data.filter((r: any) => !r.is_live).map(mapEpisode)
}

export async function getAllLiveSessions(): Promise<Episode[]> {
  const data = await apiAdmin<unknown[]>('/episodes/all')
  return data.filter((r: any) => r.is_live).map(mapEpisode)
}

export async function getEpisodeById(id: string): Promise<Episode | null> {
  // Admin: fetch all and find by id (bypasses published-only filter)
  const data = await apiAdmin<unknown[]>('/episodes/all')
  const row = (data as any[]).find(r => r.id === id)
  return row ? mapEpisode(row) : null
}

export async function createEpisode(episode: Episode): Promise<void> {
  await apiAdmin('/episodes', {
    method: 'POST',
    body: JSON.stringify(toEpisodePayload(episode)),
  })
}

export async function updateEpisode(id: string, data: Partial<Episode>): Promise<boolean> {
  try {
    await apiAdmin(`/episodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toEpisodePayload(data)),
    })
    return true
  } catch {
    return false
  }
}

export async function deleteEpisode(id: string): Promise<boolean> {
  try {
    await apiAdmin(`/episodes/${id}`, { method: 'DELETE' })
    return true
  } catch {
    return false
  }
}

// =============================================================================
//  Blog posts
// =============================================================================

export async function getBlogPosts(): Promise<BlogPost[]> {
  const data = await apiFetch<unknown[]>('/blog')
  return data.map(mapBlogPost)
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const data = await apiAdmin<unknown[]>('/blog/all')
  return data.map(mapBlogPost)
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const data = await apiFetch<unknown>(`/blog/${slug}`)
    return mapBlogPost(data)
  } catch {
    return null
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  // Admin: fetch all and find by id
  const data = await apiAdmin<unknown[]>('/blog/all')
  const row = (data as any[]).find(r => r.id === id)
  return row ? mapBlogPost(row) : null
}

export async function createBlogPost(post: BlogPost): Promise<void> {
  await apiAdmin('/blog', {
    method: 'POST',
    body: JSON.stringify(toBlogPayload(post)),
  })
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<boolean> {
  try {
    await apiAdmin(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toBlogPayload(data)),
    })
    return true
  } catch {
    return false
  }
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  try {
    await apiAdmin(`/blog/${id}`, { method: 'DELETE' })
    return true
  } catch {
    return false
  }
}

// =============================================================================
//  Publications
// =============================================================================

export async function getPublications(): Promise<Publication[]> {
  const data = await apiFetch<unknown[]>('/publications')
  return data.map(mapPublication)
}

export async function getPublicationById(id: string): Promise<Publication | null> {
  try {
    const data = await apiFetch<unknown>(`/publications/${id}`)
    return mapPublication(data)
  } catch {
    return null
  }
}

export async function createPublication(pub: Publication): Promise<void> {
  await apiAdmin('/publications', {
    method: 'POST',
    body: JSON.stringify(toPublicationPayload(pub)),
  })
}

export async function updatePublication(id: string, data: Partial<Publication>): Promise<boolean> {
  try {
    await apiAdmin(`/publications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toPublicationPayload(data)),
    })
    return true
  } catch {
    return false
  }
}

export async function deletePublication(id: string): Promise<boolean> {
  try {
    await apiAdmin(`/publications/${id}`, { method: 'DELETE' })
    return true
  } catch {
    return false
  }
}

// =============================================================================
//  Comments
// =============================================================================

export async function getCommentsByTarget(targetId: string): Promise<Comment[]> {
  const data = await apiFetch<unknown[]>(`/comments?targetId=${encodeURIComponent(targetId)}`)
  return data.map(mapComment)
}

export async function getAllComments(): Promise<Comment[]> {
  const data = await apiAdmin<unknown[]>('/comments/all')
  return data.map(mapComment)
}

export async function createComment(comment: Comment): Promise<void> {
  await apiFetch('/comments', {
    method: 'POST',
    body: JSON.stringify({
      target_id:   comment.targetId,
      target_type: comment.targetType,
      parent_id:   comment.parentId,
      name:        comment.name,
      comment:     comment.comment,
    }),
  })
}

export async function deleteComment(id: string): Promise<boolean> {
  try {
    await apiAdmin(`/comments/${id}`, { method: 'DELETE' })
    return true
  } catch {
    return false
  }
}

// =============================================================================
//  Analytics
// =============================================================================

export type EpisodeStats = Record<string, { plays: number; secondsListened: number }>

export async function getAllStats(): Promise<EpisodeStats> {
  return apiAdmin<EpisodeStats>('/analytics')
}

// =============================================================================
//  Page views
// =============================================================================

export interface PageViewData {
  site: number
  blog: Record<string, number>
}

export async function getPageViews(): Promise<PageViewData> {
  return apiAdmin<PageViewData>('/pageviews')
}

export async function recordSiteView(): Promise<void> {
  await apiFetch('/pageviews', {
    method: 'POST',
    body: JSON.stringify({ type: 'site' }),
  })
}

export async function recordBlogView(slug: string): Promise<void> {
  await apiFetch('/pageviews', {
    method: 'POST',
    body: JSON.stringify({ type: 'blog', slug }),
  })
}
