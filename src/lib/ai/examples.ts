// Starting points for the assistant, shared by the website and the app API.

export const EXAMPLES = [
  "Wanneer speelt SVV'04 1 de volgende wedstrijd?",
  'Wat is er dit weekend thuis?',
  'Wat is de stand van de O11-1?',
  'Wie is de trainer van de O13-1?',
  'Hoe word ik lid?',
  'Wat kost de contributie voor een jeugdlid?',
]

// Direct routes for visitors who do not want to type a question.
export const QUICK_LINKS = [
  { label: 'Teams', href: '/teams' },
  { label: 'Programma & uitslagen', href: '/programma' },
  { label: 'Nieuws', href: '/nieuws' },
  { label: 'Agenda', href: '/agenda' },
  { label: 'Contact', href: '/contact' },
  { label: 'Lid worden', href: '/vereniging/lidmaatschap' },
]
