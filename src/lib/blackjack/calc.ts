import type { Card } from '../cards'
import { dealerDistribution } from './dealer'
import { handTotals, normalizeTotals, canSplit } from './hand'
import { hitEV, hitOnceEV, standEV } from './ev'
import { removeCardsFromShoe, shoeCountForDecks, totalCardsInShoe, valueIndexFromCard } from './shoe'
import type { BlackjackAction, BlackjackInput, BlackjackResult, DealerDistribution } from './types'

const valueForIndex = (index: number) => {
  if (index === 0) return 11
  if (index === 9) return 10
  return index + 1
}

const buildDealerDistProvider = (
  baseCounts: number[],
  upcardIndex: number,
  holeIndex: number | null,
  dealerHitsSoft17: boolean,
) => {
  const memo = new Map<string, DealerDistribution>()
  return (counts: number[]) => {
    const key = `${counts.join(',')}|${upcardIndex}|${holeIndex ?? 'u'}|${dealerHitsSoft17 ? 1 : 0}`
    const cached = memo.get(key)
    if (cached) return cached
    const dist = dealerDistribution(counts, upcardIndex, holeIndex, dealerHitsSoft17)
    memo.set(key, dist)
    return dist
  }
}

const playerBustProbOnHit = (counts: number[], total: number, softAces: number) => {
  const totalCards = counts.reduce((sum, value) => sum + value, 0)
  if (totalCards === 0) return 0
  let bustProb = 0
  for (let i = 0; i < counts.length; i += 1) {
    const count = counts[i]
    if (count === 0) continue
    const value = valueForIndex(i)
    const next = normalizeTotals(total + value, softAces + (i === 0 ? 1 : 0))
    if (next.isBust) bustProb += count / totalCards
  }
  return bustProb
}

const splitEV = (
  counts: number[],
  splitCard: Card,
  distProvider: (counts: number[]) => DealerDistribution,
  rules: BlackjackInput['rules'],
) => {
  const index = valueIndexFromCard(splitCard)
  const totalCards = counts.reduce((sum, value) => sum + value, 0)
  if (totalCards === 0) return -1

  let ev = 0
  for (let i = 0; i < counts.length; i += 1) {
    const count = counts[i]
    if (count === 0) continue
    const nextCounts = [...counts]
    nextCounts[i] -= 1

    const value = valueForIndex(index) + valueForIndex(i)
    const softAces = (index === 0 ? 1 : 0) + (i === 0 ? 1 : 0)
    const childEV = hitEV(nextCounts, value, softAces, distProvider, rules)
    ev += (count / totalCards) * childEV
  }

  return ev * 2
}

export const calculateBlackjack = (input: BlackjackInput): BlackjackResult => {
  const { decks, playerCards, dealerUpcard, dealerHoleCard, discards, rules } = input
  const baseCounts = shoeCountForDecks(decks)
  const usedCards: Card[] = [...playerCards, ...discards]
  if (dealerUpcard) usedCards.push(dealerUpcard)
  if (dealerHoleCard) usedCards.push(dealerHoleCard)
  const remainingCounts = removeCardsFromShoe(baseCounts, usedCards)
  const remainingCards = totalCardsInShoe(remainingCounts)

  const totals = handTotals(playerCards)

  if (!dealerUpcard) {
    return {
      dealerBustProb: 0,
      dealerDistribution: {
        bust: 0,
        bj: 0,
        17: 0,
        18: 0,
        19: 0,
        20: 0,
        21: 0,
      },
      playerHitBustProb: 0,
      actionEVs: {},
      bestAction: 'stand',
      playerTotals: {
        hard: totals.hard,
        soft: totals.soft,
        best: totals.best,
        isSoft: totals.isSoft,
        isBlackjack: totals.isBlackjack,
        isBust: totals.isBust,
      },
      remainingCards,
    }
  }

  const upIndex = valueIndexFromCard(dealerUpcard)
  const holeIndex = dealerHoleCard ? valueIndexFromCard(dealerHoleCard) : null

  const distProvider = buildDealerDistProvider(remainingCounts, upIndex, holeIndex, rules.dealerHitsSoft17)
  const dealerDist = distProvider(remainingCounts)

  const playerHitBust = playerBustProbOnHit(remainingCounts, totals.best, totals.softAces)

  const evStand = standEV(totals.best, totals.softAces, totals.isBlackjack, dealerDist, rules)
  const evHit = totals.isBlackjack ? evStand : hitEV(remainingCounts, totals.best, totals.softAces, distProvider, rules)
  const evDouble = rules.allowDouble && !totals.isBust ? hitOnceEV(remainingCounts, totals.best, totals.softAces, distProvider, rules) * 2 : undefined
  const evSurrender = rules.allowSurrender ? -0.5 : undefined
  const evSplit = rules.allowSplit && canSplit(playerCards) ? splitEV(remainingCounts, playerCards[0], distProvider, rules) : undefined

  const actionEVs: Partial<Record<BlackjackAction, number>> = {
    stand: evStand,
    hit: evHit,
  }
  if (evDouble !== undefined) actionEVs.double = evDouble
  if (evSplit !== undefined) actionEVs.split = evSplit
  if (evSurrender !== undefined) actionEVs.surrender = evSurrender

  const bestAction = (Object.entries(actionEVs) as [BlackjackAction, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'stand'

  return {
    dealerBustProb: dealerDist.bust,
    dealerDistribution: dealerDist,
    playerHitBustProb: playerHitBust,
    actionEVs,
    bestAction,
    playerTotals: {
      hard: totals.hard,
      soft: totals.soft,
      best: totals.best,
      isSoft: totals.isSoft,
      isBlackjack: totals.isBlackjack,
      isBust: totals.isBust,
    },
    remainingCards,
  }
}
