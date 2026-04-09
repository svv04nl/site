import { getPayload } from 'payload'
import config from '@payload-config'

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function lexicalDoc(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        children: [
          { type: 'text', format: 0, style: '', mode: 'normal', text, version: 1, detail: 0 },
        ],
      })),
    },
  }
}

const posts = [
  {
    title: "SVV'04 1 wint overtuigend van ZZVV",
    excerpt:
      'Een sterke collectieve prestatie leidde zaterdagmiddag tot een verdiende 4-1 overwinning op ZZVV. De ploeg staat nu stevig in de middenmoot.',
    publishedAt: '2026-03-22T16:00:00.000Z',
    content: lexicalDoc([
      "Zaterdagmiddag ontving SVV'04 1 ZZVV op Sportpark De Uithoorn. In een wedstrijd die lang spannend bleef, trok SVV'04 uiteindelijk aan het langste eind dankzij een sterk tweede helft.",
      'De openingstreffer viel na twintig minuten spelen. Een hoekschop werd verlengd door de tweede paal en belandde via de achterlijn alsnog in het net. ZZVV reageerde fel en trok de stand gelijk vlak voor rust.',
      "Na de hervatting nam SVV'04 het heft in handen. Drie goals in twintig minuten maakten het verschil duidelijk. Trainer Bert Schoemakers was na afloop tevreden: 'We hebben laten zien dat we als team kunnen knokken en de wedstrijd naar ons toe kunnen trekken.'",
      'De volgende thuiswedstrijd staat gepland voor zaterdag 5 april. Kom de ploeg steunen!',
    ]),
  },
  {
    title: 'Klaverjastoernooi in de kantine op zaterdag 28 maart',
    excerpt:
      "Op zaterdag 28 maart organiseert SVV'04 een gezellig klaverjastoernooi in de kantine. Inschrijven kan tot en met vrijdag 27 maart.",
    publishedAt: '2026-03-18T10:00:00.000Z',
    content: lexicalDoc([
      "SVV'04 organiseert op zaterdag 28 maart een gezellig klaverjastoernooi in de kantine van Sportpark De Uithoorn. De deuren gaan open om 13:30 uur en het toernooi start om 14:00 uur.",
      'Iedereen is welkom, van doorgewinterde klaverjasser tot beginner. Er zijn leuke prijzen te winnen en uiteraard zorgen we voor koffie, thee en een hapje.',
      'Inschrijven kan tot en met vrijdag 27 maart via de kantine of door een berichtje te sturen naar de penningmeester. Deelname kost €5,- per persoon.',
      'We hopen op een grote opkomst en een gezellige middag!',
    ]),
  },
  {
    title: "Vrijwilligers gezocht bij SVV'04",
    excerpt:
      "SVV'04 is op zoek naar enthousiaste vrijwilligers voor diverse taken rondom de club. Heb jij een paar uur per week te besteden? Meld je aan!",
    publishedAt: '2026-03-15T09:00:00.000Z',
    content: lexicalDoc([
      "SVV'04 draait op de inzet van haar vrijwilligers. Van kantine tot veldonderhoud, van scheidsrechtersbegeleiding tot activiteiten voor de jeugd — zonder vrijwilligers staat de club stil.",
      'Op dit moment zijn we op zoek naar versterking op een aantal fronten: bardienst in de kantine (zaterdags en zondags), begeleiding bij jeugdteams, onderhoud van de kleedkamers en velden, en hulp bij het organiseren van evenementen.',
      'Je hoeft geen voetbalkennis te hebben. Enthousiasme en een paar uur per week is voldoende. In ruil krijg je een warm welkom, nieuwe contacten en de voldoening van bijdragen aan een mooie club.',
      'Interesse? Neem contact op via het contactformulier op de website of spreek een van onze bestuursleden aan op de club.',
    ]),
  },
  {
    title: 'Oud papieractie vrijdag 20 maart',
    excerpt:
      "Op vrijdag 20 maart houdt SVV'04 haar halfjaarlijkse oud papieractie. Zet uw papier en karton klaar voor de deur, wij zorgen voor de rest.",
    publishedAt: '2026-03-12T08:00:00.000Z',
    content: lexicalDoc([
      "Op vrijdag 20 maart houdt SVV'04 haar halfjaarlijkse oud papieractie in Schoonebeek en omgeving. De opbrengst komt volledig ten goede aan de jeugdafdeling van de club.",
      'Wilt u meehelpen? Zet uw gebundeld oud papier en karton vóór 08:00 uur aan de stoeprand. Onze vrijwilligers rijden de wijk door vanaf vroeg in de ochtend.',
      'Heeft u grote hoeveelheden of wilt u ophaling op een specifiek tijdstip? Neem dan contact op via de clubtelefoon zodat we hier rekening mee kunnen houden.',
      "Alvast bedankt voor uw bijdrage aan de jeugd van SVV'04!",
    ]),
  },
  {
    title: 'Jeugdtoernooi op Sportpark De Uithoorn',
    excerpt:
      "Op zaterdag 19 april organiseert SVV'04 een groot jeugdtoernooi voor de categorieën JO9 t/m JO13. Meer dan 20 teams doen mee.",
    publishedAt: '2026-03-10T11:00:00.000Z',
    content: lexicalDoc([
      "Mark de datum: op zaterdag 19 april 2026 organiseert SVV'04 haar jaarlijkse jeugdtoernooi op Sportpark De Uithoorn. Dit jaar doen er meer dan twintig teams mee uit de regio.",
      'Het toernooi is open voor de categorieën JO9, JO10, JO11, JO12 en JO13. Per categorie worden poules gespeeld, gevolgd door knock-outronden. De finales staan gepland voor het einde van de middag.',
      'Voor de sfeer zorgen een springkussen, kraampjes met hapjes en drankjes, en een muziekinstallatie. Uiteraard is ook de kantine de hele dag open.',
      'Teams die zich nog willen aanmelden kunnen dat doen via het inschrijfformulier op de website. Vol is vol!',
    ]),
  },
  {
    title: 'JO19 wint de beker na spannende penaltyserie',
    excerpt:
      "De JO19 van SVV'04 heeft zaterdagavond de bekerfinale gewonnen na een zenuwslopende penaltyserie. Een historische avond voor de jeugdafdeling.",
    publishedAt: '2026-03-08T19:00:00.000Z',
    content: lexicalDoc([
      "Het was een avond om nooit te vergeten voor de JO19 van SVV'04. In de bekerfinale, gespeeld op neutraal terrein in Coevorden, troffen zij leeftijdsgenoten van VKW. Na negentig minuten stond het 2-2.",
      "In de verlenging scoorde beide teams niet, waarna de beslissing moest vallen via een penaltyserie. Na vijf beurten per ploeg bleef het gelijk, waarna de keepers ook een penalty namen. De keeper van SVV'04, Jim Ramaker, schoot zijn penalty koelbloedig binnen en redde daarna de laatste inzet van de tegenstander.",
      "De vreugde bij spelers, staf en supporters was grenzeloos. Trainer Lars Veenstra: 'Dit is de beloning voor een heel jaar hard werken. Ik ben ongelofelijk trots op deze groep jongens.'",
      'De beker wordt zondag 9 maart gepresenteerd bij de clubkantine. Iedereen is welkom om te komen feliciteren!',
    ]),
  },
  {
    title: 'Bestuursvergadering 31 maart: verslag',
    excerpt:
      "Op 31 maart vergaderde het bestuur van SVV'04 over de plannen voor het nieuwe seizoen, de financiën en de renovatie van kleedkamer 3.",
    publishedAt: '2026-03-31T20:00:00.000Z',
    content: lexicalDoc([
      "Op maandagavond 31 maart vergaderde het voltallige bestuur van SVV'04. Op de agenda stonden onder meer de voorbereiding op het nieuwe seizoen, de financiële stand van zaken en de geplande renovatie van kleedkamer 3.",
      'Het bestuur heeft besloten om in het nieuwe seizoen te investeren in nieuwe trainingspakken voor alle jeugdteams. De sponsorcommissie is inmiddels bezig met het werven van een hoofdsponsor hiervoor.',
      'Wat betreft de kleedkamers: de renovatie van kleedkamer 3 staat gepland voor augustus 2026, tijdens de zomerstop. Vrijwilligers die willen helpen kunnen zich aanmelden via de club.',
      'De volgende bestuursvergadering staat gepland op 14 april. Leden die een punt op de agenda willen zetten kunnen dit melden bij de secretaris.',
    ]),
  },
  {
    title: 'Walking Football dames organiseert eerste vrouwentoernooi van het noorden',
    excerpt:
      "Op donderdag 23 april organiseren de Walking Football-vrouwen van SVV'04 het eerste vrouwentoernooi van het noorden. Vijf tot zes teams strijden om de P van Plezier.",
    publishedAt: '2026-03-28T10:00:00.000Z',
    content: lexicalDoc([
      "Op donderdag 23 april 2026 organiseren de Walking Football-vrouwen van SVV'04 het eerste vrouwentoernooi van het noorden. Met vijf tot zes teams wordt er gestreden om de P van Plezier, waarbij sportiviteit en gezelligheid centraal staan.",
      "Na eerdere toernooien bij Heracles Almelo is het nu voor het eerst een thuiseditie. De start is rond half elf, vrijwilligers zijn geregeld en supporters zijn van harte welkom. Een mooie mijlpaal voor het vrouwen walking football bij SVV'04!",
      'Aanmelden als team kan nog tot 10 april via de website. Individuele deelnemers zijn ook welkom en worden ingedeeld bij een bestaand team.',
    ]),
  },
  {
    title: 'Nieuwe trainingspakken voor alle jeugdteams',
    excerpt:
      "Dankzij een genereuze sponsorbijdrage kunnen alle jeugdteams van SVV'04 dit seizoen rekenen op nieuwe trainingspakken in de clubkleuren.",
    publishedAt: '2026-03-05T09:00:00.000Z',
    content: lexicalDoc([
      "Groot nieuws voor de jeugdafdeling van SVV'04: alle jeugdteams krijgen dit seizoen nieuwe trainingspakken. Dit is mogelijk gemaakt dankzij een flinke bijdrage van een lokale sponsor.",
      'De pakken zijn in de vertrouwde clubkleuren paars en wit, voorzien van het clublogo en de naam van de sponsor. Verwacht wordt dat de pakken voor aanvang van het volgende seizoen worden uitgedeeld.',
      "De sponsorcommissie bedankt de sponsor hartelijk voor deze prachtige bijdrage aan de jeugd van SVV'04.",
    ]),
  },
  {
    title: "SVV'04 VR18+1 begint sterk aan de competitie",
    excerpt:
      "De vrouwenploeg van SVV'04 heeft de eerste drie wedstrijden van de competitie gewonnen. Een veelbelovend begin voor de ploeg van trainer Lars Veenstra.",
    publishedAt: '2026-02-28T15:00:00.000Z',
    content: lexicalDoc([
      "De vrouwenploeg van SVV'04, VR18+1, is uitstekend begonnen aan de nieuwe competitie. In de eerste drie wedstrijden werd telkens gewonnen, met een doelsaldo van 11-3.",
      "Trainer Lars Veenstra is trots op zijn ploeg: 'We hebben goed getraind en dat betaalt zich nu uit. De meiden spelen als een team en dat is het allerbelangrijkste.'",
      'Aanstaande zaterdag wacht de eerstvolgende uitwedstrijd. De ploeg hoopt de goede reeks voort te zetten.',
    ]),
  },
  {
    title: 'Renovatie kleedkamer 3 gestart',
    excerpt:
      'De lang verwachte renovatie van kleedkamer 3 op Sportpark De Uithoorn is officieel gestart. De werkzaamheden worden uitgevoerd door vrijwilligers van de club.',
    publishedAt: '2026-02-20T08:00:00.000Z',
    content: lexicalDoc([
      'Na maanden van voorbereiding is de renovatie van kleedkamer 3 op Sportpark De Uithoorn eindelijk van start gegaan. Een groep enthousiaste vrijwilligers heeft afgelopen zaterdag de eerste sloopwerkzaamheden verricht.',
      'De kleedkamer krijgt nieuwe tegels, douches, bankjes en verlichting. Ook wordt de ventilatie volledig vernieuwd. De verwachting is dat de renovatie binnen zes weken klaar is.',
      'Ben jij handig en wil je helpen? Meld je dan aan via de club. Er zijn met name mensen met schilder- of tegelervaring gezocht.',
    ]),
  },
  {
    title: 'JO13 naar de finale van het Drenthe Cup',
    excerpt:
      'Na drie overtuigende overwinningen in de poule heeft JO13 zich geplaatst voor de finale van de Drenthe Cup. Ze spelen de finale op zaterdag 12 april.',
    publishedAt: '2026-02-15T17:00:00.000Z',
    content: lexicalDoc([
      "Een geweldige prestatie van de JO13 van SVV'04! Na drie overwinningen in de pouleronde, onder andere tegen FC Emmen JO13 en DZOH JO13, hebben de jongens zich geplaatst voor de finale van de Drenthe Cup.",
      'In de halve finale werd met 3-1 gewonnen van Hoogeveen JO13. De jongens waren op alle fronten beter en verdienden de overwinning ruimschoots.',
      'De finale wordt gespeeld op zaterdag 12 april op een nog nader te bepalen locatie. Kom de jongens steunen!',
    ]),
  },
  {
    title: 'Sponsoravond groot succes',
    excerpt:
      "De jaarlijkse sponsoravond van SVV'04 was dit jaar een groot succes. Meer dan 40 sponsoren waren aanwezig en er zijn nieuwe samenwerkingen gesloten.",
    publishedAt: '2026-02-08T20:00:00.000Z',
    content: lexicalDoc([
      "De jaarlijkse sponsoravond van SVV'04 vond afgelopen vrijdagavond plaats in de kantine van Sportpark De Uithoorn. Met meer dan 40 aanwezige sponsoren was het een drukke maar zeer gezellige avond.",
      'Voorzitter Gerrit Hulleman blikte terug op een geslaagd half seizoen en presenteerde de plannen voor de komende jaren. Er werden nieuwe sponsorpakketten gepresenteerd en meerdere bedrijven tekenden direct voor een verlengde samenwerking.',
      'De club bedankt alle sponsoren voor hun steun en kijkt uit naar een mooie verdere samenwerking.',
    ]),
  },
  {
    title: 'Kersttoernooi jeugd: terugblik op een geslaagde editie',
    excerpt:
      "Het jaarlijkse kersttoernooi van SVV'04 trok dit jaar meer dan 200 deelnemers. Een sfeervolle dag voor de jeugd van de club en de regio.",
    publishedAt: '2025-12-28T10:00:00.000Z',
    content: lexicalDoc([
      "Het kersttoernooi van SVV'04, traditioneel gehouden in de week na kerst, was ook dit jaar een groot succes. Meer dan 200 jeugdspelers uit de regio namen deel aan het toernooi op Sportpark De Uithoorn.",
      'Er werd gespeeld in de categorieën JO7 t/m JO13. Alle wedstrijden werden gespeeld in een geweldige sfeer, met veel ouders en supporters langs de lijn.',
      'De organisatie dankt alle vrijwilligers die hebben geholpen bij het toernooi. Zonder jullie was dit evenement niet mogelijk geweest. Tot volgend jaar!',
    ]),
  },
  {
    title: 'Nieuwe website gelanceerd',
    excerpt:
      "SVV'04 heeft een gloednieuwe website gelanceerd. Moderner, sneller en met meer actuele informatie over de club, de teams en het programma.",
    publishedAt: '2025-12-01T09:00:00.000Z',
    content: lexicalDoc([
      "SVV'04 heeft een gloednieuwe website! Na maanden van voorbereiding is de nieuwe site live gegaan. De website is gebouwd met de nieuwste technologie en is volledig mobielvriendelijk.",
      "Op de nieuwe site vind je actuele informatie over alle teams, wedstrijdprogramma's, uitslagen en het laatste nieuws van de club. De site wordt dagelijks bijgewerkt door de communicatiecommissie.",
      'Heb je feedback op de website of mis je bepaalde informatie? Stuur een bericht via het contactformulier. We horen graag wat je ervan vindt!',
    ]),
  },
]

async function seedPosts() {
  const payload = await getPayload({ config })

  // Clear existing posts
  const existing = await payload.find({ collection: 'posts', limit: 200 })
  console.log(`Deleting ${existing.docs.length} existing posts...`)
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'posts', id: doc.id })
  }

  console.log('Seeding posts...')
  for (const post of posts) {
    await payload.create({
      collection: 'posts',
      data: {
        ...post,
        slug: toSlug(post.title),
        status: 'published',
      },
    })
    console.log(`  ✓ ${post.title}`)
  }

  console.log(`\nDone. ${posts.length} posts created.`)
  process.exit(0)
}

seedPosts().catch((err) => {
  console.error(err)
  process.exit(1)
})
