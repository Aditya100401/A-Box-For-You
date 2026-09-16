import { useCallback, useEffect, useRef, useState } from 'react'
import { charmSpec } from '../lib/embellishments'

const GOLD = 'oklch(0.78 0.12 85)'
const GOLD_DEEP = 'oklch(0.64 0.12 80)'

function Body({ id }: { id: string }) {
  switch (id) {
    case 'hamsa':
      return (
        <g>
          <path
            d="M0 4C-13 4-17 10-17 18C-17 30-10 40 0 44C10 40 17 30 17 18C17 10 13 4 0 4Z"
            fill="oklch(0.62 0.11 245)"
            stroke="oklch(0.48 0.12 248)"
            strokeWidth={1.4}
          />
          <path
            d="M-17 18C-21 14-24 16-23 21C-22 26-19 27-16 26M17 18C21 14 24 16 23 21C22 26 19 27 16 26"
            fill="oklch(0.62 0.11 245)"
            stroke="oklch(0.48 0.12 248)"
            strokeWidth={1.4}
          />
          <path d="M-7 8L-7 2M0 7L0 0M7 8L7 2" stroke="oklch(0.48 0.12 248)" strokeWidth={1.4} strokeLinecap="round" />
          <circle cx={0} cy={24} r={6.5} fill="oklch(0.95 0.02 240)" />
          <circle cx={0} cy={24} r={4} fill="oklch(0.55 0.15 250)" />
          <circle cx={0} cy={24} r={1.8} fill="oklch(0.2 0.03 250)" />
        </g>
      )
    case 'maneki':
      return (
        <g>
          <path d="M-13 44C-15 28-12 14 0 12C12 14 15 28 13 44Z" fill="oklch(0.98 0.008 90)" stroke="oklch(0.78 0.02 85)" strokeWidth={1.2} />
          <path d="M-12 14L-15 4L-6 9ZM12 14L15 4L6 9Z" fill="oklch(0.98 0.008 90)" stroke="oklch(0.78 0.02 85)" strokeWidth={1.2} />
          <path d="M-15 4L-9 8" stroke="oklch(0.72 0.11 20)" strokeWidth={2} strokeLinecap="round" />
          <circle cx={-5} cy={22} r={1.6} fill="oklch(0.25 0.02 60)" />
          <circle cx={5} cy={22} r={1.6} fill="oklch(0.25 0.02 60)" />
          <path d="M-3 27C-1.5 29 1.5 29 3 27" stroke="oklch(0.4 0.02 60)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M13 22C18 16 20 22 16 27" fill="oklch(0.98 0.008 90)" stroke="oklch(0.78 0.02 85)" strokeWidth={1.2} />
          <rect x={-10} y={32} width={20} height={4.5} rx={2} fill="oklch(0.6 0.16 25)" />
          <circle cx={0} cy={38} r={3.4} fill={GOLD} stroke={GOLD_DEEP} strokeWidth={1} />
        </g>
      )
    case 'daruma':
      return (
        <g>
          <path d="M0 6C-15 6-18 20-18 30C-18 40-10 46 0 46C10 46 18 40 18 30C18 20 15 6 0 6Z" fill="oklch(0.55 0.18 25)" stroke="oklch(0.42 0.16 25)" strokeWidth={1.3} />
          <ellipse cx={0} cy={26} rx={11} ry={12} fill="oklch(0.94 0.03 80)" />
          <ellipse cx={-4.5} cy={22} rx={3} ry={3.6} fill="oklch(0.2 0.02 60)" />
          <ellipse cx={4.5} cy={22} rx={3} ry={3.6} fill="none" stroke="oklch(0.35 0.02 60)" strokeWidth={1.1} />
          <path d="M-8 15C-6 13-3 13-1.5 15M8 15C6 13 3 13 1.5 15" stroke="oklch(0.3 0.02 60)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M-5 32C-2 35 2 35 5 32" stroke="oklch(0.35 0.02 60)" strokeWidth={1.2} fill="none" strokeLinecap="round" />
        </g>
      )
    case 'clover':
      return (
        <g fill="oklch(0.6 0.13 148)" stroke="oklch(0.48 0.12 150)" strokeWidth={1}>
          {[0, 90, 180, 270].map((a) => (
            <path key={a} d="M0 16C-9 16-13 10-13 4C-13-2-7-4-2 1C-0.6 2.4 0 4 0 6Z" transform={`rotate(${a} 0 16)`} />
          ))}
          <path d="M0 18L2 44" stroke="oklch(0.52 0.1 150)" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      )
    case 'cornicello':
      return (
        <g>
          <path
            d="M0 8C7 14 10 24 8 34C7 40 3 45-2 46C1 40 2 34 1 28C0 20-3 14-6 10Z"
            fill="oklch(0.55 0.19 25)"
            stroke="oklch(0.42 0.17 25)"
            strokeWidth={1.2}
          />
          <path d="M-1 16C2 20 4 26 3.6 32" stroke="oklch(0.72 0.14 25)" strokeWidth={1.1} fill="none" opacity={0.7} />
          <rect x={-8} y={4} width={12} height={6} rx={2} fill={GOLD} stroke={GOLD_DEEP} strokeWidth={0.9} />
        </g>
      )
    case 'ojo':
      return (
        <g>
          <path d="M0 2L0 46M-21 24L21 24" stroke="oklch(0.55 0.06 60)" strokeWidth={2.4} strokeLinecap="round" />
          {[
            ['oklch(0.55 0.16 25)', 20],
            ['oklch(0.8 0.13 85)', 15.5],
            ['oklch(0.5 0.11 245)', 11],
            ['oklch(0.96 0.02 90)', 6.5],
          ].map(([colour, r], i) => (
            <path
              key={i}
              d={`M0 ${24 - Number(r)}L${r} 24L0 ${24 + Number(r)}L${-Number(r)} 24Z`}
              fill="none"
              stroke={String(colour)}
              strokeWidth={4.4}
            />
          ))}
        </g>
      )
    case 'scarab':
      return (
        <g>
          <ellipse cx={0} cy={28} rx={15} ry={18} fill="oklch(0.6 0.11 190)" stroke={GOLD_DEEP} strokeWidth={1.3} />
          <path d="M0 12L0 46" stroke={GOLD_DEEP} strokeWidth={1.2} />
          <path d="M-15 24C-9 20-4 20 0 22C4 20 9 20 15 24" fill="none" stroke={GOLD_DEEP} strokeWidth={1.2} />
          <ellipse cx={0} cy={13} rx={7} ry={6} fill="oklch(0.5 0.1 190)" stroke={GOLD_DEEP} strokeWidth={1.1} />
          <path d="M-14 16L-20 8M14 16L20 8M-15 30L-21 30M15 30L21 30" stroke={GOLD_DEEP} strokeWidth={1.6} strokeLinecap="round" />
        </g>
      )
    case 'knot':
      return (
        <g stroke="oklch(0.52 0.19 25)" strokeWidth={3.4} fill="none" strokeLinecap="round">
          <path d="M-10 14L10 34M10 14L-10 34" />
          <path d="M-10 14C-16 8-16 20-10 24M10 14C16 8 16 20 10 24" />
          <path d="M-10 34C-16 40-16 28-10 24M10 34C16 40 16 28 10 24" />
          <path d="M0 38L0 46" strokeWidth={2.4} />
          <path d="M-4 46L4 46" strokeWidth={5} stroke="oklch(0.52 0.19 25)" />
        </g>
      )
    case 'ladybird':
      return (
        <g>
          <ellipse cx={0} cy={28} rx={16} ry={17} fill="oklch(0.6 0.2 25)" stroke="oklch(0.45 0.18 25)" strokeWidth={1.1} />
          <path d="M0 11L0 45" stroke="oklch(0.22 0.02 40)" strokeWidth={1.6} />
          <path d="M-16 22A16 17 0 0 1 16 22Z" fill="oklch(0.24 0.02 40)" />
          {[[-8, 27], [8, 30], [-7, 37], [7, 39]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={3.2} fill="oklch(0.22 0.02 40)" />
          ))}
          <circle cx={-5} cy={16} r={1.5} fill="oklch(0.96 0.01 90)" />
          <circle cx={5} cy={16} r={1.5} fill="oklch(0.96 0.01 90)" />
        </g>
      )
    default:
      return (
        <g>
          <circle cx={0} cy={26} r={18} fill="oklch(0.42 0.16 250)" stroke="oklch(0.32 0.14 252)" strokeWidth={1.2} />
          <circle cx={0} cy={26} r={13} fill="oklch(0.97 0.012 240)" />
          <circle cx={0} cy={26} r={8.5} fill="oklch(0.58 0.16 248)" />
          <circle cx={0} cy={26} r={3.8} fill="oklch(0.18 0.03 250)" />
          <circle cx={-5} cy={20} r={2.4} fill="oklch(0.99 0.008 240)" opacity={0.55} />
        </g>
      )
  }
}

