type Shape = 'round' | 'pointed' | 'ruffled' | 'narrow'

type Spec = {
  kind: 'radial' | 'tulip' | 'rose' | 'spike' | 'trumpet' | 'foliage' | 'cluster'
  petal: string
  deep: string
  center: string
  petals?: number
  layers?: number
  shape?: Shape
  headR?: number
  centerR?: number
  height: number
  /** How far the head reaches above the stem top — sizes the viewBox so nothing clips. */
  reach: number
}

const STEM = 'oklch(0.55 0.08 145)'
const LEAF = 'oklch(0.62 0.09 148)'

export const FLOWERS: Record<string, Spec> = {
  Peony: {
    kind: 'radial',
    petal: 'oklch(0.82 0.08 350)',
    deep: 'oklch(0.7 0.12 350)',
    center: 'oklch(0.63 0.13 350)',
    petals: 11,
    layers: 4,
    shape: 'ruffled',
    headR: 34,
    centerR: 5,
    height: 196,
    reach: 46,
  },
  Ranunculus: {
    kind: 'radial',
    petal: 'oklch(0.79 0.1 30)',
    deep: 'oklch(0.66 0.13 25)',
    center: 'oklch(0.5 0.1 60)',
    petals: 9,
    layers: 5,
    shape: 'round',
    headR: 27,
    centerR: 3,
    height: 168,
    reach: 38,
  },
  Tulip: {
    kind: 'tulip',
    petal: 'oklch(0.66 0.16 25)',
    deep: 'oklch(0.54 0.16 25)',
    center: 'oklch(0.46 0.13 25)',
    headR: 26,
    height: 210,
    reach: 70,
  },
  Daisy: {
    kind: 'radial',
    petal: 'oklch(0.98 0.012 95)',
    deep: 'oklch(0.92 0.03 95)',
    center: 'oklch(0.82 0.15 85)',
    petals: 16,
    layers: 1,
    shape: 'narrow',
    headR: 28,
    centerR: 9,
    height: 150,
    reach: 40,
  },
  Sunflower: {
    kind: 'radial',
    petal: 'oklch(0.82 0.15 82)',
    deep: 'oklch(0.72 0.16 72)',
    center: 'oklch(0.36 0.06 55)',
    petals: 18,
    layers: 2,
    shape: 'pointed',
    headR: 38,
    centerR: 15,
    height: 224,
    reach: 50,
  },
  Lavender: {
    kind: 'spike',
    petal: 'oklch(0.66 0.11 300)',
    deep: 'oklch(0.54 0.12 300)',
    center: 'oklch(0.6 0.1 300)',
    height: 188,
    reach: 108,
  },
  Anemone: {
    kind: 'radial',
    petal: 'oklch(0.88 0.05 340)',
    deep: 'oklch(0.78 0.07 340)',
    center: 'oklch(0.28 0.03 320)',
    petals: 7,
    layers: 1,
    shape: 'round',
    headR: 30,
    centerR: 11,
    height: 162,
    reach: 42,
  },
  Eucalyptus: {
    kind: 'foliage',
    petal: 'oklch(0.75 0.05 155)',
    deep: 'oklch(0.66 0.05 155)',
    center: 'oklch(0.7 0.05 155)',
    height: 206,
    reach: 148,
  },
  Rose: {
    kind: 'rose',
    petal: 'oklch(0.66 0.15 15)',
    deep: 'oklch(0.5 0.15 15)',
    center: 'oklch(0.44 0.14 15)',
    headR: 28,
    height: 200,
    reach: 38,
  },
  Freesia: {
    kind: 'trumpet',
    petal: 'oklch(0.9 0.08 95)',
    deep: 'oklch(0.8 0.1 90)',
    center: 'oklch(0.85 0.12 88)',
    height: 178,
    reach: 78,
  },
  Dahlia: {
    kind: 'radial',
    petal: 'oklch(0.68 0.13 355)',
    deep: 'oklch(0.55 0.14 350)',
    center: 'oklch(0.5 0.12 350)',
    petals: 12,
    layers: 3,
    shape: 'pointed',
    headR: 32,
    centerR: 4,
    height: 182,
    reach: 44,
  },
  "Baby's breath": {
    kind: 'cluster',
    petal: 'oklch(0.98 0.008 95)',
    deep: 'oklch(0.9 0.015 95)',
    center: 'oklch(0.94 0.012 95)',
    height: 158,
    reach: 92,
  },
}

export const FLOWER_NAMES = Object.keys(FLOWERS)

