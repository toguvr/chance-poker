import { describe, expect, it } from 'vitest'
import { evaluate5, evaluate7, compareHands } from '../evaluator'
import type { Card } from '../../cards'

const asCards = (cards: string[]) => cards as Card[]

describe('evaluate5', () => {
  it('detects straight flush', () => {
    const cards = asCards(['As', 'Ks', 'Qs', 'Js', 'Ts'])
    const rank = evaluate5(cards)
    expect(rank.category).toBe('straight-flush')
  })

  it('detects full house', () => {
    const cards = asCards(['As', 'Ah', 'Ad', 'Kc', 'Kd'])
    const rank = evaluate5(cards)
    expect(rank.category).toBe('full-house')
  })
})

describe('evaluate7', () => {
  it('picks the best 5 cards', () => {
    const cards = asCards(['As', 'Ah', 'Ad', 'Kc', 'Kd', '2c', '3d'])
    const rank = evaluate7(cards)
    expect(rank.category).toBe('full-house')
  })

  it('compares hands correctly', () => {
    const strong = evaluate5(asCards(['As', 'Ah', 'Ad', 'Kc', 'Kd']))
    const weak = evaluate5(asCards(['Qs', 'Qh', 'Qd', 'Jc', 'Jd']))
    expect(compareHands(strong, weak)).toBeGreaterThan(0)
  })
})