const SPRING = 0.014
const FRICTION = 0.988
const MAX_LEAN = 0.62

/**
 * A charm on a cord. Flick it and it swings on a damped pendulum, pumping
 * higher if you keep flicking — the way one does between your fingers.
 */
export function Charm({ id, size = 108 }: { id: string; size?: number }) {
  const spec = charmSpec(id)
  const [deg, setDeg] = useState(0)
  const sim = useRef({ angle: 0, velocity: 0, frame: 0 })

  const step = useCallback(() => {
    const s = sim.current
    s.velocity = (s.velocity - SPRING * s.angle) * FRICTION
    s.angle = Math.max(-MAX_LEAN, Math.min(MAX_LEAN, s.angle + s.velocity))
    if (Math.abs(s.angle) < 0.002 && Math.abs(s.velocity) < 0.002) {
      s.angle = 0
      s.velocity = 0
      s.frame = 0
      setDeg(0)
      return
    }
    setDeg(s.angle * (180 / Math.PI))
    s.frame = requestAnimationFrame(step)
  }, [])

  useEffect(() => () => cancelAnimationFrame(sim.current.frame), [])

  function flick() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const s = sim.current
    // Push against the current lean so repeated flicks build the swing.
    const direction = s.angle === 0 ? (Math.random() < 0.5 ? -1 : 1) : -Math.sign(s.angle)
    s.velocity += direction * 0.055
    if (!s.frame) s.frame = requestAnimationFrame(step)
  }

  const w = size
  const h = size * 1.25
  const cordTop = 4
  const cordLength = 34

  return (
    <button className="charm" onClick={flick} title={spec ? `${spec.name} — ${spec.origin}` : id}>
      <svg width={w} height={h} viewBox="-30 0 60 76" aria-label={spec?.name ?? 'charm'} role="img">
        <g transform={`rotate(${deg} 0 ${cordTop})`}>
          <path
            d={`M0 ${cordTop}L0 ${cordLength}`}
            stroke="oklch(0.62 0.04 60)"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <circle cx={0} cy={cordLength + 1} r={3.4} fill="none" stroke={GOLD} strokeWidth={1.8} />
          <g transform={`translate(0 ${cordLength - 2}) scale(0.62)`}>
            <Body id={id} />
          </g>
        </g>
        <circle cx={0} cy={cordTop} r={2.6} fill="oklch(0.72 0.03 60)" />
      </svg>
      <span className="charm__name">{spec?.name}</span>
    </button>
  )
}
