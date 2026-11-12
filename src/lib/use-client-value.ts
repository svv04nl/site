'use client'

import { useSyncExternalStore } from 'react'

const subscribeNothing = () => () => {}

/**
 * A value only the browser knows (the URL, storage, the user agent): `server` during SSR and
 * hydration, then `getValue()`. Replaces the useEffect + setState round trip, which the React
 * Compiler rules forbid. `getValue` must return the same value while nothing changes: a
 * primitive, or an object kept outside the component.
 */
export function useClientValue<T>(getValue: () => T, server: T): T {
  return useSyncExternalStore(subscribeNothing, getValue, () => server)
}

// One random number per page load in the browser (0 on the server), for orders that should
// differ per visit but stay the same while the page is open.
const pageSeed = typeof window === 'undefined' ? 0 : Math.random() || 0.5

/** The random seed of this page load, 0 during SSR and hydration. */
export const usePageSeed = () => useClientValue(() => pageSeed, 0)

/** A copy of `items` in an order fixed by `seed` (Fisher-Yates with a small seeded PRNG). */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  let state = Math.floor(seed * 2 ** 32) >>> 0
  const random = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32
  }
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
