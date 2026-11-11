import { TURNSTILE_HEADER, TURNSTILE_PROTECTED_PATHS } from '@/lib/turnstile'

// Turnstile (onzichtbaar) voor de formulieren en de chat. Elke POST naar een beschermde route
// krijgt een vers token in een header, zodat de formulieren zelf niets hoeven te weten. Alleen
// als de controle twijfelt, toont Turnstile rechtsonder een vinkje.

type Turnstile = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  execute: (widgetId: string) => void
  reset: (widgetId: string) => void
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

function loadTurnstile(): Promise<Turnstile> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve((window as unknown as { turnstile: Turnstile }).turnstile)
    script.onerror = () => reject(new Error('Turnstile kon niet laden'))
    document.head.appendChild(script)
  })
}

if (siteKey && typeof window !== 'undefined') {
  let widget: Promise<{ turnstile: Turnstile; id: string }> | undefined
  let pending: { resolve: (token: string) => void; reject: (error: Error) => void } | undefined
  let queue: Promise<unknown> = Promise.resolve()

  const getWidget = () =>
    (widget ??= loadTurnstile().then((turnstile) => {
      const el = document.createElement('div')
      el.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647'
      document.body.appendChild(el)
      const id = turnstile.render(el, {
        sitekey: siteKey,
        execution: 'execute',
        appearance: 'interaction-only',
        callback: (token: string) => pending?.resolve(token),
        'error-callback': () => pending?.reject(new Error('Turnstile mislukt')),
      })
      return { turnstile, id }
    }))

  // Een token is eenmalig; verzoeken gaan daarom na elkaar door de widget.
  const getToken = () => {
    const next = queue.then(async () => {
      const { turnstile, id } = await getWidget()
      return new Promise<string>((resolve, reject) => {
        pending = { resolve, reject }
        turnstile.reset(id)
        turnstile.execute(id)
      })
    })
    queue = next.catch(() => undefined)
    return next
  }

  const isProtected = (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    if (method !== 'POST') {
      return false
    }
    const url = new URL(input instanceof Request ? input.url : String(input), window.location.href)
    return url.origin === window.location.origin && TURNSTILE_PROTECTED_PATHS.includes(url.pathname)
  }

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    if (!isProtected(input, init)) {
      return originalFetch(input, init)
    }
    const token = await getToken().catch(() => '')
    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    )
    if (token) {
      headers.set(TURNSTILE_HEADER, token)
    }
    return originalFetch(input, { ...init, headers })
  }
}
