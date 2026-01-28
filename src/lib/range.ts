import { RANKS } from './cards'
import type { Card, Rank, Suit } from './cards'

const rankIndex = (rank: Rank) => RANKS.indexOf(rank)

const parseToken = (token: string) => token.trim().toUpperCase()

const buildCombos = (r1: Rank, r2: Rank, suited: boolean | null): Card[][] => {
  const suits: Suit[] = ['s', 'h', 'd', 'c']
  const combos: Card[][] = []
  if (r1 === r2) {
    for (let i = 0; i < suits.length; i += 1) {
      for (let j = i + 1; j < suits.length; j += 1) {
        combos.push([`${r1}${suits[i]}` as Card, `${r2}${suits[j]}` as Card])
      }
    }
    return combos
  }

  for (const s1 of suits) {
    for (const s2 of suits) {
      if (s1 === s2 && suited === false) continue
      if (s1 !== s2 && suited === true) continue
      combos.push([`${r1}${s1}` as Card, `${r2}${s2}` as Card])
    }
  }
  return combos
}

export const parseRange = (range: string): Card[][] => {
  if (!range.trim()) return []
  const tokens = range.split(',').map(parseToken).filter(Boolean)
  const combos: Card[][] = []

  for (const token of tokens) {
    const suitedFlag = token.endsWith('S') ? true : token.endsWith('O') ? false : null
    const base = suitedFlag === null ? token : token.slice(0, -1)

    if (base.length === 2 && base[0] === base[1]) {
      const rank = base[0] as Rank
      combos.push(...buildCombos(rank, rank, null))
      continue
    }

    if (base.length === 2) {
      const r1 = base[0] as Rank
      const r2 = base[1] as Rank
      combos.push(...buildCombos(r1, r2, suitedFlag))
      continue
    }

    if (base.length === 3 && base[1] === '+') {
      const high = base[0] as Rank
      const low = base[2] as Rank
      const start = rankIndex(low)
      const end = rankIndex(high)
      for (let i = start; i <= end; i += 1) {
        combos.push(...buildCombos(high, RANKS[i] as Rank, suitedFlag))
      }
      continue
    }
  }

  return combos
}
