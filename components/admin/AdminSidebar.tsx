'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Plus, Radio, LogOut, BookOpen, PenLine, Library, MessageSquare } from 'lucide-react'

const nav = [
  { href: '/admin',              label: 'Dashboard',    icon: LayoutDashboard, badge: 0 },
  { href: '/admin/episodes/new', label: 'New Episode',  icon: Plus,            badge: 0 },
  { href: '/admin/blog',         label: 'Blog Posts',   icon: BookOpen,        badge: 0 },
  { href: '/admin/blog/new',     label: 'New Post',     icon: PenLine,         badge: 0 },
  { href: '/admin/publications', label: 'Publications', icon: Library,         badge: 0 },
  { href: '/admin/comments',     label: 'Comments',     icon: MessageSquare,   badge: -1 }, // -1 = use commentCount prop
]

export default function AdminSidebar({
  onLogout,
  commentCount = 0,
}: {
  onLogout: () => Promise<void>
  commentCount?: number
}) {
  const pathname = usePathname()

  return (
    <aside
      className="w-52 flex-shrink-0 flex flex-col min-h-screen"
      style={{ background: '#ffffff', borderRight: '1px solid #e0e0e0' }}
    >
      {/* Brand */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <Link href="/admin" className="font-inter font-black text-lg tracking-[0.08em]" style={{ color: '#111111' }}>
          ZARD
        </Link>
        <p className="text-[9px] tracking-[0.2em] uppercase font-inter mt-0.5" style={{ color: '#999999' }}>Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          const count = badge === -1 ? commentCount : badge
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 text-[11px] font-inter font-medium tracking-wide transition-colors ${
                active ? 'bg-[#111111] text-white' : 'hover:bg-[#f6f6f6]'
              }`}
              style={active ? {} : { color: '#777777' }}
            >
              <Icon size={14} />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span
                  className="font-inter font-black text-[9px] px-1.5 py-0.5 rounded-sm"
                  style={{
                    background: active ? 'rgba(255,255,255,0.25)' : '#111111',
                    color: active ? '#ffffff' : '#ffffff',
                    minWidth: 18,
                    textAlign: 'center',
                  }}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-2 mt-2" style={{ borderTop: '1px solid #e0e0e0' }}>
          <Link
            href="/admin/episodes/new?live=1"
            className="flex items-center gap-3 px-3 py-2.5 text-[11px] font-inter font-medium tracking-wide transition-colors hover:bg-[#f6f6f6]"
            style={{ color: '#777777' }}
          >
            <Radio size={14} />
            New Live Session
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-4 space-y-1" style={{ borderTop: '1px solid #e0e0e0' }}>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 text-[11px] font-inter transition-colors hover:text-[#111111]"
          style={{ color: '#999999' }}
        >
          View Site ↗
        </Link>
        <form action={onLogout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 text-[11px] font-inter transition-colors hover:text-red-600 w-full text-left"
            style={{ color: '#999999' }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
