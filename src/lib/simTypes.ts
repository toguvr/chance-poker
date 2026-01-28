import type { Card } from './cards'
import type { HandCategory } from './evaluator'

export type SimulationMode = 'random' | 'range'

export type SimulationInput = {
  hero: Card[]
  board: Card[]
  players: number
  iterations: number
  mode: SimulationMode
  rangeText?: string
  fastMode?: boolean
}

export type SimulationProgress = {
  completed: number
  total: number
  elapsedMs: number
  etaMs: number
}

export type SimulationResult = {
  win: number
  tie: number
  lose: number
  iterations: number
  equity: number
  confidence: number
  handHistogram: Partial<Record<HandCategory, number>>
}

export type SimulationHistoryItem = {
  id: string
  input: SimulationInput
  result: SimulationResult
  timestamp: number
}

export type WorkerMessage =
  | { type: 'start'; payload: SimulationInput }
  | { type: 'cancel' }

export type WorkerProgressMessage =
  | { type: 'progress'; payload: SimulationProgress }
  | { type: 'result'; payload: SimulationResult }
  | { type: 'error'; payload: string }
