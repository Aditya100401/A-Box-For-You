import type { TapeStyle } from '../lib/tapeStyles'

function Clover({ x, y, r, c, fill }: { x: number; y: number; r: number; c: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${c})`} fill={fill}>
      {[0, 90, 180, 270].map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.62} rx={r * 0.44} ry={r * 0.6} transform={`rotate(${a})`} />
      ))}
      <path d={`M0 ${r * 0.3}L0 ${r * 1.5}`} stroke={fill} strokeWidth={r * 0.14} fill="none" />
    </g>
  )
}

function Daisy({ x, y, s, c, petal, eye }: {
  x: number
  y: number
  s: number
  c: number
  petal: string
  eye: string
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${c}) scale(${s})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-3.4} rx={1.25} ry={2.6} fill={petal} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={1.5} fill={eye} />
    </g>
  )
}

function Bloom({ x, y, s, c, petal, eye }: {
  x: number
  y: number
  s: number
  c: number
  petal: string
  eye: string
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${c}) scale(${s})`}>
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          d="M0 0C-2.6-1.6-3-5-0-6.4C3-5 2.6-1.6 0 0Z"
          fill={petal}
          transform={`rotate(${i * 72})`}
        />
      ))}
      <circle r={1.3} fill={eye} />
    </g>
  )
}

function Sprig({ x, y, c, s, stem, bud }: {
  x: number
  y: number
  c: number
  s: number
  stem: string
  bud: string
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${c}) scale(${s})`}>
      <path d="M0 6C0 2 0-2 0-6" stroke={stem} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <ellipse cx={-2} cy={1} rx={1.9} ry={0.9} fill={stem} transform="rotate(-28 -2 1)" />
      <ellipse cx={2} cy={-1} rx={1.9} ry={0.9} fill={stem} transform="rotate(28 2 -1)" />
      <circle cx={0} cy={-6.6} r={1.9} fill={bud} />
    </g>
  )
}

/**
 * The repeating print across a patterned shell. Each tile is 48×48 user units
 * and is scattered by hand so the repeat doesn't read as a grid.
 */
export function TapePattern({ id, style }: { id: string; style: TapeStyle }) {
  const kind = style.pattern
  if (!kind) return null

  let motifs = null
  let bg = style.shell

  if (kind === 'clover') {
    const green = 'oklch(0.58 0.09 150)'
    motifs = (
      <>
        <Clover x={10} y={12} r={4.2} c={12} fill={green} />
        <Clover x={34} y={6} r={3.2} c={-30} fill={green} />
        <Clover x={24} y={28} r={4.6} c={48} fill={green} />
        <Clover x={42} y={36} r={3.4} c={-14} fill={green} />
        <Clover x={6} y={38} r={3.6} c={70} fill={green} />
      </>
    )
  } else if (kind === 'daisy') {
    const petal = 'oklch(0.99 0.008 95)'
    const eye = 'oklch(0.82 0.14 88)'
    const leaf = 'oklch(0.72 0.06 145)'
    motifs = (
      <>
        <Daisy x={11} y={11} s={1.15} c={10} petal={petal} eye={eye} />
        <Daisy x={35} y={19} s={0.9} c={40} petal={petal} eye={eye} />
        <Daisy x={22} y={33} s={1.05} c={-20} petal={petal} eye={eye} />
        <Daisy x={44} y={41} s={0.8} c={25} petal={petal} eye={eye} />
        <ellipse cx={5} cy={26} rx={2.6} ry={1.2} fill={leaf} transform="rotate(-30 5 26)" />
        <ellipse cx={32} cy={45} rx={2.6} ry={1.2} fill={leaf} transform="rotate(20 32 45)" />
      </>
    )
  } else if (kind === 'delft') {
    const white = 'oklch(0.98 0.008 240)'
    const pale = 'oklch(0.9 0.03 240)'
    motifs = (
      <>
        <Bloom x={12} y={13} s={1.5} c={0} petal={white} eye={pale} />
        <Bloom x={36} y={31} s={1.5} c={30} petal={white} eye={pale} />
        <Bloom x={30} y={5} s={0.9} c={60} petal={white} eye={pale} />
        <Bloom x={6} y={38} s={0.9} c={15} petal={white} eye={pale} />
        <circle cx={44} cy={12} r={1.1} fill={white} />
        <circle cx={20} cy={24} r={1.1} fill={white} />
        <circle cx={16} cy={45} r={1.1} fill={white} />
      </>
    )
  } else if (kind === 'meadow') {
    const stem = 'oklch(0.66 0.07 148)'
    motifs = (
      <>
        <Sprig x={11} y={12} c={-8} s={1.2} stem={stem} bud="oklch(0.7 0.12 15)" />
        <Sprig x={34} y={20} c={14} s={1} stem={stem} bud="oklch(0.78 0.1 60)" />
        <Sprig x={20} y={34} c={-22} s={1.15} stem={stem} bud="oklch(0.72 0.1 340)" />
        <Sprig x={43} y={42} c={6} s={0.95} stem={stem} bud="oklch(0.7 0.09 300)" />
        <Sprig x={5} y={42} c={28} s={0.9} stem={stem} bud="oklch(0.76 0.11 80)" />
      </>
    )
  } else {
    // gingham check with a rosebud tucked into the squares
    const check = 'oklch(0.86 0.07 95)'
    const rose = 'oklch(0.68 0.13 18)'
    const leaf = 'oklch(0.68 0.07 148)'
    bg = 'oklch(0.97 0.02 95)'
    motifs = (
      <>
        <g fill={check} opacity={0.55}>
          <rect x={0} y={0} width={48} height={12} />
          <rect x={0} y={24} width={48} height={12} />
        </g>
        <g fill={check} opacity={0.55}>
          <rect x={0} y={0} width={12} height={48} />
          <rect x={24} y={0} width={12} height={48} />
        </g>
        <g>
          <circle cx={18} cy={18} r={2.8} fill={rose} />
          <path d="M18 18a2.8 2.8 0 0 1 2-2.6" stroke="oklch(0.84 0.08 20)" strokeWidth={0.8} fill="none" />
          <ellipse cx={21} cy={21} rx={2.2} ry={1} fill={leaf} transform="rotate(30 21 21)" />
        </g>
        <g>
          <circle cx={42} cy={42} r={2.8} fill={rose} />
          <ellipse cx={45} cy={45} rx={2.2} ry={1} fill={leaf} transform="rotate(30 45 45)" />
        </g>
      </>
    )
  }

  return (
    <pattern id={id} width={48} height={48} patternUnits="userSpaceOnUse">
      <rect width={48} height={48} fill={bg} />
      {motifs}
    </pattern>
  )
}
