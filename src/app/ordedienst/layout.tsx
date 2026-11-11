import React from 'react'
import { outfit, rajdhani } from '@/lib/fonts'
import ReactQueryProvider from '@/components/ReactQueryProvider'

export default function OrdiedienstLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${rajdhani.variable} ${outfit.variable}`}>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}
