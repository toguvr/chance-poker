import { ALL_CARDS } from './cards'
import type { Card } from './cards'
import { compareHands, evaluate7 } from './evaluator'

export type ExactResult = {
  win: number
  tie: number
  lose: number
  total: number
}

const buildDeck = (used: Set<Card>) => ALL_CARDS.filter((card) => !used.has(card))

const evaluateShowdown = (hero: Card[], board: Card[], opponents: Card[][]) => {
  const heroRank = evaluate7([...hero, ...board])
  const opponentRanks = opponents.map((hand) => evaluate7([...hand, ...board]))

  let best = heroRank
  for (const opp of opponentRanks) {
    if (compareHands(opp, best) > 0) best = opp
  }

  const heroCompare = compareHands(heroRank, best)
  const ties = opponentRanks.filter((opp) => compareHands(opp, heroRank) === 0).length

  if (heroCompare < 0) return 'lose'
  if (ties > 0) return 'tie'
  return 'win'
}

export const exactEquity = (hero: Card[], board: Card[], players: number): ExactResult => {
  const opponentsCount = players - 1
  if (board.length !== 5) {
    throw new Error('Exato disponivel apenas com o river completo.')
  }

  const used = new Set<Card>([...hero, ...board])
  const deck = buildDeck(used)
  const opponents: Card[][] = []
  let win = 0
  let tie = 0
  let lose = 0
  let total = 0

  const recurse = (startDeck: Card[], depth: number) => {
    if (depth === opponentsCount) {
      total += 1
      const outcome = evaluateShowdown(hero, board, opponents)
      if (outcome === 'win') win += 1
      if (outcome === 'tie') tie += 1
      if (outcome === 'lose') lose += 1
      return
    }

    for (let i = 0; i < startDeck.length - 1; i += 1) {
      for (let j = i + 1; j < startDeck.length; j += 1) {
        const cardA = startDeck[i]
        const cardB = startDeck[j]
        opponents.push([cardA, cardB])

        const nextDeck = startDeck.filter((_, idx) => idx !== i && idx !== j)
        recurse(nextDeck, depth + 1)
        opponents.pop()
      }
    }
  }

  recurse(deck, 0)

  return { win, tie, lose, total }
}
