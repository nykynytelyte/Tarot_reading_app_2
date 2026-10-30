import { csvToObjects } from './csv.js'

const BASE = import.meta.env.BASE_URL

const HEX = /^#[0-9a-f]{3,8}$/i
const RATIO = /^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/

const FALLBACK_THEME = {
  background: '#15100D',
  glow: '#2A1D15',
  panel: '#241A14',
  line: '#4D3B2C',
  accent: '#C29A4B',
  text: '#EADFCB',
  muted: '#BDAE98',
}

// Deck metadata is written by hand in each deck folder, so treat it as
// untrusted: only accept values that cannot break the stylesheet. Anything
// missing or malformed falls back, and says so in the console — a silent
// fallback is how "the standard deck is suddenly Gothic" happens.
function safeTheme(theme, deckId) {
  const out = { ...FALLBACK_THEME }
  const missing = []
  for (const key of Object.keys(FALLBACK_THEME)) {
    const value = theme?.[key]
    if (typeof value === 'string' && HEX.test(value)) {
      out[key] = value
    } else {
      missing.push(key)
    }
  }
  if (missing.length) {
    console.warn(
      `[decks] ${deckId}: deck.json has no usable ${missing.join(', ')} — ` +
        `using the built-in palette for ${missing.length === 1 ? 'it' : 'them'}.`,
    )
  }
  return out
}

function safeRatio(ratio) {
  return typeof ratio === 'string' && RATIO.test(ratio) ? ratio : '480 / 822'
}

function stripPeriod(text) {
  return String(text ?? '').replace(/\.\s*$/, '')
}

// Which image is the card back? deck.json can name it with "back"; otherwise it
// is the number after the highest card, so a deck that simply stops at 51 gets a
// back at 52. A last row that calls itself a back and carries no meanings is
// also taken as the back, so a 78-card deck whose row 78 says "Card Back" works
// even without the field.
function findBack(meta, byNumber) {
  const declared = Number(meta?.back)
  if (Number.isInteger(declared) && declared >= 0) return declared

  let highest = -1
  for (const number of byNumber.keys()) {
    if (number > highest) highest = number
  }

  const top = byNumber.get(highest)
  if (top && /\bback\b/i.test(top.name) && !top.upright && !top.reversed) {
    return highest
  }
  return highest + 1
}

function withUrl(deck) {
  return {
    ...deck,
    imageUrl: (number) => `${BASE}decks/${deck.id}/${number}.webp`,
  }
}

async function loadDeck(id) {
  const [metaRes, csvRes] = await Promise.all([
    fetch(`${BASE}decks/${id}/deck.json`),
    fetch(`${BASE}decks/${id}/cards.csv`),
  ])
  if (!metaRes.ok) {
    throw new Error(`Could not load decks/${id}/deck.json (HTTP ${metaRes.status})`)
  }
  if (!csvRes.ok) {
    throw new Error(`Could not load decks/${id}/cards.csv (HTTP ${csvRes.status})`)
  }

  const meta = await metaRes.json()
  const rows = csvToObjects(await csvRes.text())

  // Cards are addressed by the `number` column, so the deck is built from the
  // CSV and never from the image files — 52 cards or 102 work like 78 does.
  // 0 is a real card (The Fool), so test the number, never for truthiness.
  const byNumber = new Map()
  for (const row of rows) {
    const number = Number(row.number)
    if (!Number.isInteger(number) || number < 0) continue
    byNumber.set(number, {
      number,
      name: row.name || `Card ${number}`,
      upright: stripPeriod(row.upright),
      reversed: stripPeriod(row.reversed),
      description: row.description || '',
    })
  }

  if (byNumber.size === 0) {
    throw new Error(`decks/${id}/cards.csv has no readable cards`)
  }

  const back = findBack(meta, byNumber)
  const cards = new Map(byNumber)
  cards.delete(back)

  if (cards.size === 0) {
    throw new Error(
      `decks/${id}/cards.csv leaves no drawable cards once #${back} is the card back`,
    )
  }

  const backRow = byNumber.get(back)
  if (backRow && (backRow.upright || backRow.reversed)) {
    console.warn(
      `[decks] ${id}: #${back} is treated as the card back, but cards.csv gives ` +
        `it a meaning — it will never be dealt.`,
    )
  }

  // A gap in the numbering is otherwise silent: that card simply never appears
  // and the deck quietly gets smaller. Name the numbers that are missing.
  const highestRow = Math.max(...byNumber.keys())
  const gaps = []
  for (let n = 0; n <= highestRow; n++) {
    if (!byNumber.has(n)) gaps.push(n)
  }
  if (gaps.length) {
    console.warn(
      `[decks] ${id}: cards.csv has no row for #${gaps.join(', #')} — ` +
        `those cards cannot be dealt.`,
    )
  }

  return withUrl({
    id,
    name: typeof meta.name === 'string' && meta.name ? meta.name : id,
    description: typeof meta.description === 'string' ? meta.description : '',
    ratio: safeRatio(meta.ratio),
    theme: safeTheme(meta.theme, id),
    cards,
    count: cards.size,
    back,
  })
}

let libraryPromise = null

// Every deck is small (a few KB of text), so load them all up front. That is
// what makes switching decks instant: no network, no re-shuffle.
export function loadDeckLibrary() {
  if (!libraryPromise) {
    libraryPromise = (async () => {
      const indexRes = await fetch(`${BASE}decks/index.json`)
      if (!indexRes.ok) {
        throw new Error(`Could not load decks/index.json (HTTP ${indexRes.status})`)
      }
      const ids = await indexRes.json()
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('decks/index.json does not list any decks')
      }
      const decks = await Promise.all(ids.map((id) => loadDeck(String(id))))
      return { decks }
    })().catch((err) => {
      libraryPromise = null
      throw err
    })
  }
  return libraryPromise
}
