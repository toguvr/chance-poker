import type { BlackjackRules, DealerDistribution } from './types'
import { normalizeTotals } from './hand'

const payoutValue = (payout: BlackjackRules['blackjackPayout']) => (payout === '3:2' ? 1.5 : 1.2)

const dealerBustProb = (dist: DealerDistribution) => dist.bust

const dealerBjProb = (dist: DealerDistribution) => dist.bj

const dealerTotals = (dist: DealerDistribution) => [17, 18, 19, 20, 21].map((t) => ({ total: t, prob: dist[t as 17 | 18 | 19 | 20 | 21] }))

export const standEV = (
  total: number,
  softAces: number,
  isBlackjack: boolean,
  dist: DealerDistribution,
  rules: BlackjackRules,
) => {
  const normalized = normalizeTotals(total, softAces)
  if (normalized.isBust) return -1

  if (isBlackjack) {
    return payoutValue(rules.blackjackPayout) * (1 - dealerBjProb(dist))
  }

  let ev = 0
  ev += dealerBustProb(dist) * 1
  for (const item of dealerTotals(dist)) {
    if (item.total < normalized.total) ev += item.prob
    if (item.total > normalized.total) ev -= item.prob
  }
  ev -= dealerBjProb(dist)
  return ev
}

export const hitOnceEV = (
  counts: number[],
  total: number,
  softAces: number,
  distProvider: (counts: number[]) => DealerDistribution,
  rules: BlackjackRules,
) => {
  const totalCards = counts.reduce((sum, value) => sum + value, 0)
  if (totalCards === 0) return -1

  let ev = 0
  for (let i = 0; i < counts.length; i += 1) {
    const count = counts[i]
    if (count === 0) continue
    const nextCounts = [...counts]
    nextCounts[i] -= 1

    const value = i === 0 ? 11 : i === 9 ? 10 : i + 1
    const nextTotal = total + value
    const nextSoft = softAces + (i === 0 ? 1 : 0)
    const dist = distProvider(nextCounts)
    const evStand = standEV(nextTotal, nextSoft, false, dist, rules)
    ev += (count / totalCards) * evStand
  }
  return ev
}

export const bestHitStandEV = (
  counts: number[],
  total: number,
  softAces: number,
  distProvider: (counts: number[]) => DealerDistribution,
  rules: BlackjackRules,
  memo: Map<string, number>,
): number => {
  const normalized = normalizeTotals(total, softAces)
  if (normalized.isBust) return -1

  const key = `${counts.join(',')}|${normalized.total}|${normalized.softAces}`
  const cached = memo.get(key)
  if (cached !== undefined) return cached

  const dist = distProvider(counts)
  const evStand = standEV(normalized.total, normalized.softAces, false, dist, rules)

  const totalCards = counts.reduce((sum, value) => sum + value, 0)
  let evHit = -1
  if (totalCards > 0) {
    evHit = 0
    for (let i = 0; i < counts.length; i += 1) {
      const count = counts[i]
      if (count === 0) continue
      const nextCounts = [...counts]
      nextCounts[i] -= 1
      const value = i === 0 ? 11 : i === 9 ? 10 : i + 1
      const nextTotal = normalized.total + value
      const nextSoft = normalized.softAces + (i === 0 ? 1 : 0)
      const child = bestHitStandEV(nextCounts, nextTotal, nextSoft, distProvider, rules, memo)
      evHit += (count / totalCards) * child
    }
  }

  const best = Math.max(evStand, evHit)
  memo.set(key, best)
  return best
}

export const hitEV = (
  counts: number[],
  total: number,
  softAces: number,
  distProvider: (counts: number[]) => DealerDistribution,
  rules: BlackjackRules,
): number => {
  const totalCards = counts.reduce((sum, value) => sum + value, 0)
  if (totalCards === 0) return -1

  const memo = new Map<string, number>()
  let ev = 0
  for (let i = 0; i < counts.length; i += 1) {
    const count = counts[i]
    if (count === 0) continue
    const nextCounts = [...counts]
    nextCounts[i] -= 1

    const value = i === 0 ? 11 : i === 9 ? 10 : i + 1
    const nextTotal = total + value
    const nextSoft = softAces + (i === 0 ? 1 : 0)
    const child = bestHitStandEV(nextCounts, nextTotal, nextSoft, distProvider, rules, memo)
    ev += (count / totalCards) * child
  }
  return ev
}
