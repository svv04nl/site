import React from 'react'
import Link from 'next/link'

type Props = {
  title: string
  subtitle?: string
  link?: { href: string; label: string }
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeader({ title, subtitle, link, as: Tag = 'h2' }: Props) {
  return (
    <div
      className={['section-header', subtitle ? 'section-header--has-subtitle' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <Tag className="page-title">{title}</Tag>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      {link && (
        <Link className="section-header-link" href={link.href}>
          {link.label}
        </Link>
      )}
    </div>
  )
}
