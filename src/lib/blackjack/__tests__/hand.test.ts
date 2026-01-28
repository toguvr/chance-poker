import { describe, expect, it } from 'vitest'
import { handTotals } from '../hand'
import type { Card } from '../../cards'

const asCards = (cards: string[]) => cards as Card[]

describe('blackjack hand totals', () => {
  it('handles soft totals', () => {
    const totals = handTotals(asCards(['As', '6h']))
    expect(totals.best).toBe(17)
    expect(totals.isSoft).toBe(true)
  })

  it('adjusts multiple aces', () => {
    const totals = handTotals(asCards(['As', 'Ad', '9c']))
    expect(totals.best).toBe(21)
    expect(totals.isSoft).toBe(true)
  })
})
