import Card from './Card.jsx'

function Spread({ deck, spread, cards, onReveal }) {
  const style =
    spread.layout === 'row'
      ? { '--cols': spread.positions.length }
      : undefined

  return (
    <div className={`spread spread-${spread.layout}`} style={style}>
      {spread.positions.map((position, i) => {
        const gridStyle =
          spread.layout === 'celtic'
            ? { gridColumn: position.col + 1, gridRow: position.row + 1 }
            : undefined

        return (
          <div
            key={`${position.name}-${i}`}
            className="slot"
            data-cross={position.cross ? 'true' : undefined}
            style={gridStyle}
          >
            <Card deck={deck} card={cards[i]} onReveal={() => onReveal(i)} />
          </div>
        )
      })}
    </div>
  )
}

export default Spread
