import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { BreadcrumbJsonLd } from '@/components/BreadcrumbJsonLd'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductOrderForm } from '@/components/shop/ProductOrderForm'
import {
  SHOP_PATH,
  findProduct,
  findShopSettings,
  formatPrice,
  lines,
  parseSizes,
  productImages,
} from '@/lib/products'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ product: string }> }

export async function generateMetadata({ params }: Props) {
  const { product: slug } = await params
  const product = await findProduct(slug)
  return product
    ? { title: `SVV'04 - ${product.name}`, description: product.summary ?? undefined }
    : {}
}

/** One clubartikel: photos, price, where to buy it, and the order form. */
export default async function ProductPage({ params }: Props) {
  const { product: slug } = await params
  const [product, settings] = await Promise.all([findProduct(slug), findShopSettings()])
  if (!product) {
    notFound()
  }

  const images = productImages(product)
  const price = formatPrice(product.price)
  const kantine = lines(settings?.kantineTimes)
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Vereniging' },
    { label: 'Clubartikelen', href: SHOP_PATH },
    { label: product.name },
  ]

  return (
    <main className="page">
      <SetBreadcrumb crumbs={crumbs} />
      <BreadcrumbJsonLd
        items={crumbs.map((c) => ({ name: c.label, href: (c as { href?: string }).href }))}
      />

      <div className="page-inner product-page">
        <div className="product-page__media">
          <ProductGallery images={images} name={product.name} />
          {product.description && (
            <div className="product-page__about">
              <h2>Over dit artikel</h2>
              {product.description.split(/\n{2,}/).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}
        </div>

        <div className="product-page__info">
          <Link href={SHOP_PATH} className="product-page__back">
            <span aria-hidden="true">&larr;</span> Alle clubartikelen
          </Link>
          <h1 className="product-page__title">{product.name}</h1>
          {price && <p className="product-page__price">{price}</p>}

          {product.inKantine && (
            <div className="product-page__kantine">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l1-5h16l1 5" />
                <path d="M4 9v11h16V9" />
                <path d="M9 20v-6h6v6" />
              </svg>
              <div>
                <p className="product-page__kantine-title">
                  {product.viaForm ? 'Direct mee? Koop het in de kantine' : 'Te koop in de kantine'}
                </p>
                {kantine.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {product.viaForm && (
            <ProductOrderForm
              product={product.name}
              sizes={parseSizes(product.sizes)}
              orderRole={settings?.orderRole}
            />
          )}
        </div>
      </div>
    </main>
  )
}
