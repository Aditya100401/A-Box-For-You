export type BoxPhase = 'closed' | 'untying'

const BOX = 'oklch(0.54 0.13 15)'
const BOX_LIT = 'oklch(0.6 0.13 15)'
const LID = 'oklch(0.58 0.13 15)'
const RIBBON = 'oklch(0.965 0.04 78)'
const RIBBON_SHADE = 'oklch(0.85 0.06 62)'

/**
 * The ribbon is drawn as real parts — two bow loops, a knot and two tails — so
 * untying can pull the knot, throw the loops off and slide the bands away before
 * the lid ever moves.
 */
export function GiftBoxArt({ phase, size = 320 }: { phase: BoxPhase; size?: number }) {
  const on = phase === 'untying'
  const cls = (part: string) => (on ? `gb__${part} gb__${part}--go` : `gb__${part}`)

  return (
    <svg
      width={size}
      height={(size * 300) / 320}
      viewBox="0 0 320 300"
      className={on ? 'gb gb--untying' : 'gb'}
      role="img"
      aria-label={on ? 'The ribbon comes undone' : 'A wrapped gift box'}
    >
      <defs>
        <linearGradient id="gb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BOX_LIT} />
          <stop offset="70%" stopColor={BOX} />
          <stop offset="100%" stopColor="oklch(0.44 0.12 15)" />
        </linearGradient>
        <linearGradient id="gb-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.64 0.12 15)" />
          <stop offset="100%" stopColor={LID} />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="276" rx="130" ry="14" fill="oklch(0.4 0.03 40 / 0.14)" />

      <g className={cls('body')}>
        <rect x="30" y="120" width="260" height="150" rx="3" fill="url(#gb-body)" />
        <g className={cls('band')}>
          <rect x="144" y="120" width="32" height="150" fill="oklch(0.36 0.08 20 / 0.25)" />
          <rect x="146" y="120" width="28" height="150" fill={RIBBON} />
          <rect x="146" y="120" width="3" height="150" fill={RIBBON_SHADE} opacity="0.55" />
          <rect x="171" y="120" width="3" height="150" fill={RIBBON_SHADE} opacity="0.55" />
        </g>
      </g>

      <g className={cls('lid')}>
        <rect x="16" y="86" width="288" height="44" rx="3" fill="url(#gb-lid)" />
        <g className={cls('lidband')}>
          <rect x="144" y="86" width="32" height="44" fill="oklch(0.36 0.08 20 / 0.25)" />
          <rect x="146" y="86" width="28" height="44" fill={RIBBON} />
          <rect x="146" y="86" width="3" height="44" fill={RIBBON_SHADE} opacity="0.55" />
          <rect x="171" y="86" width="3" height="44" fill={RIBBON_SHADE} opacity="0.55" />
        </g>
      </g>

      {/* Positioning stays on the outer group: a CSS transform on an SVG element
          replaces its transform attribute, which would snap the bow to the origin. */}
      <g transform="translate(160 86)">
      <g className={cls('bow')}>
        <path
          className={cls('tailL')}
          d="M-4 2C-18 16-30 30-26 46C-16 40-6 26 0 10Z"
          fill={RIBBON}
          stroke={RIBBON_SHADE}
          strokeWidth="1"
        />
        <path
          className={cls('tailR')}
          d="M4 2C18 16 30 30 26 46C16 40 6 26 0 10Z"
          fill={RIBBON}
          stroke={RIBBON_SHADE}
          strokeWidth="1"
        />
        <path
          className={cls('loopL')}
          d="M-2-2C-26-26-62-30-70-12C-77 4-56 20-30 12C-18 8-8 4-2 0Z"
          fill={RIBBON}
          stroke={RIBBON_SHADE}
          strokeWidth="1.2"
        />
        <path
          className={cls('loopR')}
          d="M2-2C26-26 62-30 70-12C77 4 56 20 30 12C18 8 8 4 2 0Z"
          fill={RIBBON}
          stroke={RIBBON_SHADE}
          strokeWidth="1.2"
        />
        <circle className={cls('knot')} r="11" fill={RIBBON} stroke={RIBBON_SHADE} strokeWidth="1.2" />
      </g>
      </g>
    </svg>
  )
}

const PETALS = [
  { x: 6, size: 16, hue: 'oklch(0.72 0.1 15)', delay: 0.15, dur: 3 },
  { x: 18, size: 11, hue: 'oklch(0.8 0.07 25)', delay: 0.35, dur: 3.4 },
  { x: 29, size: 18, hue: 'oklch(0.66 0.12 350)', delay: 0.25, dur: 3.1 },
  { x: 41, size: 13, hue: 'oklch(0.76 0.09 60)', delay: 0.55, dur: 3.6 },
  { x: 52, size: 15, hue: 'oklch(0.7 0.1 15)', delay: 0.1, dur: 3.2 },
  { x: 63, size: 10, hue: 'oklch(0.74 0.08 145)', delay: 0.45, dur: 3.5 },
  { x: 74, size: 17, hue: 'oklch(0.68 0.11 25)', delay: 0.3, dur: 3.05 },
  { x: 86, size: 12, hue: 'oklch(0.78 0.08 340)', delay: 0.65, dur: 3.45 },
  { x: 12, size: 9, hue: 'oklch(0.72 0.09 40)', delay: 0.75, dur: 3.8 },
  { x: 35, size: 14, hue: 'oklch(0.69 0.11 355)', delay: 0.85, dur: 3.3 },
  { x: 58, size: 11, hue: 'oklch(0.77 0.07 130)', delay: 0.8, dur: 3.7 },
  { x: 80, size: 16, hue: 'oklch(0.71 0.1 10)', delay: 0.95, dur: 3.15 },
]

export function Petals() {
  return (
    <div className="petals" aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            animationDelay: `${p.delay + 1.2}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
