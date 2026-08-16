'use client'

import React, { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | 'desktop'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

type Props = {
  appStoreUrl?: string | null
  playStoreUrl?: string | null
}

export default function AppStoreButtonsBlockComponent({ appStoreUrl, playStoreUrl }: Props) {
  const [platform, setPlatform] = useState<Platform>('desktop')

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  if (!appStoreUrl && !playStoreUrl) return null

  const showApple = platform !== 'android' && appStoreUrl
  const showPlay = platform !== 'ios' && playStoreUrl

  return (
    <div className="app-store-buttons">
      {showApple && (
        <a href={appStoreUrl!} target="_blank" rel="noopener noreferrer">
          <img
            src="/images/app-store-badge-nl.svg"
            alt="Download in de App Store"
            className="app-store-badge"
          />
        </a>
      )}
      {showPlay && (
        <a href={playStoreUrl!} target="_blank" rel="noopener noreferrer">
          <img
            src="/images/google-play-badge-nl.png"
            alt="Beschikbaar op Google Play"
            className="app-store-badge"
          />
        </a>
      )}
    </div>
  )
}
