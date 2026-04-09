import React from 'react'

type Props = {
  children: React.ReactNode
}

export function Sidebar({ children }: Props) {
  return (
    <div className="sidebar-col">
      <div className="sidebar-col__inner">
        {children}
      </div>
    </div>
  )
}
