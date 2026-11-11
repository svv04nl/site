import Link from 'next/link'

type Props = {
  text: string
  href?: string
  className?: string
}

export function MoreLink({ text, href, className }: Props) {
  const cls = `more-link${className ? ` ${className}` : ''}`
  const content = <>{text} &rarr;</>

  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    )
  }

  return <span className={cls}>{content}</span>
}
