import { useEffect, useMemo, useRef, useState } from 'react'
import type { Card } from '../lib/cards'
import { ALL_CARDS } from '../lib/cards'
import { CardGrid } from '../components/CardGrid'
import { CardTile } from '../components/CardTile'
import { WizardSteps } from '../components/WizardSteps'
import { BlackjackControls } from '../components/BlackjackControls'
import { BlackjackResultsPanel } from '../components/BlackjackResultsPanel'
import { handTotals } from '../lib/blackjack/hand'
import type { BlackjackInput, BlackjackResult, BlackjackRules } from '../lib/blackjack/types'

const defaultRules: BlackjackRules = {
  dealerHitsSoft17: false,
  blackjackPayout: '3:2',
  allowDouble: true,
  allowSplit: true,
  allowSurrender: false,
}

const labels = ['Player', 'Dealer', 'Descartes']

const buildEmptyCounts = () => {
  const map = {} as Record<Card, number>
  for (const card of ALL_CARDS) map[card] = 0
  return map
}

const buildMaxCopies = (decks: number) => {
  const map = {} as Record<Card, number>
  for (const card of ALL_CARDS) map[card] = decks
  return map
}

const countCards = (cards: Card[]) => {
  const map = buildEmptyCounts()
  for (const card of cards) map[card] += 1
  return map
}

const mergeCounts = (...maps: Record<Card, number>[]) => {
  const merged = buildEmptyCounts()
  for (const map of maps) {
    for (const card of ALL_CARDS) merged[card] += map[card]
  }
  return merged
}

