import { useEffect, useMemo, useState } from 'react'
import { loadDeckLibrary } from './lib/decks.js'
import {
  CUSTOM_MIN,
  SPREADS,
  buildSpread,
  clampCount,
  drawCards,
} from './lib/spreads.js'
import Spread from './components/Spread.jsx'
import Details from './components/Details.jsx'

export default function App() {
  const [library, setLibrary] = useState(null)
  const [error, setError] = useState(null)

  const [deckId, setDeckId] = useState(null)
  const [spreadKey, setSpreadKey] = useState('three')
  const [customCount, setCustomCount] = useState(5)
  const [reading, setReading] = useState(null)

  useEffect(() => {
    let alive = true
    loadDeckLibrary()
      .then((lib) => {
        if (!alive) return
        setLibrary(lib)
        setDeckId(lib.decks[0].id)
      })
      .catch((err) => {
        if (alive) setError(err.message)
      })
    return () => {
      alive = false
    }
  }, [])

  const deck = useMemo(
    () => library?.decks.find((d) => d.id === deckId) ?? null,
    [library, deckId],
  )

  // A smaller deck must not leave the counter asking for cards it cannot deal.
  useEffect(() => {
    if (deck) setCustomCount((n) => clampCount(n, deck.count))
  }, [deck])

  const spread = useMemo(
    () => buildSpread(spreadKey, customCount, deck?.count),
    [spreadKey, customCount, deck?.count],
  )

  function startReading() {
    if (!deck) return
    setReading({ cards: drawCards(deck, spread.positions), spreadKey })
  }

  function revealCard(index) {
    setReading((current) => {
      if (!current) return current
      if (current.cards[index]?.revealed) return current
      const cards = current.cards.map((card, i) =>
        i === index ? { ...card, revealed: true } : card,
      )
      return { ...current, cards }
    })
  }

  function revealNext() {
    setReading((current) => {
      if (!current) return current
      const index = current.cards.findIndex((card) => !card.revealed)
      if (index === -1) return current
      const cards = current.cards.map((card, i) =>
        i === index ? { ...card, revealed: true } : card,
      )
      return { ...current, cards }
    })
  }

  function revealAll() {
    setReading((current) => {
      if (!current) return current
      return { ...current, cards: current.cards.map((c) => ({ ...c, revealed: true })) }
    })
  }

  if (error) {
    return (
      <main className="shell">
        <div className="notice">
          <h1>Could not load the decks</h1>
          <p>{error}</p>
          <p className="notice-hint">
            Each deck needs its own folder under <code>public/decks/</code> containing{' '}
            <code>cards.csv</code>, <code>deck.json</code> and images numbered from{' '}
            <code>0.webp</code>, plus one for the card back.
          </p>
        </div>
      </main>
    )
  }

  if (!library || !deck) {
    return (
      <main className="shell">
        <p className="loading">Shuffling the deck…</p>
      </main>
    )
  }

  const themeVars = {
    '--background': deck.theme.background,
    '--glow': deck.theme.glow,
    '--panel': deck.theme.panel,
    '--line': deck.theme.line,
    '--accent': deck.theme.accent,
    '--text': deck.theme.text,
    '--muted': deck.theme.muted,
    '--card-ratio': deck.ratio,
  }

  const revealedCount = reading
    ? reading.cards.filter((card) => card.revealed).length
    : 0

  return (
    <div className="app" style={themeVars}>
      <main className="shell">
        <header className="masthead">
          <div>
            <h1>Tarot</h1>
            <p className="subtitle">
              {deck.name} — {deck.description}
            </p>
          </div>
          <div className="deck-switch" role="group" aria-label="Deck">
            {library.decks.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`pill ${option.id === deck.id ? 'is-active' : ''}`}
                onClick={() => setDeckId(option.id)}
                aria-pressed={option.id === deck.id}
              >
                {option.name}
              </button>
            ))}
          </div>
        </header>

        {!reading ? (
          <section className="setup">
            <h2 className="section-label">Choose a spread</h2>
            <div className="spread-picker">
              {SPREADS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`spread-option ${option.key === spreadKey ? 'is-active' : ''}`}
                  onClick={() => setSpreadKey(option.key)}
                  aria-pressed={option.key === spreadKey}
                >
                  <span className="spread-option-label">
                    {option.label}
                    <span className="spread-option-count">
                      {option.key === 'custom'
                        ? `${customCount} cards`
                        : `${option.positions.length} ${
                            option.positions.length === 1 ? 'card' : 'cards'
                          }`}
                    </span>
                  </span>
                  <span className="spread-option-blurb">{option.blurb}</span>
                </button>
              ))}
            </div>

            {spreadKey === 'custom' ? (
              <div className="counter">
                <button
                  type="button"
                  onClick={() => setCustomCount((n) => clampCount(n - 1, deck.count))}
                  disabled={customCount <= CUSTOM_MIN}
                  aria-label="One card fewer"
                >
                  −
                </button>
                <span className="counter-value">{customCount}</span>
                <button
                  type="button"
                  onClick={() => setCustomCount((n) => clampCount(n + 1, deck.count))}
                  disabled={customCount >= deck.count}
                  aria-label="One card more"
                >
                  +
                </button>
              </div>
            ) : null}

            {spread.positions.length > deck.count ? (
              <p className="notice-hint">
                This deck holds {deck.count} cards, so it cannot deal{' '}
                {spread.positions.length}.
              </p>
            ) : null}

            <button
              type="button"
              className="primary"
              onClick={startReading}
              disabled={spread.positions.length > deck.count}
            >
              Shuffle and draw
            </button>
          </section>
        ) : (
          <section className="reading">
            <div className="reading-bar">
              <div>
                <h2 className="section-label">
                  {buildSpread(reading.spreadKey, reading.cards.length, deck.count).label}
                </h2>
                <p className="reading-progress">
                  {revealedCount} of {reading.cards.length} revealed
                </p>
              </div>
              <div className="reading-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={revealNext}
                  disabled={revealedCount === reading.cards.length}
                >
                  Reveal next
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={revealAll}
                  disabled={revealedCount === reading.cards.length}
                >
                  Reveal all
                </button>
                <button type="button" className="ghost" onClick={startReading}>
                  Shuffle again
                </button>
                <button type="button" className="ghost" onClick={() => setReading(null)}>
                  New reading
                </button>
              </div>
            </div>

            <Spread
              deck={deck}
              spread={buildSpread(reading.spreadKey, reading.cards.length, deck.count)}
              cards={reading.cards}
              onReveal={revealCard}
            />

            <Details deck={deck} cards={reading.cards} />
          </section>
        )}
      </main>
    </div>
  )
}
