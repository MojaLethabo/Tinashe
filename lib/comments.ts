export interface Comment {
  id: string
  targetId: string
  targetType: 'blog' | 'episode'
  parentId?: string
  name: string
  comment: string
  date: string
}
