import { describe, expect, it } from 'vitest'
import { calculateBlackjack } from '../calc'
import type { BlackjackInput } from '../types'

const baseRules: BlackjackInput['rules'] = {
  dealerHitsSoft17: false,
  blackjackPayout: '3:2',
  allowDouble: true,
  allowSplit: true,
  allowSurrender: false,
}

describe('blackjack EV', () => {
  it('prefers stand on 20 vs dealer 6', () => {
    const input: BlackjackInput = {
      decks: 1,
      playerCards: ['Ks', 'Qd'],
      dealerUpcard: '6h',
      dealerHoleCard: null,
      discards: [],
      rules: baseRules,
    }
    const result = calculateBlackjack(input)
    expect(result.actionEVs.stand).toBeDefined()
    expect(result.actionEVs.hit).toBeDefined()
    expect(result.actionEVs.stand).toBeGreaterThan(result.actionEVs.hit ?? -1)
  })
})
