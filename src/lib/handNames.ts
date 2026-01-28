import type { HandCategory } from './evaluator'

export const HAND_LABELS: Record<HandCategory, string> = {
  'high-card': 'Carta alta',
  pair: 'Par',
  'two-pair': 'Dois pares',
  'three-kind': 'Trinca',
  straight: 'Sequencia',
  flush: 'Flush',
  'full-house': 'Full house',
  'four-kind': 'Quadra',
  'straight-flush': 'Straight flush',
}
