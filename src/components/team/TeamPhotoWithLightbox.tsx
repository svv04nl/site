'use client'

import React, { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

type Props = {
  src: string
  largeSrc: string
  alt: string
}

export default function TeamPhotoWithLightbox({ src, largeSrc, alt }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={900}
        height={600}
        className="team-photo-img"
        onClick={() => setOpen(true)}
      />
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: largeSrc, alt }]}
        carousel={{
          finite: true,
          preload: 0,
          spacing: '30%',
          imageFit: 'contain',
          padding: '0px',
        }}
        animation={{
          fade: 200,
          swipe: 200,
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: false,
          closeOnPullUp: false,
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </>
  )
}
