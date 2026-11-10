// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { isProduction, siteEnv } from '@/lib/site-env'

describe('siteEnv', () => {
  afterEach(() => {
    delete process.env.SITE_ENV
  })

  it('is development without SITE_ENV (next dev, tests)', () => {
    expect(siteEnv()).toBe('development')
    expect(isProduction()).toBe(false)
  })

  it('follows SITE_ENV on the Worker and on previews', () => {
    process.env.SITE_ENV = 'production'
    expect(isProduction()).toBe(true)
    process.env.SITE_ENV = 'preview'
    expect(siteEnv()).toBe('preview')
    expect(isProduction()).toBe(false)
  })

  it('treats an unknown value as development', () => {
    process.env.SITE_ENV = 'staging'
    expect(siteEnv()).toBe('development')
  })
})
