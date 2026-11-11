import Link from 'next/link'
import type { Audience } from '@/payload-types'

// Themed link groups ("01 Aan de slag", ...) shown under the hero.
export function AudienceThemes({ themes }: { themes: NonNullable<Audience['themes']> }) {
  if (themes.length === 0) {
    return null
  }

  return (
    <div className="audience-themes">
      {themes.map((theme, i) => (
        <section key={theme.id} className="audience-theme">
          <span className="audience-theme-number">{String(i + 1).padStart(2, '0')}</span>
          <h2 className="audience-theme-title">{theme.title}</h2>
          {theme.intro && <p className="audience-theme-intro">{theme.intro}</p>}
          {theme.links && theme.links.length > 0 && (
            <ul className="audience-theme-links">
              {theme.links.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="audience-theme-link">
                    <span>
                      <span className="audience-theme-link-title">{link.title}</span>
                      {link.description && (
                        <span className="audience-theme-link-sub">{link.description}</span>
                      )}
                    </span>
                    <span className="audience-theme-link-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
