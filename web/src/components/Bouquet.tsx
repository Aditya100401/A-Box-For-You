import { useState } from 'react'
import { Flower } from './Flower'

/**
 * Every stem is anchored to the same base point and fanned out from it, so the
 * group gathers into one bunch the way a hand-tied bouquet actually does.
 */
export function Bouquet({ flowers, note }: { flowers: string[]; note?: string }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const mid = (flowers.length - 1) / 2
  const step = flowers.length > 1 ? 52 / (flowers.length - 1) : 0

  return (
    <div className="center-stack">
      <div className="bouquet">
        {flowers.map((name, i) => {
          const fromCentre = i - mid
          return (
            <button
              key={`${name}-${i}`}
              className="stem"
              style={{
                ['--fan' as string]: `${fromCentre * step}deg`,
                animationDelay: `${i * 0.09}s`,
                zIndex: Math.round(10 - Math.abs(fromCentre)),
              }}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered((h) => (h === name ? null : h))}
              onFocus={() => setHovered(name)}
              onBlur={() => setHovered(null)}
              title={name}
            >
              <Flower
                name={name}
                scale={0.72 + (i % 3) * 0.05}
                curve={fromCentre > 0 ? 7 : -7}
              />
            </button>
          )
        })}
        <span className="bouquet__tie" aria-hidden />
      </div>

      <div className="bouquet__caption">{hovered ?? ' '}</div>

      {note && <div className="flower-note">{note}</div>}
    </div>
  )
}
