'use client'

import React, { useEffect, useState } from 'react'
import CalendarIcon from '@/components/ui/CalendarIcon'

// "Volg in je agenda": subscribe to the team's feed, so every match (and every change to it)
// shows up in your own calendar. The host comes from the browser, so previews work too.
export default function TeamCalendarSection({ slug }: { slug: string }) {
  const [host, setHost] = useState('svv04.nl')
  const [copied, setCopied] = useState(false)

  useEffect(() => setHost(window.location.host), [])

  const httpsUrl = `https://${host}/api/agenda/team/${slug}.ics`
  const webcalUrl = `webcal://${host}/api/agenda/team/${slug}.ics`
  const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(httpsUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Kopieer deze link', httpsUrl)
    }
  }

  return (
    <div className="sidebar-section team-calendar">
      <h2 className="sidebar-section-title">Volg in je agenda</h2>
      <p className="team-calendar__text">
        Alle wedstrijden van dit team in je eigen agenda. Wijzigingen en afgelastingen komen er
        vanzelf in.
      </p>
      <div className="team-calendar__actions">
        <a className="btn btn--primary btn--block" href={webcalUrl}>
          <CalendarIcon />
          iPhone of Outlook
        </a>
        <a
          className="btn btn--outline-dark btn--block"
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Agenda
        </a>
        <button type="button" className="team-calendar__copy" onClick={copy}>
          {copied ? 'Link gekopieerd' : 'Of kopieer de link'}
        </button>
      </div>
    </div>
  )
}
