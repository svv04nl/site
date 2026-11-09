import React from 'react'
import { DOCUMENT_KINDS, type DocumentKind } from './config'
import { slugify } from '@/lib/app-api/format'

type Row = {
  id?: string | null
  title?: string | null
  kind?: DocumentKind | null
  url?: string | null
  fileType?: 'pdf' | 'page' | null
  size?: string | null
}

type Props = {
  title?: string | null
  format?: string | null
  intro?: string | null
  rows?: Row[] | null
}

const GROUPS = [
  { key: 'game', label: 'Wedstrijd en spelregels' },
  { key: 'role', label: 'Per rol' },
] as const

const kindInfo = (kind?: string | null) =>
  DOCUMENT_KINDS.find((k) => k.value === kind) ?? DOCUMENT_KINDS[0]

// Line icons (24x24, stroke) per kind of document.
const ICONS: Record<DocumentKind, React.ReactNode> = {
  gameFormat: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M12 5v14" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  rules: (
    <>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2.5Z" />
      <path d="M8 7h8M8 11h6" />
    </>
  ),
  protocol: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2.5h6V4M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  player: (
    <>
      <path d="M8 3 4 5.5 5.5 10 8 9v12h8V9l2.5 1L20 5.5 16 3c0 2-1.8 3-4 3s-4-1-4-3Z" />
    </>
  ),
  parent: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2" />
      <path d="M16 14.3c2.8-.6 5 1.5 5 4.7" />
    </>
  ),
  coach: (
    <>
      <path d="M14 8h6v3.5a4.5 4.5 0 1 1-9 0V8Z" />
      <path d="M11 11H3M7 8V5" />
      <circle cx="15.5" cy="12" r="1" />
    </>
  ),
  supervisor: (
    <>
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3 20c0-3.6 3-6.5 7-6.5 1.4 0 2.6.3 3.7.9" />
      <path d="m15 18 2 2 4-4" />
    </>
  ),
  referee: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h13l-2.5 4L18 12H5" />
    </>
  ),
}

function Icon({ kind }: { kind: DocumentKind }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[kind]}
    </svg>
  )
}

/** A category (e.g. "Onder 8 tot en met 10") with its documents in a table: game documents first, then per role. */
export default function DocumentTableBlockComponent({ title, format, intro, rows }: Props) {
  const items = (rows ?? []).filter((row) => row.title && row.url)
  if (!title || items.length === 0) return null

  return (
    <section className="document-table" id={slugify(title)}>
      <header className="document-table-head">
        <h2 className="document-table-title">{title}</h2>
        {format && <span className="document-table-format">{format}</span>}
      </header>
      {intro && <p className="document-table-intro">{intro}</p>}

      {GROUPS.map((group) => {
        const groupRows = items.filter((row) => kindInfo(row.kind).group === group.key)
        if (groupRows.length === 0) return null
        return (
          <div className="document-table-group" key={group.key}>
            <div className="document-table-columns" aria-hidden="true">
              <span>{group.label}</span>
              <span>{group.key === 'role' ? 'Voor' : 'Soort'}</span>
              <span>Bestand</span>
            </div>
            <ul className="document-table-rows">
              {groupRows.map((row, i) => {
                const kind = kindInfo(row.kind)
                const isPdf = row.fileType !== 'page'
                const external = /^https?:\/\//.test(row.url!)
                const meta = isPdf ? ['PDF', row.size].filter(Boolean).join(' · ') : 'Webpagina'
                return (
                  <li key={row.id ?? i}>
                    <a
                      className="document-table-row"
                      href={row.url!}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <span className={`document-table-icon document-table-icon--${kind.group}`}>
                        <Icon kind={kind.value} />
                      </span>
                      <span className="document-table-name">{row.title}</span>
                      <span className="document-table-kind">{kind.label}</span>
                      <span className="document-table-meta">
                        {meta}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M7 17 17 7M9 7h8v8" />
                        </svg>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
