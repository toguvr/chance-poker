/// <reference lib="webworker" />
import { runMonteCarlo } from '../lib/poker/monteCarlo'
import type { SimulationInput, WorkerMessage, WorkerProgressMessage } from '../lib/poker/simTypes'

let cancelled = false

const simulate = (input: SimulationInput): WorkerProgressMessage => {
  const result = runMonteCarlo(input, {
    onProgress: (progress) => {
      ;(self as DedicatedWorkerGlobalScope).postMessage({ type: 'progress', payload: progress })
    },
    shouldCancel: () => cancelled,
  })

  return { type: 'result', payload: result }
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data
  if (msg.type === 'cancel') {
    cancelled = true
    return
  }

  if (msg.type === 'start') {
    cancelled = false
    try {
      const result = simulate(msg.payload)
      if (!cancelled) (self as DedicatedWorkerGlobalScope).postMessage(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado'
      ;(self as DedicatedWorkerGlobalScope).postMessage({ type: 'error', payload: message })
    }
  }
}
