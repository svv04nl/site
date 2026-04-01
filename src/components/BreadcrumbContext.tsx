'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'

export type Crumb = { label: string; href?: string }

type Ctx = { crumbs: Crumb[]; setCrumbs: (c: Crumb[]) => void }

const BreadcrumbCtx = createContext<Ctx>({ crumbs: [], setCrumbs: () => {} })

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[]>([])
  return <BreadcrumbCtx.Provider value={{ crumbs, setCrumbs }}>{children}</BreadcrumbCtx.Provider>
}

export function useBreadcrumbContext() {
  return useContext(BreadcrumbCtx)
}

export function SetBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const { setCrumbs } = useContext(BreadcrumbCtx)
  useEffect(() => {
    setCrumbs(crumbs)
    return () => setCrumbs([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export function BreadcrumbBar() {
  const { crumbs } = useContext(BreadcrumbCtx)
  if (crumbs.length === 0) return null
  return (
    <nav className="team-breadcrumb" aria-label="Kruimelpad">
      <div className="team-page-inner">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span aria-hidden="true">›</span>}
            {crumb.href
              ? <Link href={crumb.href}>{crumb.label}</Link>
              : <span>{crumb.label}</span>
            }
          </React.Fragment>
        ))}
      </div>
    </nav>
  )
}
