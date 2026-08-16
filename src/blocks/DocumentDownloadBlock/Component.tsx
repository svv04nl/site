import React from 'react'
import type { Media } from '@/payload-types'

type Props = {
  title?: string | null
  description?: string | null
  file?: Media | number | null
}

function formatFileSize(bytes?: number | null): string | null {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentDownloadBlockComponent({ title, description, file }: Props) {
  if (!title || !file || typeof file !== 'object') return null

  const size = formatFileSize(file.filesize)
  const ext = file.filename?.split('.').pop()?.toUpperCase()
  const meta = [ext, size].filter(Boolean).join(' · ')

  return (
    <a href={file.url ?? '#'} className="document-block" target="_blank" rel="noopener noreferrer">
      <span className="document-block-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
        </svg>
      </span>
      <span className="document-block-info">
        <span className="document-block-title">{title}</span>
        {description && <span className="document-block-description">{description}</span>}
        {meta && <span className="document-block-meta">{meta}</span>}
      </span>
      <span className="document-block-download" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      </span>
    </a>
  )
}
