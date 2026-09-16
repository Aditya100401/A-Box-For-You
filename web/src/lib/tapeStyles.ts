export type TapeStyle = {
  id: string
  name: string
  shell: string
  shellEdge: string
  window: string
  label: string
  labelInk: string
  accent: string
  tape: string
  hub: string
  /** Diagonal bands across the label, the way blank tapes used to be printed. */
  stripes?: string[]
  /** A repeating motif printed across the shell, drawn by <TapePattern>. */
  pattern?: 'clover' | 'daisy' | 'delft' | 'meadow' | 'rosebud'
}

export const TAPE_STYLES: TapeStyle[] = [
  {
    id: 'classic',
    name: 'Classic',
    shell: 'oklch(0.32 0.02 60)',
    shellEdge: 'oklch(0.38 0.02 60)',
    window: 'oklch(0.2 0.02 60)',
    label: 'oklch(0.93 0.03 85)',
    labelInk: 'oklch(0.34 0.02 60)',
    accent: 'oklch(0.45 0.12 15)',
    tape: 'oklch(0.42 0.05 55)',
    hub: 'oklch(0.84 0.02 85)',
  },
  {
    id: 'neon',
    name: 'Neon 90s',
    shell: 'oklch(0.22 0.04 285)',
    shellEdge: 'oklch(0.34 0.08 290)',
    window: 'oklch(0.16 0.03 285)',
    label: 'oklch(0.26 0.05 290)',
    labelInk: 'oklch(0.88 0.16 190)',
    accent: 'oklch(0.72 0.24 340)',
    tape: 'oklch(0.3 0.06 300)',
    hub: 'oklch(0.85 0.14 190)',
    stripes: ['oklch(0.72 0.24 340)', 'oklch(0.85 0.16 190)', 'oklch(0.86 0.18 95)'],
  },
  {
    id: 'kraft',
    name: 'Kraft paper',
    shell: 'oklch(0.44 0.05 68)',
    shellEdge: 'oklch(0.52 0.06 70)',
    window: 'oklch(0.3 0.04 65)',
    label: 'oklch(0.84 0.07 78)',
    labelInk: 'oklch(0.36 0.06 55)',
    accent: 'oklch(0.48 0.12 40)',
    tape: 'oklch(0.5 0.07 60)',
    hub: 'oklch(0.9 0.04 80)',
  },
  {
    id: 'candy',
    name: 'Candy',
    shell: 'oklch(0.72 0.13 350)',
    shellEdge: 'oklch(0.82 0.1 350)',
    window: 'oklch(0.5 0.14 350)',
    label: 'oklch(0.97 0.02 95)',
    labelInk: 'oklch(0.46 0.15 350)',
    accent: 'oklch(0.62 0.2 350)',
    tape: 'oklch(0.66 0.13 20)',
    hub: 'oklch(0.96 0.02 95)',
    stripes: ['oklch(0.8 0.12 350)', 'oklch(0.88 0.09 20)'],
  },
  {
    id: 'smoke',
    name: 'Clear smoke',
    shell: 'oklch(0.68 0.015 250)',
    shellEdge: 'oklch(0.78 0.015 250)',
    window: 'oklch(0.5 0.02 250)',
    label: 'oklch(0.94 0.008 250)',
    labelInk: 'oklch(0.38 0.02 250)',
    accent: 'oklch(0.5 0.08 250)',
    tape: 'oklch(0.44 0.03 250)',
    hub: 'oklch(0.9 0.01 250)',
  },
  {
    id: 'clover',
    name: 'Clover field',
    pattern: 'clover',
    shell: 'oklch(0.94 0.012 95)',
    shellEdge: 'oklch(0.86 0.02 95)',
    window: 'oklch(0.32 0.02 85)',
    label: 'oklch(0.97 0.01 95)',
    labelInk: 'oklch(0.38 0.05 150)',
    accent: 'oklch(0.52 0.1 150)',
    tape: 'oklch(0.72 0.05 150)',
    hub: 'oklch(0.86 0.06 220)',
  },
  {
    id: 'daisy',
    name: 'Pressed daisies',
    pattern: 'daisy',
    shell: 'oklch(0.95 0.018 88)',
    shellEdge: 'oklch(0.87 0.03 85)',
    window: 'oklch(0.34 0.02 70)',
    label: 'oklch(0.98 0.012 90)',
    labelInk: 'oklch(0.4 0.03 70)',
    accent: 'oklch(0.58 0.12 55)',
    tape: 'oklch(0.76 0.06 80)',
    hub: 'oklch(0.9 0.08 90)',
  },
  {
    id: 'delft',
    name: 'Delft bloom',
    pattern: 'delft',
    shell: 'oklch(0.82 0.06 245)',
    shellEdge: 'oklch(0.72 0.07 245)',
    window: 'oklch(0.3 0.05 250)',
    label: 'oklch(0.96 0.015 240)',
    labelInk: 'oklch(0.36 0.09 250)',
    accent: 'oklch(0.46 0.13 250)',
    tape: 'oklch(0.6 0.08 250)',
    hub: 'oklch(0.94 0.012 240)',
  },
  {
    id: 'meadow',
    name: 'Wildflower',
    pattern: 'meadow',
    shell: 'oklch(0.94 0.022 80)',
    shellEdge: 'oklch(0.85 0.03 75)',
    window: 'oklch(0.36 0.03 60)',
    label: 'oklch(0.98 0.012 85)',
    labelInk: 'oklch(0.4 0.04 40)',
    accent: 'oklch(0.55 0.13 15)',
    tape: 'oklch(0.74 0.06 40)',
    hub: 'oklch(0.88 0.05 350)',
  },
  {
    id: 'rosebud',
    name: 'Gingham rosebud',
    pattern: 'rosebud',
    shell: 'oklch(0.93 0.03 95)',
    shellEdge: 'oklch(0.84 0.05 95)',
    window: 'oklch(0.36 0.04 70)',
    label: 'oklch(0.98 0.015 95)',
    labelInk: 'oklch(0.42 0.05 60)',
    accent: 'oklch(0.56 0.14 20)',
    tape: 'oklch(0.76 0.07 60)',
    hub: 'oklch(0.9 0.06 95)',
  },
]

export function tapeStyle(id: string | undefined): TapeStyle {
  return TAPE_STYLES.find((s) => s.id === id) ?? TAPE_STYLES[0]
}
