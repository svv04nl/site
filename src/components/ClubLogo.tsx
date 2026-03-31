import React from 'react'

type Props = {
  clubcode: string | undefined
  name: string
  className?: string
}

export default function ClubLogo({ clubcode, name, className }: Props) {
  if (!clubcode) {
    return <div className="club-logo-placeholder" />
  }

  return (
    <img
      src={`https://logoapi.voetbal.nl/logo.php?clubcode=${clubcode}`}
      alt={name}
      className={className}
    />
  )
}
