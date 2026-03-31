import { getPayload } from 'payload'
import config from '@payload-config'

const teamData = [
  {
    slug: 'svv04-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/Selectie.jpg',
    players: [
      'Bert Schoemakers', 'Jos Schaart', 'Sam Ridderman', 'Kevin Poker', 'Edwin Bergink',
      'Luca Sibon', 'Laurens Grobbe', 'Robbin Hanken', 'Sander Kocks', 'Ian Verschoor',
      'Jesse Lubbers', 'Koen Schepers', 'Arjen Kocks', 'Jeroen Drenthen', 'Cheik Ndir',
      'Dennis Bos', 'Sander Wemmenhove', 'Bennie Eikens', 'Arjan van Veen', 'Daan Finke',
      'Stef Rotmensen', 'Stan Sibon', 'Maikel Bunskoek', 'Thijmen Mittendorff', 'Dion Tuinier',
      'Jarno Wesseling', 'Ruben Pat', 'Dusán Muskee', 'Jesse Jalving', 'Rick Piek',
      'Joris Kusters', 'Ron Bunskoek', 'Jan Wanders', 'Robin Jalving', 'Jens Joldersma',
      'Jurrian Lanjouw', 'Sil Wanders', 'Jurjen Fietje', 'Pieter IJzerman', 'Dennis Korterink',
      'Kyano Fietje', 'Tim Schepers', 'Matthijs Landman', 'Colin Schuurhuis', 'Bart Slomp',
      'Stan Schepers', 'Tim Veenstra',
    ],
  },
  {
    slug: 'svv04-2',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/Selectie.jpg',
    players: [
      'Bert Schoemakers', 'Jos Schaart', 'Sam Ridderman', 'Kevin Poker', 'Edwin Bergink',
      'Luca Sibon', 'Laurens Grobbe', 'Robbin Hanken', 'Sander Kocks', 'Ian Verschoor',
      'Jesse Lubbers', 'Koen Schepers', 'Arjen Kocks', 'Jeroen Drenthen', 'Cheik Ndir',
      'Dennis Bos', 'Sander Wemmenhove', 'Bennie Eikens', 'Arjan van Veen', 'Daan Finke',
      'Stef Rotmensen', 'Stan Sibon', 'Maikel Bunskoek', 'Thijmen Mittendorff', 'Dion Tuinier',
      'Jarno Wesseling', 'Ruben Pat', 'Dusán Muskee', 'Jesse Jalving', 'Rick Piek',
      'Joris Kusters', 'Ron Bunskoek', 'Jan Wanders',
    ],
  },
  {
    slug: 'svv04-3',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/3e%20zondag%202.JPG',
    players: [
      'Marco van Es', 'René Elzing', 'Frank Klaassen', 'Jeroen Kerkdijk', 'Mark Lit',
      'Dennis Blaauwgeers', 'Jeroen Klingenberg', 'Gerjan Gommer', 'Peter Boekhorst',
      'Gerwin Wesselink', 'Mark Kuipers', 'Stephan Bos', 'Michel Kerkdijk',
    ],
  },
  {
    slug: 'svv04-4',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/4e.JPG',
    players: [
      'Tonnie Vleems', 'Lars Veenstra', 'Erwin Steffens', 'Giovanni Striper', 'Michel Kroezen',
      'Nick Schepers', 'André Pat', 'Gerrit Hulleman', 'Erik Slomp', 'Gerko van Leeuwen',
      'Luuk Anbergen', 'Niek Lubbers', 'Nick Pat', 'Frank van Ommen', 'Vicenzo Striper',
      'Timo Hidding', 'Jordy Bunskoek', 'Robin Hubers', 'Nico Hidding',
    ],
  },
  {
    slug: 'svv04-1-futsal',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/Zaalteam1.jpg',
    players: [
      'Wouter van den Bosch', 'Sam Ridderman', 'Edwin Bergink', 'Matthijs Landman',
      'Lars Koopmeiners', 'Bart Slomp', 'Harko Elzing', 'Sander Kocks', 'Jim Ramaker',
    ],
  },
  {
    slug: 'svv04-vr18-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/Dames.JPG',
    players: [
      'Roy Wesseling', 'Jolande Tuinier', 'Natasja Muskee', 'Denise Hemmes', 'Monika Hilberts',
      'Nicole Scherpers', 'Fleur Sewüster', 'Hilde Fernhout', 'Lars Veenstra', 'Ilona Prins',
      'Samenda Keen', 'Britt Bakker', 'Carolien Fernhout', 'Henriette Dijks', 'Marit Poker',
      'Joyce Visser', 'Alice Heijnen', 'Nancy Vleems',
    ],
  },
  {
    slug: 'svv04-35-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/35+1.JPG',
    players: [
      'Bert-Jan Klaassen', 'Gerko van Leeuwen', 'Marco van Es', 'René Elzing', 'Frank Klaassen',
      'Jeroen Kerkdijk', 'Erwin Steffens', 'Hielke Jan Meppelink', 'Stephan Bos',
      'Jeroen Klingenberg', 'Gerwin Wesselink', 'Michel Kroezen', 'Mark Kuipers',
    ],
  },
  {
    slug: 'svv04-45-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/45+%201.JPG',
    players: [
      'Barry Jonkers', 'Alberto Slagter', 'Gerrit Hulleman', 'André Pat', 'Nico Hidding',
      'Michel Kroezen', 'Gerko van Leeuwen',
    ],
  },
  {
    slug: 'svv04-o21-1',
    photoUrl: null,
    players: [],
  },
  {
    slug: 'svv04-jo19-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO19.JPG',
    players: [
      'Jim Ramaker', 'Luca Sibon', 'Twan Klaassen', 'Maarten Geerts', 'Thijmen Mittendorff',
      'Tygo Wegkamp', 'Jan Willem Lambers', 'Koen Schepers', 'Luuk Lubbers', 'Matthijs Landman',
      'Justin Staal', 'Lasse van Herk', 'Stan van den Bosch', 'Sander Schonewille',
      'Kyano Fietje', 'Bjorn Heijnen', 'Koen Bosman', 'Marijn de Bruin', 'Anno Pat',
    ],
  },
  {
    slug: 'svv04-jo17-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO17-1.JPG',
    players: [
      'Bart Slomp', 'Davey Rotmensen', 'Bernd van der Laan', 'Patrick Scherpen',
      'Bart-Jan Boeren', 'Liam Hilberts', 'Sam Berends', 'Stijn ten Have', 'Yoeri Vriesema',
      'Sander Geerts', 'Joris Bosman', 'Collin de Jonge', 'Tieme Rotmensen', 'Daniël Hans',
    ],
  },
  {
    slug: 'svv04-jo15-1jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO15-1.JPG',
    players: [
      'Lars Heijnen', 'Brandon Joesten', 'Kyan de Wolde', 'Nick Klement', 'Quinten Horsman',
      'Dylan Knuppe', 'Bas IJzendoorn', 'Aiden Geertsema', 'Daan Hidding', 'Leon van der Meij',
      'Jarno Boxum', 'Mees Berends', 'Melle van Herk', 'Argenys Mambre',
    ],
  },
  {
    slug: 'svv04-jo15-2jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO15-2.JPG',
    players: [
      'Edvard Muncsan', 'Jesper Horring', 'Tom Slagter', 'Lars Heijnen', 'Hessel Pat',
      'Wesley Kroes', 'Jayden de Jonge', 'Xander Post',
    ],
  },
  {
    slug: 'svv04-jo13-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO13.JPG',
    players: [
      'Timo Hidding', 'Révin Rikken', 'Ruben Hulsink', 'Merijn Steffens', 'Wilfred Drenthen',
      'Teun van Leeuwen', 'Tim Snel', 'Vigo Snijders', 'Nick Schepers', 'Luuk Klingenberg',
      'Max Beije', 'Thom Klaassen', 'Niek Ensink', 'Jasper Drenthen', 'Quinten Joesten',
      'Rafaël Horsman', 'Dyon Jonkers', 'Stan Unij',
    ],
  },
  {
    slug: 'svv04-jo12-1jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO12-1.JPG',
    players: [
      'Jordy Bunskoek', 'Lorenzo Lübbers', 'Isabel Hans', 'Nim Lippold', 'Reinout Hulsink',
      'Marco Boeren', 'Ralph Hulsink', 'Jayson Tapper', 'Noel Hilberts', 'Lars Jansema',
      'Guy Aburto Aguilar', 'Boudewijn Boeren', 'Bas Klement',
    ],
  },
  {
    slug: 'svv04-jo11-1jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO-11.JPG',
    players: [
      'Timon Maatje', 'Max Snel', 'Julia van der Meer', 'Niels Slomp', 'Puck Meerstadt',
      'Laurens de Wolde', 'Jari Klingenberg', 'Noud Klaassen', 'Victor Heijnen',
      'Teun Menke', 'Moos Maatje', 'Jaron de Wolde',
    ],
  },
  {
    slug: 'svv04-jo10-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO10-1.JPG',
    players: [
      'Gerjan Gommer', 'Jens Pruim', 'Dani Dijks', 'Melle Gommer', 'Bjorn Heijnen',
      'Noah Meijering', 'Jari Hoff', 'Huub Hidding', 'Siem van Leeuwen', 'Ruben Been',
    ],
  },
  {
    slug: 'svv04-jo9-1',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO9-1.JPG',
    players: [
      'Stijn Anholts', 'Roos Meijering', 'Nathan Benjamins', 'Rick Gommer', 'Jaron Gommer',
      'Thijs Unij', 'Lewis Jipping', 'Emiel Been', 'Vince Hijlkema',
    ],
  },
  {
    slug: 'svv04-jo9-2jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO9-2.JPG',
    players: [
      'Marchiel Gijlers', 'Cas Lambers', 'Daan Gijlers', 'Thijs van de Vrede',
      'Emanuel Landman', 'Lize Beugelink', 'Boaz van de Vrede', 'Jayden van der Boor', 'Niek Wubs',
    ],
  },
  {
    slug: 'svv04-jo9-3jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO9-3.JPG',
    players: [
      'Dennis Blaauwgeers', 'Flynn Boes', 'Abel Gommer', 'Stan Kuipers', 'Anne de Jonge',
      'Yara Gommer', 'Jari de Jonge', 'James Hans', 'Stef Scherpen', 'Thijmen Blaauwgeers',
    ],
  },
  {
    slug: 'svv04-jo8-1jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO8-1%202.JPG',
    players: [
      'Stijn Anholts', 'Roos Meijering', 'Nathan Benjamins', 'Rick Gommer', 'Jaron Gommer',
      'Thijs Unij', 'Lewis Jipping', 'Emiel Been', 'Vince Hijlkema',
    ],
  },
  {
    slug: 'svv04-jo7-1jm',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO7-1.JPG',
    players: [
      'Pieter IJzerman', 'Joy IJzerman', 'Joris Vrieling', 'Michel Kerkdijk',
      'Daley Kerkdijk', 'Melle Rorijs', 'Quinn Kerkdijk',
    ],
  },
  {
    slug: 'svv04-jo7-2',
    photoUrl: 'https://www.svv04.nl/web2022/images/Teams2025-2026/JO7-2.JPG',
    players: [
      'Julius Kerkdijk', 'Teun Kuipers', 'Martijn Kerkdijk', 'Thijn Gommer',
      'Jesper Blaauwgeers', 'Remke Blaauwgeers',
    ],
  },
]

