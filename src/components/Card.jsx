function Card({ deck, card, onReveal }) {
  const art = card && deck.cards.get(card.number)
  const label = card
    ? card.revealed
      ? `${art?.name ?? 'Card'}${card.reversed ? ', reversed' : ''}`
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
          <img src={deck.imageUrl(deck.back)} alt="" loading="lazy" />
        </div>
        <div className="card-face card-front">
          {card ? (
            <img
              src={deck.imageUrl(card.number)}
              alt={art?.name ?? 'Card'}
              loading="lazy"
            />
          ) : null}
        </div>
      </div>
      <span className="card-position">{card?.position.name ?? ''}</span>
    </button>
  )
}

export default Card
