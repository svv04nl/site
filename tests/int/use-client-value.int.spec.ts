// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { seededShuffle } from '@/lib/use-client-value'

describe('seededShuffle', () => {
  const items = Array.from({ length: 20 }, (_, i) => i)

  it('keeps every item and does not change the input', () => {
    const shuffled = seededShuffle(items, 0.42)
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items)
    expect(items).toEqual(Array.from({ length: 20 }, (_, i) => i))
  })

  it('gives the same order for the same seed and another for another seed', () => {
    expect(seededShuffle(items, 0.42)).toEqual(seededShuffle(items, 0.42))
    expect(seededShuffle(items, 0.42)).not.toEqual(seededShuffle(items, 0.77))
  })
})
