import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media, Product, ShopSetting } from '@/payload-types'

/** The Clubartikelen page lives at this path (a CMS page with slug "clubartikelen" under Vereniging). */
export const SHOP_PATH = '/vereniging/clubartikelen'

export const productHref = (slug: string | null | undefined) =>
  slug ? `${SHOP_PATH}/${slug}` : SHOP_PATH

export type ProductImage = {
  url: string
  cardUrl: string
  alt: string
  width?: number | null
  height?: number | null
}

/** The product's photos that have a file, in the editor's order. */
export function productImages(product: Product): ProductImage[] {
  return (product.images ?? [])
    .map((row) => row.image)
    .filter((m): m is Media => typeof m === 'object' && m !== null && Boolean(m.url))
    .map((m) => ({
      url: m.url!,
      cardUrl: m.sizes?.teamCard?.url ?? m.url!,
      alt: m.alt || product.name,
      width: m.width,
      height: m.height,
    }))
}

const euro = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })

/** "€ 12,50", or null without a price. */
export const formatPrice = (price: number | null | undefined) =>
  typeof price === 'number' ? euro.format(price) : null

/** "S, M , L" → ["S", "M", "L"]. */
export const parseSizes = (sizes: string | null | undefined) =>
  (sizes ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/** Where a product can be bought, for the line on its card. */
export function salesChannel(product: Pick<Product, 'inKantine' | 'viaForm'>): string | null {
  if (product.inKantine && product.viaForm) {
    return 'Kantine en formulier'
  }
  if (product.inKantine) {
    return 'Alleen in de kantine'
  }
  if (product.viaForm) {
    return 'Alleen via het formulier'
  }
  return null
}

export async function findProducts(): Promise<Product[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    sort: 'name',
    limit: 100,
    depth: 1,
    pagination: false,
  })
  return docs
}

export async function findProduct(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export async function findShopSettings(): Promise<ShopSetting | null> {
  try {
    const payload = await getPayload({ config })
    return await payload.findGlobal({ slug: 'shop-settings', depth: 0 })
  } catch {
    return null
  }
}

/** Text with one item per line, without empty lines. */
export const lines = (text: string | null | undefined) =>
  (text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
