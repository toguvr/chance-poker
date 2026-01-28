/// <reference lib="webworker" />
import { calculateBlackjack } from '../lib/blackjack/calc'
import type { WorkerMessage, WorkerResponse } from '../lib/blackjack/types'

let cancelled = false

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data
  if (message.type === 'cancel') {
    cancelled = true
    return
  }

  if (message.type === 'start') {
    cancelled = false
    try {
      const result = calculateBlackjack(message.payload)
      if (!cancelled) {
        ;(self as DedicatedWorkerGlobalScope).postMessage({ type: 'result', payload: result } satisfies WorkerResponse)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro inesperado'
      ;(self as DedicatedWorkerGlobalScope).postMessage({ type: 'error', payload: msg } satisfies WorkerResponse)
    }
  }
}
