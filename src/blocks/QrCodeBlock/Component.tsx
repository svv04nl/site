import React from 'react'
import QRCode from 'qrcode'

type Props = {
  url?: string | null
  label?: string | null
}

export default async function QrCodeBlockComponent({ url, label }: Props) {
  if (!url) {
    return null
  }

  const dataUri = await QRCode.toDataURL(url, { margin: 1, width: 240 })

  return (
    <div className="qr-code-block">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={dataUri} alt={label || 'QR-code'} className="qr-code-block-image" />
      </a>
      {label && <p className="qr-code-block-label">{label}</p>}
    </div>
  )
}
