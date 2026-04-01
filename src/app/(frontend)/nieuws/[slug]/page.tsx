import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
  })
  const post = docs[0]
  if (!post) return {}
  return { title: `SVV'04 - ${docs[0].title}` }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config: await config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    limit: 1,
    depth: 1,
  })

  if (!docs[0]) notFound()

  const post = docs[0]
  const image = post.featuredImage as Media | null | undefined
  const imageUrl = image?.url ?? null

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <main className="news-detail">

      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Nieuws', href: '/nieuws' }, { label: post.title }]} />

      <div className="news-detail-hero">
        <img
          src={imageUrl ?? '/hero-sportpark.jpg'}
          alt={imageUrl ? (image?.alt ?? post.title) : ''}
          className="news-detail-hero-img"
        />
      </div>

      <div className="news-detail-inner">
        {formattedDate && (
          <time className="news-detail-date">{formattedDate}</time>
        )}

        <h1 className="news-detail-title">{post.title}</h1>

        {post.content && (
          <div className="news-detail-body">
            <RichText data={post.content} />
          </div>
        )}

        <div className="news-detail-footer">
          <Link href="/nieuws" className="news-detail-back">
            ← Terug naar nieuwsoverzicht
          </Link>
        </div>
      </div>

    </main>
  )
}