async function importTeamData() {
  const payload = await getPayload({ config })

  for (const team of teamData) {
    // Find team by slug
    const found = await payload.find({
      collection: 'teams',
      where: { slug: { equals: team.slug } },
    })

    if (!found.docs.length) {
      console.log(`⚠ Team not found: ${team.slug}`)
      continue
    }

    const teamDoc = found.docs[0]
    const updateData: Record<string, unknown> = {}

    // Upload photo if available
    if (team.photoUrl) {
      try {
        const response = await fetch(team.photoUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const buffer = Buffer.from(await response.arrayBuffer())
        const rawFilename = decodeURIComponent(team.photoUrl.split('/').pop() ?? 'team-photo.jpg')
        const filename = rawFilename.replace(/\s+/g, '-').toLowerCase()
        const mimetype = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

        const media = await payload.create({
          collection: 'media',
          data: { alt: `${teamDoc.name} teamfoto` },
          file: { data: buffer, mimetype, name: filename, size: buffer.length },
        })

        updateData.photo = media.id
        console.log(`  📷 Uploaded photo for ${teamDoc.name}`)
      } catch (err) {
        console.log(`  ✗ Photo failed for ${teamDoc.name}: ${err}`)
      }
    }

    // Set players
    if (team.players.length > 0) {
      updateData.players = team.players.join(', ')
    }

    if (Object.keys(updateData).length > 0) {
      await payload.update({ collection: 'teams', id: teamDoc.id, data: updateData })
      console.log(`✓ ${teamDoc.name}`)
    }
  }

  console.log('\nDone.')
  process.exit(0)
}

importTeamData().catch((err) => {
  console.error(err)
  process.exit(1)
})
