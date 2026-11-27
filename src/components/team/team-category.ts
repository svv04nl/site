// The bond keeps no standings, results or form for the youngest teams: their competition is a
// means for playing and learning, not a goal. Their page shows the schedule and the poule only.
const NO_STANDINGS = ['Onder 7', 'Onder 8', 'Onder 9', 'Onder 10', 'Onder 11', 'Onder 12']

export const hasStandings = (category?: string | null) =>
  !category || !NO_STANDINGS.includes(category)
