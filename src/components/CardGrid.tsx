import { RANKS, SUITS, SUIT_COLOR, SUIT_ICON } from '../lib/cards'
import type { Card, Suit } from '../lib/cards'
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

const buildCard = (rank: string, suit: Suit) => `${rank}${suit}` as Card
const suitName: Record<Suit, string> = {
  s: 'espadas',
  h: 'copas',
  d: 'ouros',
  c: 'paus',
}

export const CardGrid = (props: Props) => (
  <div className="card-grid">
    {SUITS.map((suit) => {
      const color = SUIT_COLOR[suit]
      return (
        <div className="card-suit-row" key={suit}>
          <div className={`card-suit-label ${color}`} aria-hidden="true">
            {SUIT_ICON[suit]}
          </div>
          <div className="card-suit-grid" role="group" aria-label={`Cartas de ${suitName[suit]}`}>
            {RANKS.map((rank) => {
              const card = buildCard(rank, suit)
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
        </div>
      )
    })}
  </div>
)
