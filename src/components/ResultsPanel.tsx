import type { SimulationResult } from '../lib/simTypes'
import { HAND_LABELS } from '../lib/handNames'

type Props = {
  result: SimulationResult | null
  players: number
}

const percent = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0)

export const ResultsPanel = ({ result, players }: Props) => {
  if (!result) return <div className="results-empty">Faca a simulacao para ver os resultados.</div>

  const total = result.iterations
  const winPct = percent(result.win, total)
  const tiePct = percent(result.tie, total)
  const losePct = percent(result.lose, total)
  const equityPct = result.equity * 100
  const confidence = result.confidence * 100

  const hands = Object.entries(result.handHistogram)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="results-panel">
      <div className="results-row">
        <div className="stat">
          <span className="stat-label">Win</span>
          <span className="stat-value win">{winPct.toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Tie</span>
          <span className="stat-value tie">{tiePct.toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Lose</span>
          <span className="stat-value lose">{losePct.toFixed(1)}%</span>
        </div>
      </div>
      <div className="results-row">
        <div className="stat highlight">
          <span className="stat-label">Equidade total</span>
          <span className="stat-value">{equityPct.toFixed(1)}%</span>
          <span className="stat-sub">Win + Tie/{players}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Confianca (+/-)</span>
          <span className="stat-value">{confidence.toFixed(2)}%</span>
        </div>
      </div>
      <div className="results-row">
        <div className="stat">
          <span className="stat-label">Maos fortes observadas</span>
          <div className="stat-tags">
            {hands.length === 0 ? (
              <span className="tag">Sem dados</span>
            ) : (
              hands.map(([name, count]) => (
                <span className="tag" key={name}>
                  {HAND_LABELS[name as keyof typeof HAND_LABELS]} ({((count / total) * 100).toFixed(1)}%)
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
