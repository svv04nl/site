'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { searchQueryVariants } from '@/lib/search-query'
import type { ActionPage } from './Header'

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
)

const ResultArrow = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

type SearchItem = {
  label: string
  sub?: string
  href: string
  external?: boolean
}

type SearchGroup = {
  group: string
  items: SearchItem[]
}

const MEEDOEN_SUBTEXT: Record<string, string> = {
  lidmaatschap: "Aanmelden bij SVV'04",
  sponsoring: 'Partner van de club',
  vrijwilligerswerk: 'Help mee op en rond het veld',
}

function buildQuickLinkGroups(actiePages: ActionPage[]): SearchGroup[] {
  return [
    {
      group: 'Teams',
      items: [{ label: 'Teams', sub: 'Senioren en jeugd, O19 t/m Kabouters', href: '/teams' }],
    },
    {
      // Merged into "Meedoen" (same label) so quick links and join-actions
      // render under one shared header.
      group: 'Meedoen',
      items: [
        { label: 'Nieuws', sub: 'Laatste berichten', href: '/nieuws' },
        { label: 'Agenda', sub: 'Evenementen & data', href: '/agenda' },
        { label: 'Programma & uitslagen', sub: 'Wedstrijden', href: '/programma' },
        {
          label: 'Webshop',
          sub: 'Clubkleding & merch',
          href: 'https://clubs.deventrade.com/nl/svv-04/clubcollectie',
          external: true,
        },
        { label: 'Contact', sub: 'Sportpark & bestuur', href: '/contact' },
        ...actiePages.map((page) => ({
          label: page.actionLabel || page.title,
          sub: MEEDOEN_SUBTEXT[page.slug] ?? "Meedoen bij SVV'04",
          href: `/${page.section}/${page.slug}`,
        })),
      ],
    },
  ].filter((g) => g.items.length > 0)
}

function filterGroups(groups: SearchGroup[], query: string): SearchGroup[] {
  const variants = searchQueryVariants(query)
  if (variants.length === 0) return groups
  return groups
    .map((g) => ({
      group: g.group,
      items: g.items.filter((it) =>
        variants.some(
          (v) => it.label.toLowerCase().includes(v) || (it.sub ?? '').toLowerCase().includes(v),
        ),
      ),
    }))
    .filter((g) => g.items.length > 0)
}

// Highest-priority group first; anything not listed sorts after all of these.
const GROUP_PRIORITY = ['Meedoen', 'Voor jou', 'Teams', "Pagina's", 'Nieuws']

function groupPriority(group: string): number {
  const index = GROUP_PRIORITY.indexOf(group)
  return index === -1 ? GROUP_PRIORITY.length : index
}

// Content results and static quick links can both produce a group with the
// same label (e.g. "Teams") — merge those into one section instead of
// rendering the same header twice.
function mergeGroups(...groupLists: SearchGroup[][]): SearchGroup[] {
  const itemsByLabel = new Map<string, SearchItem[]>()
  for (const list of groupLists) {
    for (const g of list) {
      itemsByLabel.set(g.group, [...(itemsByLabel.get(g.group) ?? []), ...g.items])
    }
  }
  const groups = [...itemsByLabel.entries()].map(([group, items]) => ({ group, items }))

  return groups.sort((a, b) => groupPriority(a.group) - groupPriority(b.group))
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 200

type Props = {
  open: boolean
  onClose: () => void
  actiePages: ActionPage[]
}

export default function SearchModal({ open, onClose, actiePages }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [contentGroups, setContentGroups] = useState<SearchGroup[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const latestRequestId = useRef(0)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setContentGroups([])
    setSelectedIndex(0)
    const id = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setContentGroups([])
      return
    }

    const controller = new AbortController()
    const id = window.setTimeout(() => {
      const requestId = ++latestRequestId.current
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { groups?: SearchGroup[] }) => {
          // Ignore this response if a newer request has since been issued —
          // slower older requests can otherwise resolve after and overwrite
          // fresher results.
          if (requestId !== latestRequestId.current) return
          setContentGroups(data.groups ?? [])
        })
        .catch((err) => {
          if (err?.name !== 'AbortError' && requestId === latestRequestId.current) {
            setContentGroups([])
          }
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(id)
      controller.abort()
    }
  }, [query])

  const quickLinkGroups = useMemo(() => buildQuickLinkGroups(actiePages), [actiePages])
  const filteredQuickLinkGroups = useMemo(
    () => filterGroups(quickLinkGroups, query),
    [quickLinkGroups, query],
  )
  const groups = useMemo(
    () => mergeGroups(contentGroups, filteredQuickLinkGroups),
    [contentGroups, filteredQuickLinkGroups],
  )
  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups])

  // Query changed → results changed, so reset the highlighted row
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    rowRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const navigateTo = (item: SearchItem) => {
    onClose()
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
    } else {
      router.push(item.href)
    }
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flatItems.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = flatItems[selectedIndex]
      if (item) navigateTo(item)
    }
  }

  if (!open) return null

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div
        className="search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Zoeken"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="search-modal-input-row">
          <SearchIcon />
          <input
            ref={inputRef}
            id="svvSearchInput"
            className="search-modal-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Zoek teams, nieuws, pagina's…"
          />
          <span className="search-modal-kbd search-modal-esc-hint">ESC</span>
        </div>

        <div className="search-modal-results">
          {(() => {
            let flatIndex = -1
            return groups.map((g) => (
              <div key={g.group}>
                <div className="search-modal-group-label">{g.group}</div>
                {g.items.map((it) => {
                  flatIndex += 1
                  const index = flatIndex
                  return (
                    <Link
                      key={it.href + it.label}
                      ref={(el) => {
                        rowRefs.current[index] = el
                      }}
                      href={it.href}
                      onClick={onClose}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`search-modal-row${index === selectedIndex ? ' search-modal-row--active' : ''}`}
                      target={it.external ? '_blank' : undefined}
                      rel={it.external ? 'noopener noreferrer' : undefined}
                    >
                      <span className="search-modal-row-icon">
                        <ResultArrow />
                      </span>
                      <span className="search-modal-row-text">
                        <span className="search-modal-row-label">{it.label}</span>
                        {it.sub && <span className="search-modal-row-sub">{it.sub}</span>}
                      </span>
                    </Link>
                  )
                })}
              </div>
            ))
          })()}
          {groups.length === 0 && query.trim().length >= MIN_QUERY_LENGTH && (
            <div className="search-modal-empty">
              Geen resultaten voor &ldquo;<strong>{query}</strong>&rdquo;
            </div>
          )}
        </div>

        <div className="search-modal-footer">
          <span>
            <span className="search-modal-kbd">&uarr;</span>
            <span className="search-modal-kbd">&darr;</span> navigeren
          </span>
          <span>
            <span className="search-modal-kbd">&crarr;</span> openen
          </span>
          <span className="search-modal-footer-hint">
            <span className="search-modal-kbd">&#8984;</span>
            <span className="search-modal-kbd">K</span> zoeken
          </span>
        </div>
      </div>
    </div>
  )
}
