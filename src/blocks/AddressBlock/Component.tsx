'use client'

import React, { useEffect, useState } from 'react'
import { APIProvider, Map, Marker, useMapsLibrary } from '@vis.gl/react-google-maps'
import { AddressIcon } from '@/components/ui/ContactIcons'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

type Props = {
  name?: string | null
  address?: string | null
  plusCode?: string | null
  mapsUrl?: string | null
  websiteUrl?: string | null
}

function AddressMap({ query, mapsUrl }: { query: string; mapsUrl?: string | null }) {
  const geocodingLib = useMapsLibrary('geocoding')
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null)

  useEffect(() => {
    if (!geocodingLib) return
    const geocoder = new geocodingLib.Geocoder()
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location
        setPosition({ lat: loc.lat(), lng: loc.lng() })
      }
    })
  }, [geocodingLib, query])

  if (!position) return null

  // Klikken op de kaart/marker gaat naar de echte Google Maps-plek (mapsUrl),
  // niet naar een coördinaten-gebaseerde kaartweergave.
  const openPlace = () => {
    if (mapsUrl) window.open(mapsUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Map
      className="address-block-map"
      defaultCenter={position}
      defaultZoom={15}
      disableDefaultUI
      gestureHandling="cooperative"
      onClick={mapsUrl ? openPlace : undefined}
      style={mapsUrl ? { cursor: 'pointer' } : undefined}
    >
      <Marker position={position} onClick={mapsUrl ? openPlace : undefined} />
    </Map>
  )
}

export default function AddressBlockComponent({
  name,
  address,
  plusCode,
  mapsUrl,
  websiteUrl,
}: Props) {
  if (!name || !address) return null

  return (
    <div className="address-block">
      <div className="contact-person-name">{name}</div>
      {websiteUrl && (
        <div className="contact-info-row">
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
            {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        </div>
      )}
      <div className="contact-info-row">
        <AddressIcon />
        {mapsUrl ? (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            {address}
          </a>
        ) : (
          <span>{address}</span>
        )}
      </div>
      {GOOGLE_MAPS_API_KEY && (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <AddressMap query={plusCode || address} mapsUrl={mapsUrl} />
        </APIProvider>
      )}
    </div>
  )
}
