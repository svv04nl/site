'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  accessToken,
  getAccessCode,
  safeEqual,
  safeRedirectTarget,
} from '@/lib/access-gate'

export type AccessState = { error: string } | null

export async function submitAccessCode(
  _previous: AccessState,
  formData: FormData,
): Promise<AccessState> {
  const expected = getAccessCode()
  // Poort staat uit: er is hier niets te doen.
  if (!expected) redirect('/')

  const entered = String(formData.get('code') ?? '').trim()
  const [enteredToken, expectedToken] = await Promise.all([
    accessToken(entered),
    accessToken(expected),
  ])

  if (!safeEqual(enteredToken, expectedToken)) {
    // Een korte pauze maakt gokken traag. Bewust geen botcontrole (BotID) hier: laadt die niet,
    // dan zou iemand met de goede code buitengesloten worden.
    await new Promise((resolve) => setTimeout(resolve, 600))
    return { error: 'Deze code klopt niet. Probeer het opnieuw.' }
  }

  ;(await cookies()).set(ACCESS_COOKIE, expectedToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  })
  redirect(safeRedirectTarget(formData.get('next')))
}
