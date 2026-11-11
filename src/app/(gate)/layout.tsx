import React from 'react'
import { sairaCondensed, outfit } from '@/lib/fonts'
import './gate.scss'

// Losse pagina zonder header en footer: de bezoeker is nog niet binnen.
export default function GateLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${sairaCondensed.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  )
}
