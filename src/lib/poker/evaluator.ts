import { cardRankValue, cardSuit } from '../cards'
import type { Card } from '../cards'
import { choose5of7 } from './combinatorics'

export type HandCategory =
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-kind'
  | 'straight-flush'

export const HAND_CATEGORY_ORDER: HandCategory[] = [
  'high-card',
  'pair',
  'two-pair',
  'three-kind',
  'straight',
  'flush',
  'full-house',
  'four-kind',
  'straight-flush',
]

export type HandRank = {
  category: HandCategory
  categoryIndex: number
  tiebreakers: number[]
}

const isWheel = (ranks: number[]) => {
  const sorted = [...ranks].sort((a, b) => b - a)
  return sorted[0] === 14 && sorted[1] === 5 && sorted[2] === 4 && sorted[3] === 3 && sorted[4] === 2
}

const straightHigh = (ranks: number[]) => {
  const unique = Array.from(new Set(ranks)).sort((a, b) => b - a)
  if (unique.length !== 5) return null
  if (unique[0] - unique[4] === 4) return unique[0]
  if (isWheel(unique)) return 5
  return null
}

export const evaluate5 = (cards: Card[]): HandRank => {
  const ranks = cards.map(cardRankValue).sort((a, b) => b - a)
  const suits = cards.map(cardSuit)
  const isFlush = suits.every((s) => s === suits[0])
  const straight = straightHigh(ranks)

  const countMap = new Map<number, number>()
  for (const rank of ranks) {
    countMap.set(rank, (countMap.get(rank) ?? 0) + 1)
  }
  const groups = Array.from(countMap.entries())
    .map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => (b.count - a.count) || (b.rank - a.rank))

  if (straight && isFlush) {
    return { category: 'straight-flush', categoryIndex: 8, tiebreakers: [straight] }
  }

  if (groups[0].count === 4) {
    const kicker = groups[1].rank
    return { category: 'four-kind', categoryIndex: 7, tiebreakers: [groups[0].rank, kicker] }
  }

  if (groups[0].count === 3 && groups[1].count === 2) {
    return { category: 'full-house', categoryIndex: 6, tiebreakers: [groups[0].rank, groups[1].rank] }
  }

  if (isFlush) {
    return { category: 'flush', categoryIndex: 5, tiebreakers: ranks }
  }

  if (straight) {
    return { category: 'straight', categoryIndex: 4, tiebreakers: [straight] }
  }

  if (groups[0].count === 3) {
    const kickers = groups.slice(1).map((g) => g.rank).sort((a, b) => b - a)
    return { category: 'three-kind', categoryIndex: 3, tiebreakers: [groups[0].rank, ...kickers] }
  }

  if (groups[0].count === 2 && groups[1].count === 2) {
    const highPair = Math.max(groups[0].rank, groups[1].rank)
    const lowPair = Math.min(groups[0].rank, groups[1].rank)
    const kicker = groups[2].rank
    return { category: 'two-pair', categoryIndex: 2, tiebreakers: [highPair, lowPair, kicker] }
  }

  if (groups[0].count === 2) {
    const kickers = groups.slice(1).map((g) => g.rank).sort((a, b) => b - a)
    return { category: 'pair', categoryIndex: 1, tiebreakers: [groups[0].rank, ...kickers] }
  }

  return { category: 'high-card', categoryIndex: 0, tiebreakers: ranks }
}

export const compareHands = (a: HandRank, b: HandRank) => {
  if (a.categoryIndex !== b.categoryIndex) return a.categoryIndex - b.categoryIndex
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i += 1) {
    const diff = (a.tiebreakers[i] ?? 0) - (b.tiebreakers[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

const fiveCardCombos = choose5of7(7)

export const evaluate7 = (cards: Card[]): HandRank => {
  let best: HandRank | null = null
  for (const combo of fiveCardCombos) {
    const hand = combo.map((index) => cards[index])
    const rank = evaluate5(hand)
    if (!best || compareHands(rank, best) > 0) best = rank
  }
  return best as HandRank
}