export const BlackjackOddsPage = () => {
  const [step, setStep] = useState(0)
  const [decks, setDecks] = useState(6)
  const [playerCards, setPlayerCards] = useState<Card[]>([])
  const [dealerUpcard, setDealerUpcard] = useState<Card | null>(null)
  const [dealerHoleCard, setDealerHoleCard] = useState<Card | null>(null)
  const [holeKnown, setHoleKnown] = useState(false)
  const [discards, setDiscards] = useState<Card[]>([])
  const [rules, setRules] = useState<BlackjackRules>(defaultRules)
  const [result, setResult] = useState<BlackjackResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => () => workerRef.current?.terminate(), [])

  const playerCount = useMemo(() => countCards(playerCards), [playerCards])
  const dealerCount = useMemo(
    () => countCards([...(dealerUpcard ? [dealerUpcard] : []), ...(dealerHoleCard ? [dealerHoleCard] : [])]),
    [dealerUpcard, dealerHoleCard],
  )
  const discardCount = useMemo(() => countCards(discards), [discards])
  const selectedCounts = useMemo(() => mergeCounts(playerCount, dealerCount, discardCount), [playerCount, dealerCount, discardCount])
  const maxCopies = useMemo(() => buildMaxCopies(decks), [decks])

  const totals = handTotals(playerCards)

  const resetResult = () => {
    setResult(null)
    setNotice(null)
  }

  const canAddCard = (card: Card) => selectedCounts[card] < maxCopies[card]

  const handleCardAdd = (card: Card) => {
    if (!canAddCard(card)) return

    if (step === 0) {
      setPlayerCards((prev) => [...prev, card])
    } else if (step === 1) {
      if (!dealerUpcard) {
        setDealerUpcard(card)
      } else if (holeKnown && !dealerHoleCard) {
        setDealerHoleCard(card)
      } else {
        setDiscards((prev) => [...prev, card])
      }
    } else {
      setDiscards((prev) => [...prev, card])
    }
    resetResult()
  }

  const handleCardRemove = (card: Card) => {
    if (step === 0) {
      setPlayerCards((prev) => {
        const index = prev.lastIndexOf(card)
        if (index === -1) return prev
        const next = [...prev]
        next.splice(index, 1)
        return next
      })
    } else if (step === 1) {
      if (dealerHoleCard === card) {
        setDealerHoleCard(null)
      } else if (dealerUpcard === card) {
        setDealerUpcard(null)
      } else {
        setDiscards((prev) => {
          const index = prev.lastIndexOf(card)
          if (index === -1) return prev
          const next = [...prev]
          next.splice(index, 1)
          return next
        })
      }
    } else {
      setDiscards((prev) => {
        const index = prev.lastIndexOf(card)
        if (index === -1) return prev
        const next = [...prev]
        next.splice(index, 1)
        return next
      })
    }
    resetResult()
  }

  const clearAll = () => {
    setPlayerCards([])
    setDealerUpcard(null)
    setDealerHoleCard(null)
    setDiscards([])
    resetResult()
  }

  const clearPlayer = () => {
    setPlayerCards([])
    resetResult()
  }

  const clearDealer = () => {
    setDealerUpcard(null)
    setDealerHoleCard(null)
    resetResult()
  }

  const clearDiscards = () => {
    setDiscards([])
    resetResult()
  }

  const onDecksChange = (value: number) => {
    setDecks(value)
    clearAll()
  }

  const runCalculation = () => {
    if (!dealerUpcard) {
      setNotice('Selecione a upcard do dealer.')
      return
    }
    if (playerCards.length < 2) {
      setNotice('Selecione ao menos 2 cartas para o player.')
      return
    }

    const input: BlackjackInput = {
      decks,
      playerCards,
      dealerUpcard,
      dealerHoleCard: holeKnown ? dealerHoleCard : null,
      discards,
      rules,
    }

    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/blackjackWorker.ts', import.meta.url), { type: 'module' })
    }

    setBusy(true)
    setNotice(null)
    workerRef.current.onmessage = (event: MessageEvent) => {
      const message = event.data
      if (message.type === 'result') {
        setResult(message.payload)
        setBusy(false)
      }
      if (message.type === 'error') {
        setNotice(message.payload)
        setBusy(false)
      }
    }

    workerRef.current.postMessage({ type: 'start', payload: input })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Blackjack Decision Lab</h1>
          <p>Analise de EV baseada no shoe real e regras configuradas.</p>
        </div>
        <div className="header-actions">
          <button className="ghost" type="button" onClick={clearAll}>
            Limpar tudo
          </button>
        </div>
      </header>

      <WizardSteps step={step} onStepChange={setStep} labels={labels} />

      <section className="table-zone">
        <div className="table-row">
          <div className="panel">
            <h2>Player</h2>
            <div className="card-row">
              {playerCards.length === 0 ? <CardTile ghost /> : playerCards.map((card, idx) => (
                <CardTile key={`${card}-${idx}`} card={card} onClick={() => handleCardRemove(card)} />
              ))}
            </div>
            <button className="mini" type="button" onClick={clearPlayer}>
              Limpar mao
            </button>
            <div className="totals">
              <span>
                Total: {totals.best}
                {totals.isSoft ? ` (soft) / ${totals.hard} (hard)` : ''}
              </span>
            </div>
          </div>

          <div className="panel">
            <h2>Dealer</h2>
            <div className="card-row">
              <CardTile card={dealerUpcard ?? undefined} ghost={!dealerUpcard} onClick={() => dealerUpcard && handleCardRemove(dealerUpcard)} />
              <CardTile
                card={holeKnown ? dealerHoleCard ?? undefined : undefined}
                ghost={!holeKnown || !dealerHoleCard}
                onClick={() => dealerHoleCard && handleCardRemove(dealerHoleCard)}
              />
            </div>
            <div className="toggle-group">
              <button
                type="button"
                className={holeKnown ? 'active' : ''}
                onClick={() => {
                  setHoleKnown((prev) => !prev)
                  if (holeKnown) setDealerHoleCard(null)
                  resetResult()
                }}
              >
                Hole conhecida
              </button>
            </div>
            <button className="mini" type="button" onClick={clearDealer}>
              Limpar dealer
            </button>
          </div>

          <div className="panel">
            <h2>Configuracao</h2>
            <BlackjackControls decks={decks} onDecksChange={onDecksChange} rules={rules} onRulesChange={setRules} />
          </div>
        </div>
      </section>

      <section className="grid-zone">
        <div className="panel">
          <h2>Selecione as cartas</h2>
          <p className="muted">Clique para adicionar. Botao direito remove da secao atual.</p>
          <CardGrid
            mode="multi"
            counts={selectedCounts}
            maxCopies={maxCopies}
            onCardClick={handleCardAdd}
            onCardRightClick={handleCardRemove}
          />
        </div>
      </section>

      <section className="actions-zone">
        <div className="panel">
          <div className="actions">
            <button className="primary" type="button" disabled={busy} onClick={runCalculation}>
              {busy ? 'Calculando...' : 'Calcular decisao'}
            </button>
            {notice && <span className="notice">{notice}</span>}
          </div>
        </div>
      </section>

      <section className="results-zone">
        <div className="panel">
          <h2>Resultados</h2>
          <BlackjackResultsPanel result={result} />
        </div>
        <div className="panel">
          <h2>Descartes</h2>
          <div className="card-row">
            {discards.length === 0 ? <CardTile ghost /> : discards.map((card, idx) => (
              <CardTile key={`${card}-${idx}`} card={card} onClick={() => handleCardRemove(card)} />
            ))}
          </div>
          <button className="mini" type="button" onClick={clearDiscards}>
            Limpar descartes
          </button>
        </div>
      </section>
    </div>
  )
}
