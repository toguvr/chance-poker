import { ALL_CARDS } from '../lib/cards'
import type { Card } from '../lib/cards'
import { CardTile } from './CardTile'

type UniqueProps = {
  mode?: 'unique'
  selected: Set<Card>
  blocked: Set<Card>
  onCardClick: (card: Card) => void
}

type MultiProps = {
  mode: 'multi'
  counts: Record<Card, number>
  maxCopies: Record<Card, number>
  onCardClick: (card: Card) => void
  onCardRightClick: (card: Card) => void
}

type Props = UniqueProps | MultiProps

export const CardGrid = (props: Props) => (
  <div className="card-grid">
    {ALL_CARDS.map((card) => {
      if (props.mode === 'multi') {
        const count = props.counts[card] ?? 0
        const max = props.maxCopies[card] ?? 0
        return (
          <CardTile
            key={card}
            card={card}
            selected={count > 0}
            blocked={count >= max}
            count={count}
            onClick={() => props.onCardClick(card)}
            onRightClick={() => props.onCardRightClick(card)}
            size="sm"
          />
        )
      }

      return (
        <CardTile
          key={card}
          card={card}
          selected={props.selected.has(card)}
          blocked={props.blocked.has(card) && !props.selected.has(card)}
          onClick={() => props.onCardClick(card)}
          size="sm"
        />
      )
    })}
  </div>
)
