import type { SocialSchedule, SocialTeamGroup } from './data'

export type PosterFormat = 'story' | 'post'

export const POSTER_DIMENSIONS: Record<PosterFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
}

const COLORS = {
  bg: '#161616',
  primary: '#cc0000',
  white: '#ffffff',
  dark: '#1a1a1a',
  muted: '#6b6b6b',
  cardBorder: '#eaeaea',
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

// Pixel heights of one venue group's parts at scale 1, matching the JSX below.
// The venue label is a plain text line above the white block (not a filled
// header bar attached to it), so it costs far less height than a card header.
const GROUP_LABEL_PX = 46
const CARD_ROW_PX = 116
// A quiet day (few matches total) has plenty of room, so rows switch to a
// bigger, centered "match card" style (logo above name, both sides) instead
// of the compact table row — mirrors the site's own MatchCard component.
const CARD_ROW_PX_BIG = 250
const BIG_STYLE_MAX_MATCHES = 4
const CARD_GAP_PX = 64
const CARD_GAP_PX_BIG = 56
const CONTENT_TOP_PAD_PX = 20

// The floor pagination will shrink text to before splitting into another
// page. 0.75 let a busy single day cram down to a noticeably small scale
// instead of just splitting — raised so it reaches for another page sooner.
const MIN_SCALE = 0.85
const HEADER_HEIGHT: Record<PosterFormat, number> = { story: 440, post: 300 }
const FOOTER_HEIGHT = 80
const OUTER_PADDING: Record<PosterFormat, number> = { story: 64, post: 48 }

function totalMatchCount(groups: SocialTeamGroup[]) {
  return groups.reduce((sum, g) => sum + g.rows.length, 0)
}

/** Height (at scale 1) of the stacked venue groups (label + white block). */
function contentHeight1x(
  groups: SocialTeamGroup[],
  rowPx: number = CARD_ROW_PX,
  gapPx: number = CARD_GAP_PX,
) {
  const cardsHeight = groups.reduce((sum, g) => sum + GROUP_LABEL_PX + g.rows.length * rowPx, 0)
  const gaps = Math.max(0, groups.length - 1) * gapPx
  return cardsHeight + gaps + CONTENT_TOP_PAD_PX
}

function contentBudget(format: PosterFormat) {
  const { height } = POSTER_DIMENSIONS[format]
  return height - HEADER_HEIGHT[format] - FOOTER_HEIGHT - OUTER_PADDING[format]
}

/**
 * A poster canvas is fixed-size (satori doesn't scroll or auto-shrink), so a
 * busy day can outgrow one image. Rather than shrinking text past a legible
 * size or dropping teams, we split the stacked column across as many pages
 * as needed and render one Poster per page.
 *
 * Prefers splitting between whole groups (e.g. "thuis" on one page,
 * "Uitwedstrijden" on the next) over splitting a single group's rows across
 * pages — a mid-group cut is only used when that group alone still doesn't
 * fit on one page even by itself, since otherwise there'd be no way to fit
 * it at all. A group that does span a page break repeats its label on each
 * page it appears on.
 *
 * Finds the smallest page count that fits, then picks the split (order
 * preserved — matches never reorder) that minimizes the tallest page, via DP
 * over "split first i rows into j pages" restricted to allowed cut points.
 * A naive greedy fill (add rows until a running total is exceeded) can stop
 * the first page early and then be forced to dump everything else onto the
 * last page once the page budget is used up — this searches all split
 * points instead.
 */
export function paginateTeamGroups(
  teamGroups: SocialTeamGroup[],
  format: PosterFormat,
  bigStyle: boolean,
): SocialTeamGroup[][] {
  const rowPx = bigStyle ? CARD_ROW_PX_BIG : CARD_ROW_PX
  const gapPx = bigStyle ? CARD_GAP_PX_BIG : CARD_GAP_PX

  const groupStart: number[] = []
  const rowGroup: number[] = []
  let cursor = 0
  for (let g = 0; g < teamGroups.length; g++) {
    groupStart.push(cursor)
    for (let r = 0; r < teamGroups[g].rows.length; r++) rowGroup.push(g)
    cursor += teamGroups[g].rows.length
  }
  const n = rowGroup.length
  if (n === 0) return [[]]

  const maxHeightAtMinScale = contentBudget(format) / MIN_SCALE

  // Height of a page spanning rows [start, end) — touches every group that
  // has at least one row in that range, whether full or partial.
  const heightOf = (start: number, end: number) => {
    const gStart = rowGroup[start]
    const gEnd = rowGroup[end - 1]
    const touchedGroups = gEnd - gStart + 1
    return (
      touchedGroups * GROUP_LABEL_PX +
      (end - start) * rowPx +
      (touchedGroups - 1) * gapPx +
      CONTENT_TOP_PAD_PX
    )
  }

  // A cut before row index p is allowed if it falls on a real group boundary,
  // or if the group it would cut into doesn't fit on a page by itself anyway
  // (so splitting it is the only way to fit it at all).
  const groupWholeHeight = (g: number) =>
    GROUP_LABEL_PX + teamGroups[g].rows.length * rowPx + CONTENT_TOP_PAD_PX
  const isAllowedCut = (p: number) =>
    rowGroup[p - 1] !== rowGroup[p] || groupWholeHeight(rowGroup[p]) > maxHeightAtMinScale

  const buildPages = (splits: number[]): SocialTeamGroup[][] =>
    splits.slice(0, -1).map((start, i) => {
      const end = splits[i + 1]
      const gStart = rowGroup[start]
      const gEnd = rowGroup[end - 1]
      const pageGroups: SocialTeamGroup[] = []
      for (let g = gStart; g <= gEnd; g++) {
        const group = teamGroups[g]
        const sliceStart = Math.max(0, start - groupStart[g])
        const sliceEnd = Math.min(group.rows.length, end - groupStart[g])
        pageGroups.push({ ...group, rows: group.rows.slice(sliceStart, sliceEnd) })
      }
      return pageGroups
    })

  for (let pageCount = 1; pageCount <= n; pageCount++) {
    // dp[i][j] = min possible (max page height) splitting the first i rows into j pages
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(pageCount + 1).fill(Infinity))
    const splitAt: number[][] = Array.from({ length: n + 1 }, () => Array(pageCount + 1).fill(-1))
    dp[0][0] = 0

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= Math.min(pageCount, i); j++) {
        for (let m = j - 1; m < i; m++) {
          if (m !== 0 && !isAllowedCut(m)) continue
          if (dp[m][j - 1] === Infinity) continue
          const candidateMax = Math.max(dp[m][j - 1], heightOf(m, i))
          if (candidateMax < dp[i][j]) {
            dp[i][j] = candidateMax
            splitAt[i][j] = m
          }
        }
      }
    }

    if (dp[n][pageCount] <= maxHeightAtMinScale) {
      const splits: number[] = [n]
      let i = n
      let j = pageCount
      while (j > 0) {
        const m = splitAt[i][j]
        splits.unshift(m)
        i = m
        j -= 1
      }
      return buildPages(splits)
    }
  }

  return buildPages([0, n])
}

