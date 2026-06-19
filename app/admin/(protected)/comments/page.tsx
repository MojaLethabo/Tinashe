import { getAllComments, getAllBlogPosts, getAllEpisodes, deleteComment } from '@/lib/api'
import { revalidatePath } from 'next/cache'
import { Trash2, CornerDownRight, MessageSquare } from 'lucide-react'

async function handleDelete(id: string) {
  'use server'
  await deleteComment(id)
  revalidatePath('/admin/comments')
}

export default async function AdminCommentsPage() {
  const [comments, posts, episodes] = await Promise.all([
    getAllComments(),
    getAllBlogPosts(),
    getAllEpisodes(),
  ])

  // Build lookup maps for target titles
  const blogTitles = Object.fromEntries(posts.map(p => [p.slug, p.title]))
  const episodeTitles = Object.fromEntries(episodes.map(e => [e.id, e.title]))

  function targetLabel(targetType: string, targetId: string) {
    if (targetType === 'blog') return blogTitles[targetId] ?? targetId
    return episodeTitles[targetId] ?? targetId
  }

  // Group top-level comments by target, attach their replies
  const topLevel = comments.filter(c => !c.parentId)
  const repliesFor = (parentId: string) => comments.filter(c => c.parentId === parentId)

  // Group by target
  type Group = { targetType: string; targetId: string; comments: typeof topLevel }
  const groupMap = new Map<string, Group>()
  for (const c of topLevel) {
    const key = `${c.targetType}::${c.targetId}`
    if (!groupMap.has(key)) groupMap.set(key, { targetType: c.targetType, targetId: c.targetId, comments: [] })
    groupMap.get(key)!.comments.push(c)
  }
  const groups = [...groupMap.values()]

  const totalTop   = topLevel.length
  const totalReplies = comments.filter(c => c.parentId).length

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-inter font-black text-2xl tracking-tight" style={{ color: '#111111' }}>Comments</h1>
          <p className="text-sm font-inter mt-0.5" style={{ color: '#888888' }}>
            {totalTop} comment{totalTop !== 1 ? 's' : ''} · {totalReplies} repl{totalReplies !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3"
          style={{ border: '1px solid #e0e0e0', background: '#ffffff' }}>
          <MessageSquare size={28} style={{ color: '#cccccc' }} />
          <p className="font-inter text-sm" style={{ color: '#888888' }}>No comments yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => {
            const key = `${group.targetType}::${group.targetId}`
            return (
              <div key={key}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="font-inter text-[8px] tracking-[0.2em] uppercase px-2.5 py-1"
                    style={{ border: '1px solid #d0d0d0', color: '#666666', background: '#fafafa' }}
                  >
                    {group.targetType}
                  </span>
                  <span className="font-inter text-sm font-semibold truncate" style={{ color: '#111111' }}>
                    {targetLabel(group.targetType, group.targetId)}
                  </span>
                  <span className="font-inter text-[10px]" style={{ color: '#aaaaaa' }}>
                    {group.comments.length} comment{group.comments.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ border: '1px solid #e0e0e0', background: '#ffffff', overflow: 'hidden' }}>
                  {group.comments.map((comment, i) => {
                    const replies = repliesFor(comment.id)
                    return (
                      <div key={comment.id} style={i > 0 ? { borderTop: '1px solid #ebebeb' } : {}}>
                        {/* Top-level comment */}
                        <div className="flex items-start gap-4 px-5 py-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <span className="font-inter font-semibold text-sm" style={{ color: '#111111' }}>
                                {comment.name}
                              </span>
                              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cccccc', display: 'inline-block', flexShrink: 0 }} />
                              <span className="font-inter text-[10px]" style={{ color: '#aaaaaa' }}>
                                {new Date(comment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' · '}
                                {new Date(comment.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {replies.length > 0 && (
                                <span className="font-inter text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5"
                                  style={{ background: '#f0f0f0', color: '#777777' }}>
                                  {replies.length} repl{replies.length !== 1 ? 'ies' : 'y'}
                                </span>
                              )}
                            </div>
                            <p className="font-inter text-[13px] leading-relaxed" style={{ color: '#444444' }}>
                              {comment.comment}
                            </p>
                          </div>
                          <form action={handleDelete.bind(null, comment.id)}>
                            <button
                              type="submit"
                              title="Delete comment and its replies"
                              className="w-8 h-8 flex items-center justify-center transition-colors hover:text-red-600 flex-shrink-0"
                              style={{ color: '#cccccc' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </form>
                        </div>

                        {/* Replies */}
                        {replies.map(reply => (
                          <div
                            key={reply.id}
                            className="flex items-start gap-3 px-5 py-3 pl-10"
                            style={{ background: '#fafafa', borderTop: '1px solid #f0f0f0' }}
                          >
                            <CornerDownRight size={12} strokeWidth={1.5} style={{ color: '#cccccc', marginTop: '0.2rem', flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-inter font-semibold text-[13px]" style={{ color: '#333333' }}>
                                  {reply.name}
                                </span>
                                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cccccc', display: 'inline-block', flexShrink: 0 }} />
                                <span className="font-inter text-[10px]" style={{ color: '#aaaaaa' }}>
                                  {new Date(reply.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="font-inter text-[12px] leading-relaxed" style={{ color: '#555555' }}>
                                {reply.comment}
                              </p>
                            </div>
                            <form action={handleDelete.bind(null, reply.id)}>
                              <button
                                type="submit"
                                title="Delete reply"
                                className="w-7 h-7 flex items-center justify-center transition-colors hover:text-red-600 flex-shrink-0"
                                style={{ color: '#cccccc' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
