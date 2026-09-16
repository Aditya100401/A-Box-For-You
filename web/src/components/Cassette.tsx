import { useId } from 'react'
import { tapeStyle, type TapeStyle } from '../lib/tapeStyles'
import { TapePattern } from './TapePattern'

/** The label is a fixed strip of plastic — long text gets trimmed, not overflowed. */
function clamp(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

function Reel({
  cx,
  cy,
  r,
  spinning,
  fast,
  style,
}: {
  cx: number
  cy: number
  r: number
  spinning: boolean
  fast?: boolean
  style: TapeStyle
}) {
  const spokes = Array.from({ length: 6 }, (_, i) => (
    <rect
      key={i}
      x={-r * 0.09}
      y={-r * 0.62}
      width={r * 0.18}
      height={r * 0.42}
      rx={r * 0.06}
      fill={style.hub}
      transform={`rotate(${i * 60})`}
    />
  ))
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={style.tape} />
      <circle r={r * 0.95} fill="none" stroke={style.shellEdge} strokeWidth={r * 0.06} />
      <g className={`reel${spinning ? ' reel--spinning' : ''}${fast ? ' reel--fast' : ''}`}>
        <circle r={r * 0.34} fill={style.hub} />
        <circle r={r * 0.16} fill={style.window} />
        {spokes}
      </g>
    </g>
  )
}

export function Cassette({
  width = 260,
  spinning = false,
  styleId,
  label,
  subtitle,
}: {
  width?: number
  spinning?: boolean
  styleId?: string
  label?: string
  subtitle?: string
}) {
  const s = tapeStyle(styleId)
  // Ids must be unique per instance: several cassettes share a page.
  const uid = useId().replace(/:/g, '')
  const clip = `tape-clip-${uid}`
  const pattern = `tape-pattern-${uid}`
  const shellFill = s.pattern ? `url(#${pattern})` : s.shell

  return (
    <svg
      width={width}
      height={(width * 160) / 260}
      viewBox="0 0 260 160"
      role="img"
      aria-label={`A mixtape, ${s.name} design`}
    >
      <defs>
        <clipPath id={clip}>
          <rect x="18" y="16" width="224" height="52" rx="2" />
        </clipPath>
        <TapePattern id={pattern} style={s} />
      </defs>

      <rect width="260" height="160" rx="9" fill={shellFill} />
      <rect x="10" y="10" width="240" height="140" rx="6" fill="none" stroke={s.shellEdge} />

      <rect
        x="18"
        y="16"
        width="224"
        height="52"
        rx="2"
        fill={s.label}
        opacity={s.pattern ? 0.86 : 1}
      />
      {s.stripes && (
        <g clipPath={`url(#${clip})`} opacity={0.85}>
          {s.stripes.map((colour, i) => (
            <rect
              key={i}
              x={208 + i * 13}
              y={-20}
              width={9}
              height={110}
              fill={colour}
              transform="rotate(18 220 42)"
            />
          ))}
        </g>
      )}
      {label && (
        <text
          x="30"
          y="36"
          fontFamily="'Courier Prime', monospace"
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.2"
          fill={s.accent}
          clipPath={`url(#${clip})`}
        >
          {clamp(label, 24)}
        </text>
      )}
      {subtitle && (
        <text
          x="30"
          y="55"
          fontFamily="'Courier Prime', monospace"
          fontSize="13"
          fill={s.labelInk}
          clipPath={`url(#${clip})`}
        >
          {clamp(subtitle, 22)}
        </text>
      )}

      <rect x="18" y="78" width="224" height="64" rx="4" fill={s.window} />
      <Reel cx={78} cy={110} r={24} spinning={spinning} style={s} />
      <Reel cx={182} cy={110} r={24} spinning={spinning} fast style={s} />
      <rect x="102" y="106" width="56" height="8" fill={s.tape} opacity={spinning ? 0.9 : 0.6} />

      <circle cx={46} cy={150} r={3} fill={s.window} />
      <circle cx={214} cy={150} r={3} fill={s.window} />
    </svg>
  )
}
