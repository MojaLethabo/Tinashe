'use client'

interface ConnectItem { label: string; value: string; href: string }

export default function ConnectList({ items }: { items: ConnectItem[] }) {
  return (
    <div style={{ borderTop: '1px solid #e0e0e0' }}>
      {items.map(({ label, value, href }) => (
        <div key={label} className="flex items-center gap-5 py-4" style={{ borderBottom: '1px solid #e0e0e0' }}>
          <span className="font-inter text-[9px] tracking-[0.2em] uppercase w-24 flex-shrink-0" style={{ color: '#999999' }}>{label}</span>
          <a href={href} className="font-inter transition-colors hover:text-[#111111]" style={{ fontSize: '0.8125rem', color: '#444444' }}>
            {value}
          </a>
        </div>
      ))}
    </div>
  )
}
