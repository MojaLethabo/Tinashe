export type PublicationType = 'article' | 'chapter' | 'under-review'

export interface Publication {
  id: string
  title: string
  authors: string
  year: string
  type: PublicationType
  venue: string
  abstract?: string
  scholarUrl?: string
  pdfUrl?: string
  doi?: string
  order?: number
}