function petalPath(len: number, wid: number, shape: Shape): string {
  switch (shape) {
    case 'pointed':
      return `M0 0C${-wid} ${-len * 0.3} ${-wid * 0.45} ${-len * 0.78} 0 ${-len}C${wid * 0.45} ${
        -len * 0.78
      } ${wid} ${-len * 0.3} 0 0Z`
    case 'narrow':
      return `M0 0C${-wid} ${-len * 0.45} ${-wid} ${-len * 0.88} 0 ${-len}C${wid} ${
        -len * 0.88
      } ${wid} ${-len * 0.45} 0 0Z`
    case 'ruffled':
      return `M0 0C${-wid} ${-len * 0.22} ${-wid * 1.2} ${-len * 0.58} ${-wid * 0.5} ${
        -len * 0.8
      }C${-wid * 0.22} ${-len * 0.96} ${wid * 0.22} ${-len * 0.96} ${wid * 0.5} ${-len * 0.8}C${
        wid * 1.2
      } ${-len * 0.58} ${wid} ${-len * 0.22} 0 0Z`
    default:
      return `M0 0C${-wid} ${-len * 0.28} ${-wid * 0.92} ${-len * 0.9} 0 ${-len}C${
        wid * 0.92
      } ${-len * 0.9} ${wid} ${-len * 0.28} 0 0Z`
  }
}

function Stem({ height, curve = 0 }: { height: number; curve?: number }) {
  return (
    <path
      d={`M0 ${height}C${curve} ${height * 0.66} ${curve} ${height * 0.33} 0 0`}
      stroke={STEM}
      strokeWidth={3.2}
      fill="none"
      strokeLinecap="round"
    />
  )
}

function Leaf({ y, flip = false }: { y: number; flip?: boolean }) {
  const d = 'M0 0C10 -5 21 -2 26 7C17 12 5 9 0 0Z'
  return <path d={d} fill={LEAF} transform={`translate(0 ${y}) scale(${flip ? -1 : 1} 1)`} />
}

function RadialHead({ spec }: { spec: Spec }) {
  const { petals = 10, layers = 2, shape = 'round', headR = 30, centerR = 5 } = spec
  const rings = []
  for (let layer = 0; layer < layers; layer++) {
    const scale = 1 - layer * (0.68 / Math.max(1, layers))
    const len = headR * scale
    const wid = (headR * scale) / (shape === 'narrow' ? 4.5 : 2.6)
    const offset = (180 / petals) * layer
    const fill = layer === 0 ? spec.petal : layer % 2 ? spec.deep : spec.petal
    for (let i = 0; i < petals; i++) {
      rings.push(
        <path
          key={`${layer}-${i}`}
          d={petalPath(len, wid, shape)}
          fill={fill}
          opacity={layer === 0 ? 1 : 0.96}
          transform={`rotate(${(360 / petals) * i + offset})`}
        />,
      )
    }
  }
  return (
    <g>
      {rings}
      <circle r={centerR} fill={spec.center} />
      {spec.kind === 'radial' && centerR > 12 && (
        <g fill="oklch(0.28 0.05 55)" opacity={0.55}>
          {Array.from({ length: 22 }, (_, i) => {
            const a = i * 2.39996
            const r = Math.sqrt(i / 22) * (centerR - 2.5)
            return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={1.5} />
          })}
        </g>
      )}
    </g>
  )
}

function TulipHead({ spec }: { spec: Spec }) {
  const r = spec.headR ?? 26
  return (
    <g>
      <path
        d={`M${-r} ${-r * 0.5}C${-r} ${-r * 1.9} ${-r * 0.3} ${-r * 2.3} 0 ${-r * 2.3}C${
          r * 0.3
        } ${-r * 2.3} ${r} ${-r * 1.9} ${r} ${-r * 0.5}C${r} ${r * 0.35} ${-r} ${r * 0.35} ${-r} ${
          -r * 0.5
        }Z`}
        fill={spec.deep}
      />
      <path
        d={`M${-r * 0.72} ${-r * 0.55}C${-r * 0.72} ${-r * 1.85} ${-r * 0.2} ${-r * 2.25} 0 ${
          -r * 2.25
        }C${r * 0.2} ${-r * 2.25} ${r * 0.72} ${-r * 1.85} ${r * 0.72} ${-r * 0.55}C${r * 0.72} ${
          r * 0.3
        } ${-r * 0.72} ${r * 0.3} ${-r * 0.72} ${-r * 0.55}Z`}
        fill={spec.petal}
      />
      <path
        d={`M0 ${-r * 2.26}C${r * 0.34} ${-r * 1.7} ${r * 0.34} ${-r * 0.5} 0 ${r * 0.16}C${
          -r * 0.34
        } ${-r * 0.5} ${-r * 0.34} ${-r * 1.7} 0 ${-r * 2.26}Z`}
        fill={spec.center}
        opacity={0.55}
      />
    </g>
  )
}

function RoseHead({ spec }: { spec: Spec }) {
  const r = spec.headR ?? 28
  const petals = []
  for (let i = 0; i < 5; i++) {
    const s = 1 - i * 0.17
    petals.push(
      <path
        key={i}
        d={`M0 ${r * s * 0.9}C${-r * s} ${r * s * 0.55} ${-r * s} ${-r * s * 0.7} 0 ${
          -r * s
        }C${r * s} ${-r * s * 0.7} ${r * s} ${r * s * 0.55} 0 ${r * s * 0.9}Z`}
        fill={i % 2 ? spec.deep : spec.petal}
        transform={`rotate(${i * 34})`}
      />,
    )
  }
  return (
    <g>
      <circle r={r} fill={spec.deep} />
      {petals}
      <path
        d={`M0 ${-r * 0.3}A${r * 0.3} ${r * 0.3} 0 1 1 ${-r * 0.22} ${r * 0.2}`}
        fill="none"
        stroke={spec.center}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  )
}

