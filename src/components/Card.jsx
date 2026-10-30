import { useState } from 'react'

// A missing image should not wreck the reading. If the file fails to load, show
// a themed placeholder holding the card's name and number, so you can see at a
// glance which file is absent. The `key` on each Art below resets this when the
// card or the deck changes (a re-shuffle reuses the same Card component).
function Art({ deck, number, alt, label }) {
  const [failed, setFailed] = useState(false)
  const src = deck.imageUrl(number)

  if (failed) {
    return (
      <span className="card-missing">
        <span className="card-missing-label">{label}</span>
        <span className="card-missing-note">
          {typeof number === 'number' ? `#${number} · ` : ''}art missing
        </span>
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => {
        console.warn(`[decks] ${deck.id}: could not load ${src}`)
        setFailed(true)
      }}
    />
  )
}

// The back is a picture too, but a deck that ships fronts only should still look
// like a deck: when the back image is absent, draw one from the theme instead of
// showing the missing-art placeholder.
function Back({ deck }) {
  const [failed, setFailed] = useState(false)
  const src = deck.imageUrl(deck.back)

  if (failed) {
    return <span className="card-back-drawn" aria-hidden="true" />
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => {
        console.warn(
          `[decks] ${deck.id}: no card back at ${src} — drawing one from the theme instead.`,
        )
        setFailed(true)
      }}
    />
  )
}

function Card({ deck, card, onReveal }) {
  const art = card && deck.cards.get(card.number)
  const name = art?.name ?? (card ? `Card ${card.number}` : 'Card')
  const label = card
    ? card.revealed
      ? `${name}${card.reversed ? ', reversed' : ''}`
      : `Face-down card: ${card.position.name}. Reveal it.`
    : 'Empty position'

  return (
    <button
      type="button"
      className={[
        'card',
        card?.revealed ? 'is-revealed' : '',
        card?.reversed ? 'is-reversed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={card && !card.revealed ? onReveal : undefined}
      disabled={!card || card.revealed}
      aria-label={label}
    >
      <div className="card-inner">
        <div className="card-face card-back">
          <Back key={`${deck.id}-back`} deck={deck} />
        </div>
        <div className="card-face card-front">
          {card ? (
            <Art
              key={`${deck.id}-${card.number}`}
              deck={deck}
              number={card.number}
              alt={name}
              label={name}
            />
          ) : null}
        </div>
      </div>
      <span className="card-position">{card?.position.name ?? ''}</span>
    </button>
  )
}

export default Card
