'use client'
import { useEffect } from 'react'

export default function BlogViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch('/api/pageviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'blog', slug }),
    }).catch(() => {})
  }, [slug])
  return null
}
