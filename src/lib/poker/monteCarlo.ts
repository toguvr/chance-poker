import { ALL_CARDS } from '../cards'
import type { Card } from '../cards'
import { drawRandom } from './combinatorics'
import { compareHands, evaluate7 } from './evaluator'
import { parseRange } from './range'
import type { SimulationInput, SimulationProgress, SimulationResult } from './simTypes'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

const buildDeck = (used: Set<Card>) => ALL_CARDS.filter((card) => !used.has(card))

const pickOpponentHand = (deck: Card[], rangeCombos: Card[][] | null) => {
  if (rangeCombos && rangeCombos.length > 0) {
    const shuffled = rangeCombos.slice().sort(() => Math.random() - 0.5)
    for (const combo of shuffled) {
      if (deck.includes(combo[0]) && deck.includes(combo[1])) {
        deck.splice(deck.indexOf(combo[0]), 1)
        deck.splice(deck.indexOf(combo[1]), 1)
        return combo
      }
    }
  }
  return drawRandom(deck, 2)
}

const evaluateShowdown = (hero: Card[], board: Card[], opponents: Card[][]) => {
  const heroRank = evaluate7([...hero, ...board])
  const opponentRanks = opponents.map((hand) => evaluate7([...hand, ...board]))

  let best = heroRank
  for (const opp of opponentRanks) {
    if (compareHands(opp, best) > 0) best = opp
  }

  const heroCompare = compareHands(heroRank, best)
  const ties = opponentRanks.filter((opp) => compareHands(opp, heroRank) === 0).length

  if (heroCompare < 0) return { outcome: 'lose' as const, heroCategory: heroRank.category }
  if (ties > 0) return { outcome: 'tie' as const, heroCategory: heroRank.category }
  return { outcome: 'win' as const, heroCategory: heroRank.category }
}

export const runMonteCarlo = (
  input: SimulationInput,
  opts?: {
    onProgress?: (progress: SimulationProgress) => void
    shouldCancel?: () => boolean
  },
): SimulationResult => {
  const { hero, board, players, iterations, mode, rangeText } = input
  const rangeCombos = mode === 'range' ? parseRange(rangeText ?? '') : null
  const handHistogram: Record<string, number> = {}

  let win = 0
  let tie = 0
  let lose = 0
  const start = now()

  for (let i = 0; i < iterations; i += 1) {
    if (opts?.shouldCancel?.()) break

    const used = new Set<Card>([...hero, ...board])
    const deck = buildDeck(used)

    const missingBoard = 5 - board.length
    const completedBoard = missingBoard > 0 ? [...board, ...drawRandom(deck, missingBoard)] : board

    const opponents: Card[][] = []
    for (let p = 0; p < players - 1; p += 1) {
      opponents.push(pickOpponentHand(deck, rangeCombos))
    }

    const { outcome, heroCategory } = evaluateShowdown(hero, completedBoard, opponents)

    if (outcome === 'win') win += 1
    if (outcome === 'tie') tie += 1
    if (outcome === 'lose') lose += 1
    handHistogram[heroCategory] = (handHistogram[heroCategory] ?? 0) + 1

    if (i % 500 === 0 && opts?.onProgress) {
      const elapsed = now() - start
      const progress = (i + 1) / iterations
      const eta = progress > 0 ? elapsed * (1 / progress - 1) : 0
      opts.onProgress({ completed: i + 1, total: iterations, elapsedMs: elapsed, etaMs: eta })
    }
  }

  const total = win + tie + lose
  const equity = total > 0 ? (win + tie / players) / total : 0
  const p = equity
  const confidence = total > 0 ? 1.96 * Math.sqrt((p * (1 - p)) / total) : 0

  return {
    win,
    tie,
    lose,
    iterations: total,
    equity,
    confidence,
    handHistogram: handHistogram as Record<string, number>,
  }
}
