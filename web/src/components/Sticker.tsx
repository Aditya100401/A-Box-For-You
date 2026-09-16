/** Scrapbook stickers — the kind that come on a sheet and never sit quite straight. */
export function Sticker({ id, size = 64 }: { id: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 64 64', role: 'img' as const }

  switch (id) {
    case 'bow':
      return (
        <svg {...common} aria-label="Gingham bow sticker">
          <defs>
            <pattern id={`gingham-${id}`} width={8} height={8} patternUnits="userSpaceOnUse">
              <rect width={8} height={8} fill="oklch(0.97 0.015 150)" />
              <rect width={8} height={4} fill="oklch(0.82 0.07 150)" opacity={0.6} />
              <rect width={4} height={8} fill="oklch(0.82 0.07 150)" opacity={0.6} />
            </pattern>
          </defs>
          <g fill={`url(#gingham-${id})`} stroke="oklch(0.66 0.07 150)" strokeWidth={0.8}>
            <path d="M30 30C20 18 6 16 4 26C2 35 16 38 30 32Z" />
            <path d="M34 30C44 18 58 16 60 26C62 35 48 38 34 32Z" />
            <path d="M28 33C24 42 20 50 22 58C27 52 30 42 32 35Z" />
            <path d="M36 33C40 42 44 50 42 58C37 52 34 42 32 35Z" />
            <circle cx={32} cy={31} r={5} />
          </g>
        </svg>
      )
    case 'washi':
      return (
        <svg {...common} viewBox="0 0 120 30" width={size * 1.9} height={size * 0.48} aria-label="Washi tape">
          <rect width={120} height={30} fill="oklch(0.88 0.06 30)" opacity={0.62} />
          <g stroke="oklch(0.72 0.1 25)" strokeWidth={1.4} opacity={0.5}>
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${i * 14} 0L${i * 14 - 10} 30`} />
            ))}
          </g>
          <path d="M0 0L6 4L0 8L6 12L0 16L6 20L0 24L6 28L0 30Z" fill="oklch(0.99 0.008 85)" />
          <path d="M120 0L114 4L120 8L114 12L120 16L114 20L120 24L114 28L120 30Z" fill="oklch(0.99 0.008 85)" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} aria-label="Gold star sticker">
          <path
            d="M32 6L39 24L58 25L43 37L48 56L32 45L16 56L21 37L6 25L25 24Z"
            fill="oklch(0.84 0.14 88)"
            stroke="oklch(0.72 0.14 80)"
            strokeWidth={1.2}
          />
          <path d="M32 14L36 26L28 26Z" fill="oklch(0.94 0.08 92)" opacity={0.8} />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common} aria-label="Paper heart sticker">
          <path
            d="M32 56C14 42 6 33 6 24C6 16 12 10 19 10C24 10 29 13 32 18C35 13 40 10 45 10C52 10 58 16 58 24C58 33 50 42 32 56Z"
            fill="oklch(0.68 0.15 18)"
            stroke="oklch(0.56 0.15 18)"
            strokeWidth={1.2}
          />
          <path d="M20 20C17 23 16 27 17 31" stroke="oklch(0.9 0.06 20)" strokeWidth={2} fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'eucalyptus':
      return (
        <svg {...common} aria-label="Eucalyptus sprig sticker">
          <path d="M10 56C20 44 30 30 46 12" stroke="oklch(0.6 0.07 150)" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          {Array.from({ length: 7 }, (_, i) => {
            const t = i / 6
            const x = 12 + t * 32
            const y = 54 - t * 40
            const r = 7 - i * 0.5
            return (
              <g key={i}>
                <ellipse cx={x - r} cy={y - r * 0.4} rx={r} ry={r * 0.82} fill="oklch(0.76 0.05 155)" />
                <ellipse cx={x + r} cy={y + r * 0.4} rx={r * 0.9} ry={r * 0.74} fill="oklch(0.68 0.05 155)" />
              </g>
            )
          })}
        </svg>
      )
    default:
      return (
        <svg {...common} aria-label="Pressed daisies sticker">
          <circle cx={32} cy={32} r={27} fill="oklch(0.97 0.014 88)" stroke="oklch(0.86 0.03 85)" strokeWidth={1} />
          {[[24, 26, 1], [41, 30, 0.85], [31, 43, 0.75]].map(([cx, cy, s], i) => (
            <g key={i} transform={`translate(${cx} ${cy}) scale(${s})`}>
              {Array.from({ length: 9 }, (_, j) => (
                <ellipse
                  key={j}
                  cx={0}
                  cy={-7}
                  rx={2.6}
                  ry={5.4}
                  fill="oklch(0.99 0.008 95)"
                  stroke="oklch(0.88 0.02 90)"
                  strokeWidth={0.5}
                  transform={`rotate(${j * 40})`}
                />
              ))}
              <circle r={3.4} fill="oklch(0.83 0.14 88)" />
            </g>
          ))}
          <path d="M18 46C24 40 30 38 40 40" stroke="oklch(0.68 0.06 150)" strokeWidth={1.4} fill="none" />
        </svg>
      )
  }
}
