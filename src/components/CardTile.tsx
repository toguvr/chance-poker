import { SUIT_COLOR, SUIT_ICON } from '../lib/cards'
import type { Card, Suit } from '../lib/cards'

const rankLabel: Record<string, string> = {
  T: '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
}

const labelRank = (rank: string) => rankLabel[rank] ?? rank

type Props = {
  card?: Card
  size?: 'sm' | 'md'
  selected?: boolean
  blocked?: boolean
  ghost?: boolean
  count?: number
  onClick?: () => void
  onRightClick?: () => void
}

export const CardTile = ({ card, size = 'md', selected, blocked, ghost, count, onClick, onRightClick }: Props) => {
  const rank = card ? card[0] : '?'
  const suit = card ? (card[1] as Suit) : 's'
  const color = SUIT_COLOR[suit]

  return (
    <button
      className={`card-tile ${size} ${selected ? 'selected' : ''} ${blocked ? 'blocked' : ''} ${ghost ? 'ghost' : ''}`}
      onClick={onClick}
      onContextMenu={(event) => {
        if (!onRightClick) return
        event.preventDefault()
        onRightClick()
      }}
      type="button"
      disabled={blocked}
      aria-label={card ? `Carta ${rank}${suit}` : 'Carta vazia'}
    >
      {count && count > 1 ? <span className="card-count">{count}</span> : null}
      <div className={`card-rank ${color}`}>{labelRank(rank)}</div>
      <div className={`card-suit ${color}`}>{SUIT_ICON[suit]}</div>
    </button>
  )
}
