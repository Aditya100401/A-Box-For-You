import type { BoxContent } from './api'

const SONGS: [string, string, string][] = [
  ['Motion Sickness', 'Phoebe Bridgers', 'Track one, obviously. You sang it wrong for a year and I never corrected you.'],
  ['Dreams', 'Fleetwood Mac', 'The car, the tunnel, the windows down.'],
  ['Nightswimming', 'R.E.M.', 'For the lake, and the part where you fell in.'],
  ['Ivy', 'Frank Ocean', 'You played this on repeat the whole of that August.'],
  ['This Must Be the Place', 'Talking Heads', 'Our last-song-of-the-night song.'],
  ['Linger', 'The Cranberries', 'Karaoke, and the fact that you actually can sing.'],
  ['Coffee', 'Sylvan Esso', 'For every morning you made it before I woke up.'],
  ['Home', 'Edward Sharpe', 'Track eight. Because that is what you are.'],
  ['Redbone', 'Childish Gambino', 'The kitchen-floor dancing era.'],
  ['Pink + White', 'Frank Ocean', 'That drive home when neither of us spoke.'],
  ['Chinatown', 'Bleachers', 'You texted me this at 3am with no context.'],
  ['Rill Rill', 'Sleigh Bells', 'Summer of the broken air conditioner.'],
  ['Two Weeks', 'Grizzly Bear', 'The song you claim to hate and know every word of.'],
  ['Sunday Morning', 'The Velvet Underground', 'For slow starts and burnt toast.'],
  ['Nikes', 'Frank Ocean', 'You said this one sounded like a fever. You were right.'],
  ['Video Games', 'Lana Del Rey', 'Your dramatic-walking-in-the-rain phase.'],
  ['Lovers Rock', 'TV Girl', 'The night bus, both of us half asleep.'],
  ['I Wanna Be Yours', 'Arctic Monkeys', 'For every terrible person you got over.'],
  ['Cornelia Street', 'Taylor Swift', 'The old apartment, obviously.'],
  ['Tongues & Teeth', 'The Crane Wives', 'You sent this to me first. I never said thank you.'],
  ['Silver Springs', 'Fleetwood Mac', 'Because you sing the Stevie part with your whole chest.'],
  ['Kyoto', 'Phoebe Bridgers', 'Track twenty-two and still the loudest.'],
  ['Fine Line', 'Harry Styles', 'The camping trip. Never again.'],
  ['Heat Waves', 'Glass Animals', 'The summer we did nothing and it was perfect.'],
  ['Gold Rush', 'Death Cab for Cutie', 'For loving a city that keeps changing on you.'],
  ['Motion', 'Khalid', 'Getting the keys to the new place.'],
  ['The Only Exception', 'Paramore', 'Track twenty-seven. Last song, and it is about you.'],
]

export const DEMO: BoxContent = {
  to: 'Maya',
  sender: 'Sam',
  age: 27,
  flower_note: 'Because you always notice the flowers first.',
  cards: [
    {
      title: 'Open when you miss the old apartment',
      message:
        'The one with the broken buzzer and the kitchen we ruined twice. I still think about the night we ate cereal at 2am and decided everything was going to be fine.',
      stamp: 'botanical',
      stickers: ['pressed', 'washi'],
      charms: ['nazar', 'clover'],
    },
    {
      title: 'Open on a bad Tuesday',
      message:
        'You are the most stubbornly hopeful person I know. That is not a small thing. Go get a pastry, on me.',
      stamp: 'moon',
      stickers: ['bow', 'star'],
      charms: ['maneki', 'ojo', 'ladybird'],
    },
  ],
  flowers: ['Peony', 'Ranunculus', 'Eucalyptus', 'Anemone', 'Freesia', 'Tulip'],
  tape: SONGS.map(([title, artist, why]) => ({ title, artist, url: '', why })),
  photos: [
    { url: '', caption: 'The lake, the year of the bad haircuts' },
    { url: '', caption: 'Your birthday, two flats ago' },
  ],
  gifts: [
    { name: 'The ceramics class you keep bookmarking', hint: 'something you make with your hands' },
    { name: 'A weekend train ticket, anywhere you point', hint: 'something that moves' },
    { name: 'The espresso machine', hint: 'something loud in the morning' },
    { name: 'Concert tickets, your pick', hint: 'something too loud' },
  ],
  drawings: [
    {
      caption: 'I tried. It is a cake.',
      strokes: [
        { color: 'oklch(0.32 0.02 60)', width: 7, points: [350, 430, 350, 560, 650, 560, 650, 430, 350, 430] },
        {
          color: 'oklch(0.58 0.15 320)',
          width: 10,
          points: [350, 430, 390, 408, 430, 432, 470, 408, 510, 432, 550, 408, 590, 432, 630, 410, 650, 430],
        },
        { color: 'oklch(0.75 0.14 88)', width: 8, points: [500, 412, 500, 340] },
        { color: 'oklch(0.62 0.15 55)', width: 6, points: [500, 338, 484, 316, 500, 290, 516, 316, 500, 338] },
        { color: 'oklch(0.72 0.02 60)', width: 6, points: [292, 572, 708, 572] },
        { color: 'oklch(0.75 0.14 88)', width: 5, points: [250, 352, 282, 388] },
        { color: 'oklch(0.75 0.14 88)', width: 5, points: [282, 352, 250, 388] },
        { color: 'oklch(0.75 0.14 88)', width: 5, points: [716, 372, 748, 408] },
        { color: 'oklch(0.75 0.14 88)', width: 5, points: [748, 372, 716, 408] },
      ],
    },
  ],
  tape_style: 'neon',
  tape_label: 'SIDE A — FOR MAYA',
  letter:
    'Dear Maya,\n\nI have known you through four addresses, two haircuts I will not mention, and one truly disastrous camping trip. Every version of you has been my favourite version of you.\n\nThis box is small and the internet is silly, but the point stands: I am so glad you were born.\n\nHappy birthday. Shake the ball. I already know I can afford all of them.',
}
