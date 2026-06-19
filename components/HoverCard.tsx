'use client'
import { useRef } from 'react'

interface HoverCardProps {
  children: React.ReactNode
  className?: string
}

export default function HoverCard({ children, className = '' }: HoverCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
      style={{ background: '#fafafa', border: '1px solid rgba(0,0,0,0.07)' }}
      onMouseEnter={() => {
        if (ref.current) {
          ref.current.style.borderColor = 'rgba(0,0,0,0.18)'
          ref.current.style.background = '#f0f0f0'
        }
      }}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.style.borderColor = 'rgba(0,0,0,0.07)'
          ref.current.style.background = '#fafafa'
        }
      }}
    >
      {children}
    </div>
  )
}
