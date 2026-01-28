import type { DealerDistribution } from './types'

const emptyDistribution = (): DealerDistribution => ({
  bust: 0,
  bj: 0,
  17: 0,
  18: 0,
  19: 0,
  20: 0,
  21: 0,
})

const countsKey = (counts: number[], total: number, softAces: number) =>
  `${counts.join(',')}|${total}|${softAces}`

const valueForIndex = (index: number) => {
  if (index === 0) return 11
  if (index === 9) return 10
  return index + 1
}

const normalize = (total: number, softAces: number) => {
  let t = total
  let s = softAces
  while (t > 21 && s > 0) {
    t -= 10
    s -= 1
  }
  return { total: t, softAces: s }
}

const mergeDist = (target: DealerDistribution, dist: DealerDistribution, weight: number) => {
  for (const key of Object.keys(target) as (keyof DealerDistribution)[]) {
    target[key] += dist[key] * weight
  }
}

const dealerDraw = (
  counts: number[],
  total: number,
  softAces: number,
  dealerHitsSoft17: boolean,
  memo: Map<string, DealerDistribution>,
): DealerDistribution => {
  const normalized = normalize(total, softAces)
  const t = normalized.total
  const s = normalized.softAces
  if (t > 21) {
    const dist = emptyDistribution()
    dist.bust = 1
    return dist
  }

  if (t > 17 || (t === 17 && (!dealerHitsSoft17 || s === 0))) {
    const dist = emptyDistribution()
    dist[t as 17 | 18 | 19 | 20 | 21] = 1
    return dist
  }

  const key = countsKey(counts, t, s)
  const cached = memo.get(key)
  if (cached) return cached

  const totalCards = counts.reduce((sum, value) => sum + value, 0)
  const dist = emptyDistribution()

  for (let i = 0; i < counts.length; i += 1) {
    const count = counts[i]
    if (count === 0) continue
    const nextCounts = [...counts]
    nextCounts[i] -= 1
    const value = valueForIndex(i)
    const nextTotal = t + value
    const nextSoft = s + (i === 0 ? 1 : 0)
    const child = dealerDraw(nextCounts, nextTotal, nextSoft, dealerHitsSoft17, memo)
    mergeDist(dist, child, count / totalCards)
  }

  memo.set(key, dist)
  return dist
}

export const dealerDistribution = (
  counts: number[],
  upcardIndex: number,
  holeIndex: number | null,
  dealerHitsSoft17: boolean,
): DealerDistribution => {
  const memo = new Map<string, DealerDistribution>()
  const dist = emptyDistribution()
  const totalCards = counts.reduce((sum, value) => sum + value, 0)
  if (totalCards === 0) return dist

  const drawWithHole = (holeIdx: number, weight: number) => {
    const localCounts = [...counts]
    if (localCounts[holeIdx] <= 0) return
    localCounts[holeIdx] -= 1

    const initialTotal = valueForIndex(upcardIndex) + valueForIndex(holeIdx)
    const initialSoft = (upcardIndex === 0 ? 1 : 0) + (holeIdx === 0 ? 1 : 0)

    if ((upcardIndex === 0 && holeIdx === 9) || (upcardIndex === 9 && holeIdx === 0)) {
      dist.bj += weight
      return
    }

    const child = dealerDraw(localCounts, initialTotal, initialSoft, dealerHitsSoft17, memo)
    mergeDist(dist, child, weight)
  }

  if (holeIndex !== null) {
    const weight = 1
    drawWithHole(holeIndex, weight)
  } else {
    for (let i = 0; i < counts.length; i += 1) {
      if (counts[i] === 0) continue
      drawWithHole(i, counts[i] / totalCards)
    }
  }

  return dist
}
