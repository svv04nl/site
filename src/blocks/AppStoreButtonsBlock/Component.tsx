'use client'

import React, { useEffect, useState } from 'react'
import type { Media } from '@/payload-types'

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
  appStoreBadge?: Media | number | string | null
  playStoreBadge?: Media | number | string | null
}

function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null
}

export default function AppStoreButtonsBlockComponent({
  appStoreUrl,
  playStoreUrl,
  appStoreBadge,
  playStoreBadge,
}: Props) {
  const [platform, setPlatform] = useState<Platform>('desktop')

  useEffect(() => {
    setPlatform(detectPlatform())
  }, [])

  const appStoreImg = isMedia(appStoreBadge) ? appStoreBadge : null
  const playStoreImg = isMedia(playStoreBadge) ? playStoreBadge : null

  if ((!appStoreUrl || !appStoreImg) && (!playStoreUrl || !playStoreImg)) return null

  const showApple = platform !== 'android' && appStoreUrl && appStoreImg
  const showPlay = platform !== 'ios' && playStoreUrl && playStoreImg

  return (
    <div className="app-store-buttons">
      {showApple && (
        <a href={appStoreUrl!} target="_blank" rel="noopener noreferrer">
          <img
            src={appStoreImg!.url ?? undefined}
            alt={appStoreImg!.alt}
            className="app-store-badge"
          />
        </a>
      )}
      {showPlay && (
        <a href={playStoreUrl!} target="_blank" rel="noopener noreferrer">
          <img
            src={playStoreImg!.url ?? undefined}
            alt={playStoreImg!.alt}
            className="app-store-badge"
          />
        </a>
      )}
    </div>
  )
}
