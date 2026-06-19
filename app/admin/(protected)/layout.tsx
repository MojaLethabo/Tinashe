import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_NAME, verifySession } from '@/lib/session'
import { getAllComments } from '@/lib/api'
import AdminSidebar from '@/components/admin/AdminSidebar'

async function logout() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/admin/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token || !(await verifySession(token))) redirect('/admin/login')

  const comments = await getAllComments()
  const commentCount = comments.filter(c => !c.parentId).length

  return (
    <div className="min-h-screen flex" style={{ background: '#f6f6f6' }}>
      <AdminSidebar onLogout={logout} commentCount={commentCount} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
