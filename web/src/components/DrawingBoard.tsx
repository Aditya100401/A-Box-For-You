import { useId, useRef, useState } from 'react'
import type { Drawing, Stroke } from '../lib/api'

export const BOARD_W = 1000
export const BOARD_H = 700

const INKS = [
  'oklch(0.32 0.02 60)',
  'oklch(0.54 0.16 20)',
  'oklch(0.62 0.15 55)',
  'oklch(0.66 0.13 135)',
  'oklch(0.52 0.14 250)',
  'oklch(0.58 0.15 320)',
  'oklch(0.75 0.14 88)',
  'oklch(0.72 0.02 60)',
]

const NIBS = [
  { name: 'Fine', width: 3 },
  { name: 'Medium', width: 7 },
  { name: 'Broad', width: 15 },
]

/** Rounded to whole units — a doodle travels inside the box's JSON. */
function point(event: React.PointerEvent<SVGSVGElement>, svg: SVGSVGElement): [number, number] {
  const rect = svg.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * BOARD_W
  const y = ((event.clientY - rect.top) / rect.height) * BOARD_H
  return [Math.round(Math.max(0, Math.min(BOARD_W, x))), Math.round(Math.max(0, Math.min(BOARD_H, y)))]
}

export function strokePath(stroke: Stroke): string {
  const p = stroke.points
  if (p.length < 4) return p.length === 2 ? `M${p[0]} ${p[1]}l0.1 0` : ''
  let d = `M${p[0]} ${p[1]}`
  for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`
  return d
}

export function DrawingBoard({
  drawing,
  onChange,
}: {
  drawing: Drawing
  onChange: (next: Drawing) => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [ink, setInk] = useState(INKS[0])
  const [width, setWidth] = useState(NIBS[1].width)
  const live = useRef<Stroke | null>(null)
  const [, bump] = useState(0)
  const dots = `dots-${useId().replace(/:/g, '')}`

  function begin(event: React.PointerEvent<SVGSVGElement>) {
    if (!svgRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const [x, y] = point(event, svgRef.current)
    live.current = { color: ink, width, points: [x, y] }
    bump((n) => n + 1)
  }

  function extend(event: React.PointerEvent<SVGSVGElement>) {
    if (!live.current || !svgRef.current) return
    const [x, y] = point(event, svgRef.current)
    const pts = live.current.points
    const dx = x - pts[pts.length - 2]
    const dy = y - pts[pts.length - 1]
    if (dx * dx + dy * dy < 9) return
    pts.push(x, y)
    bump((n) => n + 1)
  }

  function end() {
    if (live.current && live.current.points.length >= 2) {
      onChange({ ...drawing, strokes: [...drawing.strokes, live.current] })
    }
    live.current = null
    bump((n) => n + 1)
  }

  const strokes = live.current ? [...drawing.strokes, live.current] : drawing.strokes

  return (
    <div className="board">
      <div className="board__tools">
        <div className="board__inks">
          {INKS.map((colour) => (
            <button
              key={colour}
              className={ink === colour ? 'ink ink--on' : 'ink'}
              style={{ background: colour }}
              onClick={() => setInk(colour)}
              aria-label={`Ink ${colour}`}
            />
          ))}
        </div>
        <div className="board__nibs">
          {NIBS.map((nib) => (
            <button
              key={nib.name}
              className={width === nib.width ? 'chip chip--on' : 'chip'}
              onClick={() => setWidth(nib.width)}
            >
              {nib.name}
            </button>
          ))}
        </div>
        <div className="board__actions">
          <button
            className="btn btn--ghost btn--small"
            disabled={!drawing.strokes.length}
            onClick={() => onChange({ ...drawing, strokes: drawing.strokes.slice(0, -1) })}
          >
            Undo
          </button>
          <button
            className="btn btn--ghost btn--small"
            disabled={!drawing.strokes.length}
            onClick={() => onChange({ ...drawing, strokes: [] })}
          >
            Clear
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="board__paper"
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        onPointerDown={begin}
        onPointerMove={extend}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <defs>
          <pattern id={dots} width={36} height={36} patternUnits="userSpaceOnUse">
            <circle cx={18} cy={18} r={1.7} fill="oklch(0.82 0.02 85)" />
          </pattern>
        </defs>
        <rect width={BOARD_W} height={BOARD_H} fill="oklch(0.99 0.008 85)" />
        <rect width={BOARD_W} height={BOARD_H} fill={`url(#${dots})`} />
        {strokes.map((stroke, i) => (
          <path
            key={i}
            d={strokePath(stroke)}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {!drawing.strokes.length && !live.current && (
        <div className="board__hint">Draw something. Anything.</div>
      )}
    </div>
  )
}

/** Replays a finished doodle, stroke by stroke, as if it were being drawn. */
export function DrawingReplay({ drawing, animate = true }: { drawing: Drawing; animate?: boolean }) {
  let delay = 0
  return (
    <svg className="doodle" viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} role="img" aria-label={drawing.caption || 'A drawing'}>
      {drawing.strokes.map((stroke, i) => {
        const dur = Math.min(1.4, 0.16 + stroke.points.length * 0.012)
        const style = animate
          ? { animationDuration: `${dur}s`, animationDelay: `${delay}s` }
          : undefined
        delay += dur * 0.55
        return (
          <path
            key={i}
            className={animate ? 'doodle__stroke' : undefined}
            d={strokePath(stroke)}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={style}
          />
        )
      })}
    </svg>
  )
}
