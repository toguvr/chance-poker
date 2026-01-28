import { ALL_CARDS } from '../lib/cards'
import type { Card } from '../lib/cards'
import { CardTile } from './CardTile'

type Props = {
  selected: Set<Card>
  blocked: Set<Card>
  onCardClick: (card: Card) => void
}

export const CardGrid = ({ selected, blocked, onCardClick }: Props) => (
  <div className="card-grid">
    {ALL_CARDS.map((card) => (
      <CardTile
        key={card}
        card={card}
        selected={selected.has(card)}
        blocked={blocked.has(card) && !selected.has(card)}
        onClick={() => onCardClick(card)}
        size="sm"
      />
    ))}
  </div>
)
