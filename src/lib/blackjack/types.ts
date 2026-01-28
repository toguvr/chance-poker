import type { Card } from '../cards'

export type BlackjackRules = {
  dealerHitsSoft17: boolean
  blackjackPayout: '3:2' | '6:5'
  allowDouble: boolean
  allowSplit: boolean
  allowSurrender: boolean
}

export type BlackjackInput = {
  decks: number
  playerCards: Card[]
  dealerUpcard: Card | null
  dealerHoleCard: Card | null
  discards: Card[]
  rules: BlackjackRules
}

export type DealerDistribution = {
  bust: number
  bj: number
  17: number
  18: number
  19: number
  20: number
  21: number
}

export type BlackjackAction = 'stand' | 'hit' | 'double' | 'split' | 'surrender'

export type BlackjackResult = {
  dealerBustProb: number
  dealerDistribution: DealerDistribution
  playerHitBustProb: number
  actionEVs: Partial<Record<BlackjackAction, number>>
  bestAction: BlackjackAction
  playerTotals: {
    hard: number
    soft: number
    best: number
    isSoft: boolean
    isBlackjack: boolean
    isBust: boolean
  }
  remainingCards: number
}

export type WorkerMessage =
  | { type: 'start'; payload: BlackjackInput }
  | { type: 'cancel' }

export type WorkerResponse =
  | { type: 'result'; payload: BlackjackResult }
  | { type: 'error'; payload: string }
