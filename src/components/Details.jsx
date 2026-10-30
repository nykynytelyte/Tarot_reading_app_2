function Details({ deck, cards }) {
  const revealed = cards.filter((card) => card.revealed)

  if (revealed.length === 0) {
    return (
      <p className="details-empty">
        Tap the cards, or use <strong>Reveal next</strong>, to turn them over.
      </p>
    )
  }

  return (
    <ol className="details">
      {revealed.map((card, i) => {
        const art = deck.cards.get(card.number)
        if (!art) return null
        const active = card.reversed ? art.reversed : art.upright
        const other = card.reversed ? art.upright : art.reversed

        return (
          <li key={`${card.number}-${i}`} className="detail">
            <p className="detail-position">
              {card.position.name}
              {card.position.meaning ? (
                <span className="detail-position-meaning"> — {card.position.meaning}</span>
              ) : null}
            </p>
            <h3 className="detail-name">
              {art.name}
              <span className={`badge ${card.reversed ? 'badge-reversed' : ''}`}>
                {card.reversed ? 'reversed' : 'upright'}
              </span>
            </h3>
            <p className="detail-meaning">{active}</p>
            {other ? (
              <p className="detail-other">
                {card.reversed ? 'Upright' : 'Reversed'}: {other}
              </p>
            ) : null}
            {art.description ? (
              <p className="detail-description">{art.description}</p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export default Details