function ClubLogo({
  clubcode,
  name,
  scale,
  baseSize = 56,
}: {
  clubcode: string | undefined
  name: string
  scale: number
  baseSize?: number
}) {
  const size = baseSize * scale
  if (!clubcode) {
    return (
      <div
        style={{
          display: 'flex',
          width: size,
          height: size,
          borderRadius: 6 * scale,
          backgroundColor: '#e5e5e5',
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <img
      src={`https://logoapi.voetbal.nl/logo.php?clubcode=${clubcode}`}
      alt={name}
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0 }}
    />
  )
}

function CompactMatchRow({
  row,
  scale,
  isFirst,
}: {
  row: SocialTeamGroup['rows'][number]
  scale: number
  isFirst: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: `${24 * scale}px ${24 * scale}px`,
        borderTop: isFirst ? 'none' : `1px solid ${COLORS.cardBorder}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          gap: 16 * scale,
          minWidth: 0,
        }}
      >
        <ClubLogo clubcode={row.homeTeamClubcode} name={row.homeTeam} scale={scale} baseSize={64} />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', minWidth: 0 }}>
          <span
            style={{
              display: 'flex',
              textAlign: 'center',
              fontFamily: 'Outfit',
              fontWeight: 600,
              fontSize: 34 * scale,
              color: row.isOwnHome ? COLORS.primary : COLORS.dark,
            }}
          >
            {row.homeTeam}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          padding: `0 ${16 * scale}px`,
        }}
      >
        <span
          style={{
            display: 'flex',
            fontFamily: 'Outfit',
            fontWeight: 700,
            fontSize: 30 * scale,
            color: COLORS.dark,
            border: '2px solid #ddd',
            borderRadius: 8 * scale,
            padding: `${8 * scale}px ${16 * scale}px`,
          }}
        >
          {row.time}
        </span>
        {row.cancelled && (
          <span
            style={{
              display: 'flex',
              marginTop: 4 * scale,
              fontFamily: 'Outfit',
              fontWeight: 600,
              fontSize: 16 * scale,
              color: COLORS.primary,
              letterSpacing: 0.5,
            }}
          >
            AFGELAST
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'center',
          flex: 1,
          gap: 16 * scale,
          minWidth: 0,
        }}
      >
        <ClubLogo clubcode={row.awayTeamClubcode} name={row.awayTeam} scale={scale} baseSize={64} />
        <div style={{ display: 'flex', flex: 1, justifyContent: 'center', minWidth: 0 }}>
          <span
            style={{
              display: 'flex',
              textAlign: 'center',
              fontFamily: 'Outfit',
              fontWeight: 600,
              fontSize: 34 * scale,
              color: row.isOwnHome ? COLORS.dark : COLORS.primary,
            }}
          >
            {row.awayTeam}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Bigger, centered match row for quiet days — mirrors the site's own
 * MatchCard component (logo above name, both sides, time in the middle).
 * Sits inside a shared venue group, so it carries no venue text of its own. */
function BigMatchRow({
  row,
  scale,
  isFirst,
}: {
  row: SocialTeamGroup['rows'][number]
  scale: number
  isFirst: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${28 * scale}px ${24 * scale}px`,
        borderTop: isFirst ? 'none' : `1px solid ${COLORS.cardBorder}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          gap: 16 * scale,
          minWidth: 0,
        }}
      >
        <ClubLogo clubcode={row.homeTeamClubcode} name={row.homeTeam} scale={scale} baseSize={130} />
        <span
          style={{
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'Outfit',
            fontWeight: 700,
            fontSize: 34 * scale,
            color: row.isOwnHome ? COLORS.primary : COLORS.dark,
          }}
        >
          {row.homeTeam}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          gap: 10 * scale,
          padding: `0 ${20 * scale}px`,
        }}
      >
        <span
          style={{
            display: 'flex',
            fontFamily: 'Outfit',
            fontWeight: 700,
            fontSize: 38 * scale,
            color: COLORS.dark,
            border: '2px solid #ddd',
            borderRadius: 8 * scale,
            padding: `${10 * scale}px ${20 * scale}px`,
          }}
        >
          {row.time}
        </span>
        {row.cancelled && (
          <span
            style={{
              display: 'flex',
              fontFamily: 'Outfit',
              fontWeight: 600,
              fontSize: 16 * scale,
              color: COLORS.primary,
              letterSpacing: 0.5,
            }}
          >
            AFGELAST
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          gap: 16 * scale,
          minWidth: 0,
        }}
      >
        <ClubLogo clubcode={row.awayTeamClubcode} name={row.awayTeam} scale={scale} baseSize={130} />
        <span
          style={{
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: 'Outfit',
            fontWeight: 700,
            fontSize: 34 * scale,
            color: row.isOwnHome ? COLORS.dark : COLORS.primary,
          }}
        >
          {row.awayTeam}
        </span>
      </div>
    </div>
  )
}

/** One venue's matches: its name (+ plaats) as a plain white label sitting
 * above the card — not inside it — followed by a white block of contiguous
 * match rows (no gap between rows of the same venue). */
function VenueGroup({
  group,
  scale,
  bigStyle,
}: {
  group: SocialTeamGroup
  scale: number
  bigStyle: boolean
}) {
  const radius = 14 * scale
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 * scale }}>
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          fontSize: 30 * scale,
          letterSpacing: 1,
          color: COLORS.white,
          textTransform: 'uppercase',
        }}
      >
        {group.venuePlaats ? `${group.label}, ${group.venuePlaats}` : group.label}
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLORS.white,
          borderRadius: radius,
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
        }}
      >
        {group.rows.map((row, i) =>
          bigStyle ? (
            <BigMatchRow key={row.matchCode} row={row} scale={scale} isFirst={i === 0} />
          ) : (
            <CompactMatchRow key={row.matchCode} row={row} scale={scale} isFirst={i === 0} />
          ),
        )}
      </div>
    </div>
  )
}

/** Whether a day (its full, unpaginated match list) should use the bigger
 * "match card" style — must be decided from the whole day, not a single
 * page's slice, so every page of a busy day stays consistently compact. */
export function shouldUseBigStyle(allDayGroups: SocialTeamGroup[]) {
  return totalMatchCount(allDayGroups) <= BIG_STYLE_MAX_MATCHES
}

export function Poster({
  schedule,
  format,
  logoDataUri,
  bigStyle,
}: {
  schedule: SocialSchedule
  format: PosterFormat
  logoDataUri: string
  bigStyle: boolean
}) {
  const { width, height } = POSTER_DIMENSIONS[format]
  const headerHeight = HEADER_HEIGHT[format]
  const outerPadding = OUTER_PADDING[format]
  const idealHeight = Math.max(
    contentHeight1x(
      schedule.teamGroups,
      bigStyle ? CARD_ROW_PX_BIG : CARD_ROW_PX,
      bigStyle ? CARD_GAP_PX_BIG : CARD_GAP_PX,
    ),
    1,
  )
  const scale = clamp(contentBudget(format) / idealHeight, MIN_SCALE, 1)
  // Fixed size regardless of content scale — the header must look identical
  // across every page/day of the same format, not shrink on busier days.
  const logoHeight = format === 'story' ? 150 : 110
  const logoWidth = logoHeight * 0.827

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width,
        height,
        backgroundColor: COLORS.bg,
        position: 'relative',
        fontFamily: 'Outfit',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: headerHeight,
          justifyContent: 'center',
          gap: 14,
          padding: `0 ${outerPadding}px`,
        }}
      >
        <img src={logoDataUri} width={logoWidth} height={logoHeight} />
        <span
          style={{
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            fontSize: format === 'story' ? 70 : 54,
            letterSpacing: 2,
            color: COLORS.white,
            textTransform: 'uppercase',
          }}
        >
          Wedstrijdprogramma
        </span>
        <span
          style={{
            display: 'flex',
            fontFamily: 'Outfit',
            fontWeight: 600,
            fontSize: format === 'story' ? 32 : 27,
            color: COLORS.white,
            backgroundColor: COLORS.primary,
            padding: '10px 30px',
            borderRadius: 999,
            letterSpacing: 0.5,
          }}
        >
          {schedule.periodLabel.toUpperCase()}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          gap: (bigStyle ? CARD_GAP_PX_BIG : CARD_GAP_PX) * scale,
          padding: `${20 * scale}px ${outerPadding}px`,
        }}
      >
        {schedule.teamGroups.map((group) => (
          <VenueGroup key={group.label} group={group} scale={scale} bigStyle={bigStyle} />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0 20px',
          gap: 4,
        }}
      >
        <span
          style={{
            fontFamily: 'Outfit',
            fontWeight: 400,
            fontSize: 20,
            color: COLORS.muted,
            letterSpacing: 1,
          }}
        >
          svv04.nl
        </span>
      </div>
    </div>
  )
}
