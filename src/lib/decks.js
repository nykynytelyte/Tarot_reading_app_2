import { csvToObjects } from './csv.js'

const BASE = import.meta.env.BASE_URL
const CARD_BACK = 78

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
// untrusted: only accept values that cannot break the stylesheet.
function safeTheme(theme) {
  const out = { ...FALLBACK_THEME }
  for (const [key, value] of Object.entries(theme ?? {})) {
    if (key in out && typeof value === 'string' && HEX.test(value)) {
      out[key] = value
    }
  }
  return out
}

function safeRatio(ratio) {
  return typeof ratio === 'string' && RATIO.test(ratio) ? ratio : '480 / 822'
}

function stripPeriod(text) {
  return String(text ?? '').replace(/\.\s*$/, '')
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

  const cards = new Map()
  for (const row of rows) {
    const number = Number(row.number)
    // The pool is 0-77. Row 78 is the card back and is not drawable; note that
    // 0 is a real card (The Fool), so test the number, never for truthiness.
    if (!Number.isInteger(number) || number < 0 || number > 77) continue
    cards.set(number, {
      number,
      name: row.name || `Card ${number}`,
      upright: stripPeriod(row.upright),
      reversed: stripPeriod(row.reversed),
      description: row.description || '',
    })
  }

  if (cards.size === 0) {
    throw new Error(`decks/${id}/cards.csv has no readable cards`)
  }

  return withUrl({
    id,
    name: typeof meta.name === 'string' && meta.name ? meta.name : id,
    description: typeof meta.description === 'string' ? meta.description : '',
    ratio: safeRatio(meta.ratio),
    theme: safeTheme(meta.theme),
    cards,
    back: CARD_BACK,
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
