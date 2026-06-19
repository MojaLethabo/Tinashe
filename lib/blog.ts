export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  imageUrl?: string
  author: string
  date: string
  tags: string[]
  status: 'published' | 'draft'
}
