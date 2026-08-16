/**
 * Creates/updates the contact-person records referenced by the membership
 * pages (jeugd@svv04.nl, ledenadmin@svv04.nl) and the contact page's right
 * column (secretaris@svv04.nl), so pages can show a ContactBlock instead of
 * a plain mailto link.
 *
 * Run with: node --no-deprecation --env-file=.env.local --import=tsx/esm src/scripts/seed-membership-contacts.ts
 */

import { getPayload } from 'payload'
import config from '@payload-config'

const CONTACTS = [
  {
    name: 'Anne de Jonge',
    roles: [{ title: 'Coördinator jeugd', slug: 'coordinator-jeugd' }],
    email: 'jeugd@svv04.nl',
    phone: '06-50813259',
    group: 'Jeugd',
    order: 20,
    showInContactForm: true,
    // Alleen zichtbaar via het ContactBlock op de jeugdpagina's, niet in de
    // algemene kolom op de contactpagina.
    showOnContactPage: false,
  },
  {
    name: 'Piet Withagen',
    roles: [{ title: 'Ledenadministratie', slug: 'ledenadministratie' }],
    email: 'ledenadmin@svv04.nl',
    phone: '06-34118073',
    group: 'Ledenadministratie',
    order: 30,
    showInContactForm: true,
    showOnContactPage: true,
  },
  {
    name: 'Wietske Gommer',
    roles: [{ title: 'Secretaris', slug: 'secretaris' }],
    email: 'secretaris@svv04.nl',
    group: 'Secretariaat',
    order: 10,
    showInContactForm: true,
    showOnContactPage: true,
  },
  {
    name: 'Harrie Kocks',
    roles: [{ title: 'Voetbaltechnische zaken', slug: 'voetbaltechnische-zaken' }],
    email: 'voetbalzaken@svv04.nl',
    phone: '06-50503564',
    group: 'Bestuur',
    order: 15,
    showInContactForm: true,
    showOnContactPage: true,
  },
]

async function main() {
  const payload = await getPayload({ config })

  for (const contact of CONTACTS) {
    const { docs } = await payload.find({
      collection: 'contacts',
      where: { email: { equals: contact.email } },
      limit: 1,
    })
    if (docs[0]) {
      await payload.update({ collection: 'contacts', id: docs[0].id, data: contact })
      console.log(`Updated: contacts/${contact.email}`)
      continue
    }
    await payload.create({ collection: 'contacts', data: contact })
    console.log(`Created: contacts/${contact.email}`)
  }

  console.log('Done.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
