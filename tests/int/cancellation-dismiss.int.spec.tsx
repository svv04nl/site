import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { allDismissed, pruneDismissed } from '@/lib/clubdata/cancellation'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const { CancellationBannerClient } = await import('@/components/CancellationBannerClient')

const match = (matchCode: number, dayKey: string) => ({
  matchCode,
  dayKey,
  day: dayKey,
  time: '14:00',
  home: "SVV'04 1",
  away: 'Testclub 1',
  isHome: true,
})

// Een computer (geen telefoon): de gele balk.
function setPhone(phone: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: phone,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as any
}

const show = (matches: ReturnType<typeof match>[]) =>
  render(<CancellationBannerClient data={{ matches, allCancelled: null }} />)
const bar = () => document.querySelector('.cancellation-banner')
// A new visit: the page again, with an empty sessionStorage (localStorage stays).
function newVisit() {
  cleanup()
  vi.stubGlobal('sessionStorage', memoryStorage())
}

// Node 26 has its own (empty) localStorage on globalThis, in front of the one of jsdom.
function memoryStorage(): Storage {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (i) => [...items.keys()][i] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, String(value)),
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-11-26T10:00:00Z'))
  vi.stubGlobal('localStorage', memoryStorage())
  vi.stubGlobal('sessionStorage', memoryStorage())
  setPhone(false)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('pruneDismissed en allDismissed', () => {
  it('houdt alleen wedstrijden van vandaag en later', () => {
    expect(
      pruneDismissed({ 1: '2026-11-25', 2: '2026-11-26', 3: '2026-11-28' }, '2026-11-26'),
    ).toEqual({ 2: '2026-11-26', 3: '2026-11-28' })
  })

  it('is alleen waar als elke wedstrijd al weggeklikt is', () => {
    expect(allDismissed([1, 2], { 1: '2026-11-28', 2: '2026-11-28' })).toBe(true)
    expect(allDismissed([1, 2, 3], { 1: '2026-11-28', 2: '2026-11-28' })).toBe(false)
  })
})

describe('afgelastingsbalk wegklikken', () => {
  it('blijft weg na herladen, ook in een nieuw bezoek', () => {
    show([match(1, '2026-11-28')])
    fireEvent.click(screen.getByLabelText('Melding sluiten'))
    expect(bar()).toBeNull()

    newVisit()
    show([match(1, '2026-11-28')])
    expect(bar()).toBeNull()
  })

  it('komt terug bij een nieuwe afgelasting, met alle wedstrijden', () => {
    show([match(1, '2026-11-28')])
    fireEvent.click(screen.getByLabelText('Melding sluiten'))
    cleanup()

    show([match(1, '2026-11-28'), match(2, '2026-11-28')])
    expect(bar()?.textContent).toContain('2 wedstrijden afgelast')
  })

  it('vergeet een wedstrijd als zijn dag voorbij is', () => {
    show([match(1, '2026-11-28')])
    fireEvent.click(screen.getByLabelText('Melding sluiten'))
    cleanup()

    vi.setSystemTime(new Date('2026-11-29T10:00:00Z'))
    show([match(3, '2026-11-30')])
    fireEvent.click(screen.getByLabelText('Melding sluiten'))
    expect(JSON.parse(localStorage.getItem('svv-afgelast-gesloten') ?? '{}')).toEqual({
      3: '2026-11-30',
    })
  })

  it('telefoon: de popup komt na wegklikken niet terug voor dezelfde wedstrijden', () => {
    setPhone(true)
    show([match(1, '2026-11-28')])
    fireEvent.click(screen.getByLabelText('Sluiten'))
    expect(screen.queryByRole('dialog')).toBeNull()

    newVisit()
    show([match(1, '2026-11-28')])
    expect(screen.queryByRole('dialog')).toBeNull()

    cleanup()
    show([match(1, '2026-11-28'), match(2, '2026-11-28')])
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})

describe('meerdere wedstrijden van één team', () => {
  const evening = (matchCode: number, time: string, away: string) => ({
    ...match(matchCode, '2026-11-27'),
    time,
    home: "SVV'04 35+1",
    away,
  })

  it('voegt ze samen tot één regel, met de tijden van eerste tot laatste', () => {
    show([evening(11, '19:30', 'A 35+1'), evening(12, '20:15', 'B 35+1'), match(1, '2026-11-27')])
    const pills = [...document.querySelectorAll('.cancellation-pill')].map((p) => p.textContent)
    expect(bar()?.textContent).toContain('3 wedstrijden afgelast')
    expect(pills).toEqual(["19:30–20:15SVV'04 35+1 · 2 wedstrijden", "14:00SVV'04 1 – Testclub 1"])
    expect(document.querySelector('.cancellation-pill')?.getAttribute('href')).toBe('/programma')
  })

  it('houdt hetzelfde team op een andere dag apart', () => {
    show([
      evening(11, '19:30', 'A 35+1'),
      { ...evening(12, '19:30', 'B 35+1'), dayKey: '2026-11-28' },
    ])
    expect(document.querySelectorAll('.cancellation-pill')).toHaveLength(2)
  })

  it('onthoudt het wegklikken nog steeds per wedstrijd', () => {
    show([evening(11, '19:30', 'A 35+1'), evening(12, '20:15', 'B 35+1')])
    fireEvent.click(screen.getByLabelText('Melding sluiten'))
    expect(JSON.parse(localStorage.getItem('svv-afgelast-gesloten') ?? '{}')).toEqual({
      11: '2026-11-27',
      12: '2026-11-27',
    })
  })
})
