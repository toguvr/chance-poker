import { describe, expect, it } from 'vitest'
import { runMonteCarlo } from '../monteCarlo'
import type { SimulationInput } from '../simTypes'

const input: SimulationInput = {
  hero: ['As', 'Ah'],
  board: ['2c', '7d', '9h'],
  players: 2,
  iterations: 2000,
  mode: 'random',
}

describe('runMonteCarlo', () => {
  it('returns consistent totals', () => {
    const result = runMonteCarlo(input)
    expect(result.win + result.tie + result.lose).toBe(result.iterations)
    expect(result.equity).toBeGreaterThanOrEqual(0)
    expect(result.equity).toBeLessThanOrEqual(1)
  })
})
