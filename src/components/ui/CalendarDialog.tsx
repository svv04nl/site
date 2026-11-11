'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CalendarIcon from '@/components/ui/CalendarIcon'
import {
  googleCalendarUrl,
  icsText,
  outlookCalendarUrl,
  type CalendarEvent,
} from '@/lib/agenda/links'

// "Zet in je agenda" as a popup: a window in the middle on a computer, a sheet from the bottom
// on a phone. The options follow the device: on an iPhone the Agenda app comes first, on Android
// Google Agenda, on a computer Outlook. Two kinds:
// - a feed (a team, the programme, the club calendar): subscribing, so changes come in by
//   themselves;
// - one event (a match): added once.

export type CalendarTarget =
  | { kind: 'feed'; path: string; name: string }
  | { kind: 'event'; event: CalendarEvent; icsPath?: string; fileName?: string }

type Device = 'ios' | 'android' | 'desktop'

function detectDevice(): Device {
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac; touch points give it away.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return 'ios'
  }
  return /Android/.test(ua) ? 'android' : 'desktop'
}

type Option = {
  label: string
  hint?: string
  href: string
  icon: 'calendar' | 'globe' | 'phone'
  download?: string
  external?: boolean
}

const Icon = ({ name }: { name: Option['icon'] | 'copy' | 'chevron' | 'close' }) => {
  const paths: Record<string, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
      </>
    ),
    phone: (
      <>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
        <path d="M11 18.5h2" />
      </>
    ),
    copy: (
      <>
        <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
        <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
      </>
    ),
    chevron: <path d="M9 6l6 6-6 6" />,
    close: <path d="M6 6l12 12M18 6L6 18" />,
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function feedOptions(device: Device, path: string, name: string, host: string): Option[] {
  const https = `https://${host}${path}`
  const webcal = `webcal://${host}${path}`
  const google: Option = {
    label: 'Google Agenda',
    hint: device === 'android' ? 'Standaard op je Android-telefoon' : 'Toevoegen in je browser',
    href: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    icon: 'globe',
    external: true,
  }
  const outlook: Option = {
    label: 'Outlook',
    hint: 'Opent Outlook om de agenda toe te voegen',
    href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent(name)}`,
    icon: 'calendar',
    external: true,
  }
  if (device === 'ios') {
    return [
      {
        label: 'Toevoegen aan Agenda',
        hint: 'De Agenda-app van je iPhone',
        href: webcal,
        icon: 'calendar',
      },
      google,
    ]
  }
  if (device === 'android') {
    return [
      google,
      { label: 'Andere agenda-app (Outlook, Samsung)', href: webcal, icon: 'calendar' },
    ]
  }
  return [outlook, google, { label: 'Apple Agenda (Mac)', href: webcal, icon: 'phone' }]
}

function eventOptions(
  device: Device,
  target: Extract<CalendarTarget, { kind: 'event' }>,
): Option[] {
  const file: Pick<Option, 'href' | 'download'> = {
    href:
      target.icsPath ??
      `data:text/calendar;charset=utf-8,${encodeURIComponent(icsText(target.event))}`,
    download: target.fileName ?? 'svv04-agenda.ics',
  }
  const google: Option = {
    label: 'Google Agenda',
    hint: 'Opent met alles ingevuld',
    href: googleCalendarUrl(target.event),
    icon: 'globe',
    external: true,
  }
  const outlook: Option = {
    label: 'Outlook',
    hint: 'Opent met alles ingevuld',
    href: outlookCalendarUrl(target.event),
    icon: 'calendar',
    external: true,
  }
  if (device === 'ios') {
    return [
      {
        label: 'Toevoegen aan Agenda',
        hint: 'De Agenda-app van je iPhone',
        icon: 'calendar',
        ...file,
      },
      google,
    ]
  }
  if (device === 'android') {
    return [google, { label: 'Andere agenda-app (Outlook, Samsung)', icon: 'calendar', ...file }]
  }
  return [
    outlook,
    google,
    {
      label: 'Apple Agenda of andere app',
      hint: 'Download een agendabestand',
      icon: 'phone',
      ...file,
    },
  ]
}

type DialogProps = {
  title: string
  subtitle?: string
  target: CalendarTarget | null
  onClose: () => void
  /** Extra content above the options, e.g. the team choice on the programme. */
  children?: React.ReactNode
}

export function CalendarDialog({ title, subtitle, target, onClose, children }: DialogProps) {
  const [device, setDevice] = useState<Device>('desktop')
  const [host, setHost] = useState('svv04.nl')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDevice(detectDevice())
    setHost(window.location.host)
    setMounted(true)
  }, [])

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  if (!mounted) {
    return null
  }

  const options = !target
    ? []
    : target.kind === 'feed'
      ? feedOptions(device, target.path, target.name, host)
      : eventOptions(device, target)
  const feedLink = target?.kind === 'feed' ? `webcal://${host}${target.path}` : null

  const copy = async () => {
    if (!feedLink) {
      return
    }
    try {
      await navigator.clipboard.writeText(feedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.prompt('Kopieer deze link', feedLink)
    }
  }

  return createPortal(
    <div className="calendar-dialog">
      <div className="calendar-dialog__shade" onClick={onClose} aria-hidden="true" />
      <div
        className="calendar-dialog__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="calendar-dialog__head">
          <div>
            <h2 id={titleId} className="calendar-dialog__title">
              {title}
            </h2>
            {subtitle && <p className="calendar-dialog__subtitle">{subtitle}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            className="calendar-dialog__close"
            aria-label="Sluiten"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        {children}

        {target && (
          <div className="calendar-dialog__options">
            {options.map((o, i) => (
              <a
                key={o.label}
                href={o.href}
                className={`calendar-dialog__option${i === 0 ? ' calendar-dialog__option--main' : ''}`}
                {...(o.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...(o.download ? { download: o.download } : {})}
              >
                <Icon name={o.icon} />
                <span className="calendar-dialog__option-text">
                  <strong>{o.label}</strong>
                  {o.hint && <small>{o.hint}</small>}
                </span>
                <Icon name="chevron" />
              </a>
            ))}
            {feedLink && (
              <button type="button" className="calendar-dialog__option" onClick={copy}>
                <Icon name="copy" />
                <span className="calendar-dialog__option-text">
                  <strong>{copied ? 'Link gekopieerd' : 'Kopieer link voor andere agenda'}</strong>
                </span>
              </button>
            )}
          </div>
        )}

        <p className="calendar-dialog__note">
          {target?.kind === 'event'
            ? 'Kijk voor afgelastingen en wijzigingen op de site.'
            : 'Wijzigingen en afgelastingen komen er vanzelf in.'}
        </p>
      </div>
    </div>,
    document.body,
  )
}

type ButtonProps = {
  title: string
  subtitle?: string
  target: CalendarTarget
  label?: string
  className?: string
}

/** A "Zet in mijn agenda" button that opens the popup. */
export default function CalendarButton({
  title,
  subtitle,
  target,
  label = 'Zet in mijn agenda',
  className,
}: ButtonProps) {
  const [open, setOpen] = useState(false)
  const close = React.useCallback(() => setOpen(false), [])
  return (
    <>
      <button
        type="button"
        className={className ?? 'btn btn--primary calendar-button'}
        onClick={() => setOpen(true)}
      >
        <CalendarIcon />
        {label}
      </button>
      {open && <CalendarDialog title={title} subtitle={subtitle} target={target} onClose={close} />}
    </>
  )
}
