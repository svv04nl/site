import React from 'react'
import Link from 'next/link'
import {
  findProducts,
  findShopSettings,
  formatPrice,
  lines,
  productHref,
  productImages,
} from '@/lib/products'

type Props = {
  title?: string | null
  showHowToOrder?: boolean | null
}

/** The club's own articles as cards, each to its product page, plus "Zo bestel je". */
export default async function ProductGridBlockComponent({ title, showHowToOrder }: Props) {
  const [products, settings] = await Promise.all([findProducts(), findShopSettings()])
  const kantine = lines(settings?.kantineTimes)

  return (
    <div className="product-grid-block">
      {products.length > 0 && (
        <section className="product-grid-section">
          {title && <h2 className="product-grid-title">{title}</h2>}
          <div className="product-grid">
            {products.map((product) => {
              const image = productImages(product)[0]
              const price = formatPrice(product.price)
              return (
                <Link key={product.id} href={productHref(product.slug)} className="product-card">
                  <span className="product-card__media">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.cardUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="product-card__empty" aria-hidden="true" />
                    )}
                  </span>
                  <span className="product-card__body">
                    <span className="product-card__name">{product.name}</span>
                    {product.summary && (
                      <span className="product-card__summary">{product.summary}</span>
                    )}
                    <span className="product-card__foot">
                      {price && <span className="product-card__price">{price}</span>}
                      <span className="product-card__more">
                        Bekijk <span aria-hidden="true">&rarr;</span>
                      </span>
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {showHowToOrder !== false && (
        <section className="how-to-order">
          <h2 className="how-to-order__title">Zo bestel je</h2>
          <div className="how-to-order__grid">
            <div className="how-to-order__item">
              <h3>In de kantine</h3>
              <p>Kom langs en neem het direct mee.</p>
              {kantine.length > 0 && (
                <ul className="how-to-order__times">
                  {kantine.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="how-to-order__item">
              <h3>Via het formulier</h3>
              <p>Kies een artikel en vul op de productpagina het formulier in.</p>
              {settings?.payAndPickup && <p>{settings.payAndPickup}</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
