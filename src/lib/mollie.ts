// Kleine Mollie-client (alleen wat de tribune-actie nodig heeft). De sleutel in
// MOLLIE_API_KEY bepaalt of het test- of livegeld is.

const API_URL = 'https://api.mollie.com/v2'

export type MolliePaymentStatus =
  | 'open'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'canceled'
  | 'expired'
  | 'failed'

export type MolliePayment = {
  id: string
  status: MolliePaymentStatus
  method?: string | null
  _links?: { checkout?: { href: string } }
}

async function mollieFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = process.env.MOLLIE_API_KEY
  if (!key) throw new Error('MOLLIE_API_KEY is niet ingesteld')

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Mollie ${res.status}: ${json.detail ?? json.title ?? 'onbekende fout'}`)
  }
  return json as T
}

export function createPayment(params: {
  amount: number
  description: string
  redirectUrl: string
  webhookUrl?: string
  metadata?: Record<string, unknown>
}): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      amount: { currency: 'EUR', value: params.amount.toFixed(2) },
      description: params.description,
      redirectUrl: params.redirectUrl,
      webhookUrl: params.webhookUrl,
      metadata: params.metadata,
      locale: 'nl_NL',
    }),
  })
}

export function getPayment(id: string): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(`/payments/${encodeURIComponent(id)}`)
}
