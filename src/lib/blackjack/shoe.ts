import type { Card } from '../cards'

export const shoeCountForDecks = (decks: number) => {
  const counts = Array.from({ length: 10 }, () => 0)
  counts[0] = 4 * decks
  for (let i = 1; i <= 8; i += 1) {
    counts[i] = 4 * decks
  }
  counts[9] = 16 * decks
  return counts
}

export const valueIndexFromCard = (card: Card) => {
  const rank = card[0]
  if (rank === 'A') return 0
  if (rank === 'T' || rank === 'J' || rank === 'Q' || rank === 'K') return 9
  return Math.max(1, Math.min(8, Number(rank) - 1))
}

export const removeCardsFromShoe = (counts: number[], cards: Card[]) => {
  const next = [...counts]
  for (const card of cards) {
    const idx = valueIndexFromCard(card)
    next[idx] = Math.max(0, next[idx] - 1)
  }
  return next
}

export const totalCardsInShoe = (counts: number[]) => counts.reduce((sum, value) => sum + value, 0)
