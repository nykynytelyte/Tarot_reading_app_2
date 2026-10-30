// Spreads are data. Each position is a name, a short meaning, and where it sits
// in the layout grid. Adding a spread means adding an entry here.

export const SPREADS = [
  {
    key: 'one',
    label: 'One card',
    blurb: 'A single card, a single answer.',
    layout: 'single',
    positions: [{ name: 'The card', meaning: 'Your answer', col: 0, row: 0 }],
  },
  {
    key: 'three',
    label: 'Three cards',
    blurb: 'Past, present, future.',
    layout: 'row',
    positions: [
      { name: 'Past', meaning: 'What led here', col: 0, row: 0 },
      { name: 'Present', meaning: 'Where you stand', col: 1, row: 0 },
      { name: 'Future', meaning: 'Where it leads', col: 2, row: 0 },
    ],
  },
  {
    key: 'celtic',
    label: 'Celtic Cross',
    blurb: 'Ten cards, the whole picture.',
    layout: 'celtic',
    positions: [
      { name: 'Present', meaning: 'The heart of the matter', col: 1, row: 1 },
      { name: 'Challenge', meaning: 'What crosses you', col: 1, row: 1, cross: true },
      { name: 'Foundation', meaning: 'The root beneath it', col: 1, row: 2 },
      { name: 'Past', meaning: 'What is passing', col: 0, row: 1 },
      { name: 'Goal', meaning: 'What you are reaching for', col: 1, row: 0 },
      { name: 'Near future', meaning: 'What approaches', col: 2, row: 1 },
      { name: 'Self', meaning: 'How you show up', col: 3, row: 3 },
      { name: 'Environment', meaning: 'Forces around you', col: 3, row: 2 },
      { name: 'Hopes and fears', meaning: 'What you want and dread', col: 3, row: 1 },
      { name: 'Outcome', meaning: 'Where it resolves', col: 3, row: 0 },
    ],
  },
  {
    key: 'custom',
    label: 'Choose your own',
    blurb: 'Pick how many cards you want.',
    layout: 'grid',
    positions: [],
  },
]

export const CUSTOM_MIN = 1
export const CUSTOM_MAX = 78

export function findSpread(key) {
  return SPREADS.find((s) => s.key === key) ?? SPREADS[0]
}

export function clampCount(n) {
  const value = Math.round(Number(n))
  if (!Number.isFinite(value)) return CUSTOM_MIN
  return Math.min(CUSTOM_MAX, Math.max(CUSTOM_MIN, value))
}

// Resolve a spread to a concrete list of positions, filling in a grid for the
// custom count.
export function buildSpread(key, customCount) {
  const spread = findSpread(key)
  if (spread.key !== 'custom') return spread

  const count = clampCount(customCount)
  return {
    ...spread,
    positions: Array.from({ length: count }, (_, i) => ({
      name: `Card ${i + 1}`,
      meaning: '',
      col: 0,
      row: 0,
    })),
  }
}

// Fisher-Yates. Returns a new array.
export function shuffle(items) {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Draw without replacement, and give each card an orientation.
export function drawCards(deck, positions) {
  const pool = shuffle([...deck.cards.keys()])
  return positions.map((position, i) => ({
    position,
    number: pool[i % pool.length],
    reversed: Math.random() < 0.5,
    revealed: false,
  }))
}
