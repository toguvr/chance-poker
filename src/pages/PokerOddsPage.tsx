import { useEffect, useMemo, useRef, useState } from 'react'
import type { Card } from '../lib/cards'
import { CardGrid } from '../components/CardGrid'
import { CardTile } from '../components/CardTile'
import { WizardSteps } from '../components/WizardSteps'
import { SimulationControls } from '../components/SimulationControls'
import { ProgressBar } from '../components/ProgressBar'
import { ResultsPanel } from '../components/ResultsPanel'
import { HistoryList } from '../components/HistoryList'
import type { SimulationHistoryItem, SimulationInput, SimulationProgress, SimulationResult, SimulationMode } from '../lib/simTypes'
import { exactEquity } from '../lib/exact'
import { playClick, playSuccess } from '../lib/sound'

const MAX_HISTORY = 5

export const PokerOddsPage = () => {
  const [step, setStep] = useState(0)
  const [hero, setHero] = useState<Card[]>([])
  const [board, setBoard] = useState<Card[]>([])
  const [players, setPlayers] = useState(2)
  const [mode, setMode] = useState<SimulationMode>('random')
  const [rangeText, setRangeText] = useState('')
  const [iterations, setIterations] = useState(10000)
  const [soundOn, setSoundOn] = useState(false)
  const [progress, setProgress] = useState<SimulationProgress | null>(null)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [history, setHistory] = useState<SimulationHistoryItem[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => () => workerRef.current?.terminate(), [])

  const selectedSet = useMemo(() => new Set<Card>([...hero, ...board]), [hero, board])

  const blockedSet = selectedSet

  const playSound = (fn: () => void) => {
    if (soundOn) fn()
  }

  const resetSimulation = () => {
    setResult(null)
    setProgress(null)
  }

  const onCardClick = (card: Card) => {
    if (selectedSet.has(card)) {
      setHero((prev) => prev.filter((c) => c !== card))
      setBoard((prev) => prev.filter((c) => c !== card))
      playSound(playClick)
      resetSimulation()
      return
    }

    if (step === 0 && hero.length < 2) {
      setHero((prev) => [...prev, card])
      playSound(playClick)
      resetSimulation()
      return
    }

    if (step === 1 && board.length < 5) {
      setBoard((prev) => [...prev, card])
      playSound(playClick)
      resetSimulation()
    }
  }

  const clearAll = () => {
    setHero([])
    setBoard([])
    resetSimulation()
  }

  const clearBoard = () => {
    setBoard([])
    resetSimulation()
  }

  const clearHand = () => {
    setHero([])
    resetSimulation()
  }

  const validate = () => {
    if (hero.length !== 2) return 'Selecione 2 cartas para sua mao.'
    if (board.length > 5) return 'A mesa nao pode ter mais de 5 cartas.'
    return null
  }

  const startWorker = (input: SimulationInput) => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/simWorker.ts', import.meta.url), { type: 'module' })
    }

    workerRef.current.onmessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === 'progress') {
        setProgress(message.payload)
      }
      if (message.type === 'result') {
        setResult(message.payload)
        setBusy(false)
        setProgress(null)
        setNotice(null)
        const historyItem: SimulationHistoryItem = {
          id: crypto.randomUUID(),
          input,
          result: message.payload,
          timestamp: Date.now(),
        }
        setHistory((prev) => [historyItem, ...prev].slice(0, MAX_HISTORY))
        playSound(playSuccess)
      }
      if (message.type === 'error') {
        setBusy(false)
        setProgress(null)
        setNotice(message.payload)
      }
    }

    workerRef.current.postMessage({ type: 'start', payload: input })
  }

  const runSimulation = () => {
    const error = validate()
    if (error) {
      setNotice(error)
      return
    }

    const input: SimulationInput = {
      hero,
      board,
      players,
      iterations,
      mode,
      rangeText: mode === 'range' ? rangeText : undefined,
    }

    setBusy(true)
    setNotice(null)
    setResult(null)
    setProgress({ completed: 0, total: iterations, elapsedMs: 0, etaMs: 0 })

    const exactPossible = board.length === 5 && mode === 'random' && players <= 3
    if (exactPossible) {
      try {
        const exact = exactEquity(hero, board, players)
        const total = exact.total
        const equity = total > 0 ? (exact.win + exact.tie / players) / total : 0
        const resultPayload: SimulationResult = {
          win: exact.win,
          tie: exact.tie,
          lose: exact.lose,
          iterations: total,
          equity,
          confidence: 0,
          handHistogram: {},
        }
        setResult(resultPayload)
        setBusy(false)
        setProgress(null)
        setNotice('Calculo exato (river completo) para ate 3 jogadores.')
        const historyItem: SimulationHistoryItem = {
          id: crypto.randomUUID(),
          input,
          result: resultPayload,
          timestamp: Date.now(),
        }
        setHistory((prev) => [historyItem, ...prev].slice(0, MAX_HISTORY))
        playSound(playSuccess)
      } catch (err) {
        setNotice(err instanceof Error ? err.message : 'Erro no calculo exato.')
        setBusy(false)
        setProgress(null)
      }
      return
    }

    if (board.length === 5 && mode === 'random' && players > 3) {
      setNotice('Calculo exato completo e muito pesado acima de 3 jogadores. Usando Monte Carlo.')
    }

    startWorker(input)
  }

  const cancelSimulation = () => {
    workerRef.current?.postMessage({ type: 'cancel' })
    setBusy(false)
    setProgress(null)
    setNotice('Simulacao cancelada.')
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Texas Hold'em Odds Lab</h1>
          <p>Simulador gamificado de equity para maos de poker.</p>
        </div>
        <div className="header-actions">
          <button className="ghost" type="button" onClick={clearAll}>
            Limpar tudo
          </button>
        </div>
      </header>

      <WizardSteps step={step} onStepChange={setStep} />

      <section className="table-zone">
        <div className="table-row">
          <div className="panel">
            <h2>Minha mao</h2>
            <div className="card-row">
              {[0, 1].map((index) => (
                <CardTile key={index} card={hero[index]} ghost={!hero[index]} />
              ))}
            </div>
            <button className="mini" type="button" onClick={clearHand}>
              Limpar mao
            </button>
          </div>
          <div className="panel">
            <h2>Mesa</h2>
            <div className="card-row">
              {Array.from({ length: 5 }).map((_, index) => (
                <CardTile key={index} card={board[index]} ghost={!board[index]} />
              ))}
            </div>
            <button className="mini" type="button" onClick={clearBoard}>
              Limpar mesa
            </button>
          </div>
          <div className="panel">
            <h2>Configuracao</h2>
            <SimulationControls
              players={players}
              onPlayersChange={setPlayers}
              mode={mode}
              onModeChange={setMode}
              rangeText={rangeText}
              onRangeTextChange={setRangeText}
              iterations={iterations}
              onIterationsChange={setIterations}
              soundOn={soundOn}
              onSoundToggle={() => setSoundOn((prev) => !prev)}
            />
          </div>
        </div>
      </section>

      <section className="grid-zone">
        <div className="panel">
          <h2>Selecione as cartas</h2>
          <p className="muted">Cartas ja usadas ficam bloqueadas. Clique para remover.</p>
          <CardGrid selected={selectedSet} blocked={blockedSet} onCardClick={onCardClick} />
        </div>
      </section>

      <section className="actions-zone">
        <div className="panel">
          <div className="actions">
            <button className="primary" type="button" disabled={busy} onClick={runSimulation}>
              {busy ? 'Simulando...' : 'Calcular odds'}
            </button>
            {busy && (
              <button className="ghost" type="button" onClick={cancelSimulation}>
                Cancelar
              </button>
            )}
            {notice && <span className="notice">{notice}</span>}
          </div>
          {progress && <ProgressBar progress={progress} />}
        </div>
      </section>

      <section className="results-zone">
        <div className="panel">
          <h2>Resultados</h2>
          <ResultsPanel result={result} players={players} />
        </div>
        <div className="panel">
          <HistoryList history={history} />
        </div>
      </section>
    </div>
  )
}
