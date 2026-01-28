import type { Card } from '../cards'
import { valueIndexFromCard } from './shoe'

const valueForIndex = (index: number) => {
  if (index === 0) return 11
  if (index === 9) return 10
  return index + 1
}

export const cardValueForTotal = (card: Card) => valueForIndex(valueIndexFromCard(card))

export const handTotals = (cards: Card[]) => {
  let total = 0
  let softAces = 0

  for (const card of cards) {
    const idx = valueIndexFromCard(card)
    if (idx === 0) {
      total += 11
      softAces += 1
    } else {
      total += valueForIndex(idx)
    }
  }

  while (total > 21 && softAces > 0) {
    total -= 10
    softAces -= 1
  }

  const hard = total - softAces * 10
  const soft = softAces > 0 ? total : hard
  const isSoft = softAces > 0
  const best = total
  const isBust = total > 21
  const isBlackjack =
    cards.length === 2 &&
    !isBust &&
    cards.some((card) => card[0] === 'A') &&
    cards.some((card) => cardValueForTotal(card) === 10) &&
    best === 21

  return {
    hard,
    soft,
    best,
    isSoft,
    isBust,
    isBlackjack,
    softAces,
  }
}

export const normalizeTotals = (total: number, softAces: number) => {
  let t = total
  let s = softAces
  while (t > 21 && s > 0) {
    t -= 10
    s -= 1
  }
  return { total: t, softAces: s, isBust: t > 21 }
}

export const canSplit = (cards: Card[]) => cards.length === 2 && cards[0][0] === cards[1][0]
