import { Art } from './Card.jsx'

// Every card in the deck, in number order, with both meanings. One page that
// answers "what is actually in this deck?" — and the simplest place to notice a
// deck that is smaller or larger than you thought, since the list is the deck.
function DeckPage({ deck }) {
  const cards = [...deck.cards.values()].sort((a, b) => a.number - b.number)

  return (
    <section className="deck-page">
      <div className="deck-page-head">
        <h2 className="section-label">The cards</h2>
        <p className="deck-page-count">
          {deck.count} {deck.count === 1 ? 'card' : 'cards'}, plus a card back at #
          {deck.back}. Open one to read both meanings.
        </p>
      </div>

      <div className="deck-grid">
        {cards.map((card) => (
          <details className="ref-card" key={card.number}>
            <summary className="ref-summary">
              <span className="ref-art">
                <Art
                  key={`${deck.id}-${card.number}`}
                  deck={deck}
                  number={card.number}
                  alt={card.name}
                  label={card.name}
                />
              </span>
              <span className="ref-title">
                <span className="ref-name">{card.name}</span>
                <span className="ref-number">#{card.number}</span>
              </span>
            </summary>
            <div className="ref-body">
              <dl className="ref-meanings">
                <div>
                  <dt>Upright</dt>
                  <dd>{card.upright || 'No upright meaning yet.'}</dd>
                </div>
                <div>
                  <dt>Reversed</dt>
                  <dd>{card.reversed || 'No reversed meaning yet.'}</dd>
                </div>
              </dl>
              {card.description ? (
                <p className="ref-description">{card.description}</p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export default DeckPage
