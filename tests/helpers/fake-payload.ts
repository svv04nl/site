import { vi } from 'vitest'

// Een kleine nepversie van de Payload Local API, in het geheugen. Zo testen we de betaallogica
// zonder database: de tests raken dus nooit de gedeelde (lokale of preview) database.

type Row = Record<string, any>
type Collections = Record<string, Row[]>

function valuesAt(row: Row, path: string): unknown[] {
  let values: unknown[] = [row]
  for (const part of path.split('.')) {
    values = values
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .map((v) => (v && typeof v === 'object' ? (v as Row)[part] : undefined))
  }
  return values.flatMap((v) => (Array.isArray(v) ? v : [v]))
}

// Ondersteunt alleen wat de code gebruikt: and/or, equals, not_equals, exists, in,
// less_than en greater_than.
export function matches(row: Row, where?: Record<string, any>): boolean {
  if (!where) {
    return true
  }
  return Object.entries(where).every(([key, condition]) => {
    if (key === 'and') {
      return (condition as any[]).every((c) => matches(row, c))
    }
    if (key === 'or') {
      return (condition as any[]).some((c) => matches(row, c))
    }
    const values = valuesAt(row, key)
    return Object.entries(condition as Record<string, any>).every(([op, expected]) => {
      switch (op) {
        case 'equals':
          return values.some((v) => v === expected)
        case 'not_equals':
          return values.every((v) => v !== expected)
        case 'exists':
          return values.some((v) => v !== undefined && v !== null) === expected
        case 'in':
          return values.some((v) => (expected as unknown[]).includes(v))
        case 'less_than':
          return values.some((v) => v != null && (v as any) < expected)
        case 'greater_than':
          return values.some((v) => v != null && (v as any) > expected)
        default:
          throw new Error(`Fake payload ondersteunt operator "${op}" niet`)
      }
    })
  })
}

export function createFakePayload(seed: Collections = {}) {
  const db: Collections = {
    donations: [],
    fundraisers: [],
    contacts: [],
    ...Object.fromEntries(
      Object.entries(seed).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))]),
    ),
  }
  let nextId = 1000

  const rows = (collection: string) => {
    if (!db[collection]) {
      throw new Error(`Onbekende collectie ${collection}`)
    }
    return db[collection]
  }

  const payload = {
    db,
    sendEmail: vi.fn(async (_message: { to: string; subject: string; html: string }) => undefined),
    logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },

    find: vi.fn(async ({ collection, where, limit }: any) => {
      const docs = rows(collection)
        .filter((r) => matches(r, where))
        .map((r) => ({ ...r }))
      return { docs: limit ? docs.slice(0, limit) : docs, totalDocs: docs.length }
    }),

    findByID: vi.fn(async ({ collection, id }: any) => {
      const row = rows(collection).find((r) => r.id === id)
      if (!row) {
        throw new Error(`Not found: ${collection} ${id}`)
      }
      return { ...row }
    }),

    create: vi.fn(async ({ collection, data }: any) => {
      const row = { id: nextId++, createdAt: new Date().toISOString(), ...data }
      rows(collection).push(row)
      return { ...row }
    }),

    // Net als Payload: met `id` krijg je het document terug, met `where` een lijst.
    update: vi.fn(async ({ collection, id, where, data }: any) => {
      if (id !== undefined) {
        const row = rows(collection).find((r) => r.id === id)
        if (!row) {
          throw new Error(`Not found: ${collection} ${id}`)
        }
        Object.assign(row, data)
        return { ...row }
      }
      const docs = rows(collection).filter((r) => matches(r, where))
      docs.forEach((r) => Object.assign(r, data))
      return { docs: docs.map((r) => ({ ...r })), errors: [] }
    }),
  }
  return payload
}

export type FakePayload = ReturnType<typeof createFakePayload>

// Basisgegevens die in meerdere tests terugkomen.
export const fundraiserRow = {
  id: 1,
  title: 'Renovatie tribune',
  slug: 'tribune',
  active: true,
  goalAmount: null,
  transactionFee: 0.29,
  unitPrice: 30,
  unitName: 'stoeltje',
  unitNamePlural: 'stoeltjes',
  nameOnObjectLabel: 'Mijn naam mag op de tribune zelf geplaatst worden.',
}

export function donationRow(overrides: Row = {}): Row {
  return {
    id: 1,
    fundraiser: 1,
    name: 'Jan Jansen',
    email: 'jan@example.nl',
    isCompany: false,
    showOnList: false,
    nameOnObject: false,
    units: 2,
    freeAmount: 5,
    amount: 65,
    fee: 0.29,
    status: 'open',
    mollieId: 'tr_1',
    publicToken: '9249051d-e2ef-40ae-b4b8-8f303c1804b6',
    createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    ...overrides,
  }
}