function SpikeHead({ spec }: { spec: Spec }) {
  const florets = []
  for (let i = 0; i < 16; i++) {
    const y = -i * 6.2
    const side = i % 2 ? 1 : -1
    const w = 8 - i * 0.32
    florets.push(
      <ellipse
        key={i}
        cx={side * (4.5 - i * 0.16)}
        cy={y}
        rx={w}
        ry={w * 0.62}
        fill={i % 3 ? spec.petal : spec.deep}
        transform={`rotate(${side * 22} ${side * 4.5} ${y})`}
      />,
    )
  }
  return <g>{florets}</g>
}

function TrumpetHead({ spec }: { spec: Spec }) {
  const florets = []
  for (let i = 0; i < 4; i++) {
    const x = i * 13
    const y = -i * 15
    florets.push(
      <g key={i} transform={`translate(${x} ${y}) rotate(${18 + i * 6})`}>
        <path
          d="M0 0C-4 -9 -4 -17 0 -21C4 -17 4 -9 0 0Z"
          fill={spec.deep}
          transform="rotate(-38)"
        />
        <path d="M0 0C-5 -10 -5 -19 0 -23C5 -19 5 -10 0 0Z" fill={spec.petal} />
        <path
          d="M0 0C-4 -9 -4 -17 0 -21C4 -17 4 -9 0 0Z"
          fill={spec.deep}
          transform="rotate(38)"
        />
        <circle cy={-19} r={2.6} fill={spec.center} />
      </g>,
    )
  }
  // The florets march up and to the right, so re-centre the fan over the stem.
  return <g transform="translate(-19.5 0)">{florets}</g>
}

function FoliageHead({ spec }: { spec: Spec }) {
  const leaves = []
  for (let i = 0; i < 11; i++) {
    const y = -i * 13
    const side = i % 2 ? 1 : -1
    const r = 11 - i * 0.55
    leaves.push(
      <ellipse
        key={i}
        cx={side * (r * 0.95)}
        cy={y}
        rx={r}
        ry={r * 0.86}
        fill={i % 3 ? spec.petal : spec.deep}
      />,
    )
  }
  return <g>{leaves}</g>
}

function ClusterHead({ spec }: { spec: Spec }) {
  const branches = [
    { x: -22, y: -18 },
    { x: -9, y: -40 },
    { x: 6, y: -30 },
    { x: 20, y: -48 },
    { x: -2, y: -62 },
    { x: 15, y: -70 },
    { x: -18, y: -74 },
  ]
  return (
    <g>
      {branches.map((b, i) => (
        <g key={i}>
          <path
            d={`M0 0Q${b.x * 0.4} ${b.y * 0.55} ${b.x} ${b.y}`}
            stroke={STEM}
            strokeWidth={1.2}
            fill="none"
          />
          {[0, 1, 2].map((j) => (
            <circle
              key={j}
              cx={b.x + (j - 1) * 5.5}
              cy={b.y - Math.abs(j - 1) * 4.5}
              r={3.6}
              fill={j === 1 ? spec.petal : spec.deep}
            />
          ))}
        </g>
      ))}
    </g>
  )
}

function Head({ spec }: { spec: Spec }) {
  switch (spec.kind) {
    case 'tulip':
      return <TulipHead spec={spec} />
    case 'rose':
      return <RoseHead spec={spec} />
    case 'spike':
      return <SpikeHead spec={spec} />
    case 'trumpet':
      return <TrumpetHead spec={spec} />
    case 'foliage':
      return <FoliageHead spec={spec} />
    case 'cluster':
      return <ClusterHead spec={spec} />
    default:
      return <RadialHead spec={spec} />
  }
}

export function Flower({
  name,
  scale = 1,
  curve = 0,
}: {
  name: string
  scale?: number
  curve?: number
}) {
  const spec = FLOWERS[name] ?? FLOWERS.Peony
  const stemHeight = spec.height * scale
  const headroom = spec.reach * scale
  const width = 118 * scale
  const height = stemHeight + headroom

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${-width / 2} ${-headroom} ${width} ${height}`}
      role="img"
      aria-label={name}
    >
      <g transform={`scale(${scale})`}>
        <Stem height={spec.height} curve={curve} />
        <Leaf y={spec.height * 0.55} />
        <Leaf y={spec.height * 0.78} flip />
        <Head spec={spec} />
      </g>
    </svg>
  )
}

export function FlowerSwatch({ name }: { name: string }) {
  const spec = FLOWERS[name] ?? FLOWERS.Peony
  return <span className="chip__dot" style={{ background: spec.petal }} />
}
