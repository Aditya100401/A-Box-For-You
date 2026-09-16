import { useId } from 'react'
import { STAMPS } from '../lib/embellishments'

function Art({ id, ink }: { id: string; ink: string }) {
  switch (id) {
    case 'bird':
      return (
        <g fill={ink}>
          <path d="M14 30C20 18 32 14 40 18C36 20 34 23 33 26C38 24 42 25 44 28C39 28 35 31 32 35C26 41 18 40 14 30Z" />
          <circle cx={36} cy={20} r={1.2} fill="oklch(0.95 0.02 60)" />
          <path d="M20 38L16 46M26 39L24 47" stroke={ink} strokeWidth={1.4} strokeLinecap="round" />
        </g>
      )
    case 'moon':
      return (
        <g fill={ink}>
          <path d="M38 16A16 16 0 1 0 38 44A13 13 0 1 1 38 16Z" />
          {[[16, 16], [20, 40], [42, 48], [12, 30]].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y - 3.4}L${x + 1} ${y - 1}L${x + 3.4} ${y}L${x + 1} ${y + 1}L${x} ${y + 3.4}L${x - 1} ${y + 1}L${x - 3.4} ${y}L${x - 1} ${y - 1}Z`}
            />
          ))}
        </g>
      )
    case 'heart':
      return (
        <path
          d="M30 46C16 36 10 29 10 22C10 16 14 12 19 12C23 12 27 14 30 18C33 14 37 12 41 12C46 12 50 16 50 22C50 29 44 36 30 46Z"
          fill={ink}
        />
      )
    case 'peach':
      return (
        <g>
          <circle cx={30} cy={32} r={15} fill={ink} />
          <path d="M30 18C30 12 34 9 39 9C38 14 35 17 30 18Z" fill="oklch(0.6 0.1 150)" />
          <path d="M30 20C26 25 25 33 29 44" stroke="oklch(0.95 0.03 75)" strokeWidth={1.2} fill="none" />
        </g>
      )
    default:
      return (
        <g>
          <path d="M30 48C30 36 30 26 30 14" stroke={ink} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <ellipse cx={24} cy={40 - i * 8} rx={6} ry={2.6} fill={ink} transform={`rotate(-28 24 ${40 - i * 8})`} />
              <ellipse cx={36} cy={36 - i * 8} rx={6} ry={2.6} fill={ink} transform={`rotate(28 36 ${36 - i * 8})`} />
            </g>
          ))}
          <circle cx={30} cy={12} r={3.2} fill={ink} />
        </g>
      )
  }
}

/** A perforated postage stamp with a smudged postmark across one corner. */
export function Stamp({ id, width = 70, cardBg = 'oklch(0.99 0.008 85)' }: {
  id: string
  width?: number
  cardBg?: string
}) {
  const spec = STAMPS.find((s) => s.id === id) ?? STAMPS[0]
  const uid = useId().replace(/:/g, '')
  const teeth = []
  for (let x = 4; x <= 56; x += 6.5) {
    teeth.push(<circle key={`t${x}`} cx={x} cy={0} r={2.6} fill={cardBg} />)
    teeth.push(<circle key={`b${x}`} cx={x} cy={74} r={2.6} fill={cardBg} />)
  }
  for (let y = 4; y <= 70; y += 6.6) {
    teeth.push(<circle key={`l${y}`} cx={0} cy={y} r={2.6} fill={cardBg} />)
    teeth.push(<circle key={`r${y}`} cx={60} cy={y} r={2.6} fill={cardBg} />)
  }

  return (
    <svg
      width={width}
      height={(width * 74) / 60}
      viewBox="-3 -3 66 80"
      role="img"
      aria-label={`${spec.name} stamp`}
    >
      <defs>
        <clipPath id={`stamp-${uid}`}>
          <rect x={0} y={0} width={60} height={74} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={60} height={74} fill={spec.paper} />
      <g clipPath={`url(#stamp-${uid})`}>
        <rect x={4} y={4} width={52} height={66} fill="none" stroke={spec.ink} strokeWidth={0.8} opacity={0.35} />
        <g transform="translate(0 2)">
          <Art id={spec.id} ink={spec.ink} />
        </g>
        <text
          x={8}
          y={68}
          fontFamily="'Courier Prime', monospace"
          fontSize={9}
          fontWeight={700}
          fill={spec.ink}
        >
          {spec.value}
        </text>
        <text
          x={52}
          y={68}
          textAnchor="end"
          fontFamily="'Courier Prime', monospace"
          fontSize={6}
          letterSpacing={0.6}
          fill={spec.ink}
          opacity={0.75}
        >
          POST
        </text>
      </g>
      {teeth}
      <g opacity={0.38} stroke={spec.ink} fill="none" strokeWidth={1.3}>
        <circle cx={46} cy={16} r={13} />
        <circle cx={46} cy={16} r={9.5} />
        <path d="M33 22L59 10M33 12L59 22" strokeWidth={0.9} />
      </g>
    </svg>
  )
}
