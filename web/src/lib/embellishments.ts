export type StampSpec = { id: string; name: string; paper: string; ink: string; value: string }

export const STAMPS: StampSpec[] = [
  { id: 'botanical', name: 'Botanical', paper: 'oklch(0.95 0.02 90)', ink: 'oklch(0.48 0.09 150)', value: '27' },
  { id: 'bird', name: 'Songbird', paper: 'oklch(0.94 0.025 60)', ink: 'oklch(0.46 0.11 40)', value: '12' },
  { id: 'moon', name: 'Night post', paper: 'oklch(0.9 0.04 250)', ink: 'oklch(0.36 0.1 255)', value: '05' },
  { id: 'heart', name: 'First class', paper: 'oklch(0.95 0.025 20)', ink: 'oklch(0.5 0.15 18)', value: '01' },
  { id: 'peach', name: 'Summer fruit', paper: 'oklch(0.95 0.03 75)', ink: 'oklch(0.56 0.14 45)', value: '08' },
]

export type StickerSpec = { id: string; name: string }

export const STICKERS: StickerSpec[] = [
  { id: 'pressed', name: 'Pressed daisies' },
  { id: 'bow', name: 'Gingham bow' },
  { id: 'washi', name: 'Washi strip' },
  { id: 'star', name: 'Gold star' },
  { id: 'heart', name: 'Paper heart' },
  { id: 'eucalyptus', name: 'Eucalyptus sprig' },
]

export type CharmSpec = { id: string; name: string; origin: string; meaning: string }

/** Small good-luck charms, each labelled with where the tradition comes from. */
export const CHARMS: CharmSpec[] = [
  {
    id: 'nazar',
    name: 'Nazar boncuğu',
    origin: 'Türkiye & the Aegean',
    meaning: 'A glass eye that keeps the evil eye looking elsewhere.',
  },
  {
    id: 'hamsa',
    name: 'Hamsa',
    origin: 'North Africa & the Levant',
    meaning: 'An open hand, carried for protection.',
  },
  {
    id: 'maneki',
    name: 'Maneki-neko',
    origin: 'Japan',
    meaning: 'The beckoning cat, waving good fortune in.',
  },
  {
    id: 'daruma',
    name: 'Daruma',
    origin: 'Japan',
    meaning: 'A wish doll — one eye filled in now, the other when it comes true.',
  },
  {
    id: 'clover',
    name: 'Four-leaf clover',
    origin: 'Ireland',
    meaning: 'One leaf in ten thousand, and it found you.',
  },
  {
    id: 'cornicello',
    name: 'Cornicello',
    origin: 'Southern Italy',
    meaning: 'A little red horn worn against bad luck.',
  },
  {
    id: 'ojo',
    name: 'Ojo de Dios',
    origin: 'Wixárika (Huichol) people, Mexico',
    meaning: 'Yarn wound on crossed sticks, woven as a blessing.',
  },
  {
    id: 'scarab',
    name: 'Scarab',
    origin: 'Ancient Egypt',
    meaning: 'A beetle amulet standing for morning and beginning again.',
  },
  {
    id: 'knot',
    name: 'Chinese knot',
    origin: 'China',
    meaning: 'One unbroken cord, tied for luck and long life.',
  },
  {
    id: 'ladybird',
    name: 'Ladybird',
    origin: 'Across Europe',
    meaning: 'If one lands on you, do not brush it off.',
  },
]

export function charmSpec(id: string): CharmSpec | undefined {
  return CHARMS.find((c) => c.id === id)
}
