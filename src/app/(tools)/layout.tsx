import React from 'react'
import { outfit, rajdhani } from '@/lib/fonts'
import ReactQueryProvider from '@/components/ReactQueryProvider'
import '../(frontend)/globals.scss'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${rajdhani.variable} ${outfit.variable}`}>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
