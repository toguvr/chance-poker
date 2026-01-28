import type { BlackjackResult } from '../lib/blackjack/types'

type Props = {
  result: BlackjackResult | null
}

const percent = (value: number) => `${(value * 100).toFixed(1)}%`

export const BlackjackResultsPanel = ({ result }: Props) => {
  if (!result) return <div className="results-empty">Faca o calculo para ver os resultados.</div>

  const dist = result.dealerDistribution
  const entries = [17, 18, 19, 20, 21].map((total) => ({ total, prob: dist[total as 17 | 18 | 19 | 20 | 21] }))

  return (
    <div className="results-panel">
      <div className="results-row">
        <div className="stat">
          <span className="stat-label">Dealer estoura</span>
          <span className="stat-value win">{percent(result.dealerBustProb)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Player estoura (1 hit)</span>
          <span className="stat-value lose">{percent(result.playerHitBustProb)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Cartas restantes</span>
          <span className="stat-value">{result.remainingCards}</span>
        </div>
      </div>

      <div className="results-row">
        <div className="stat">
          <span className="stat-label">Distribuicao dealer</span>
          <div className="stat-tags">
            {entries.map((entry) => (
              <span key={entry.total} className="tag">
                {entry.total}: {percent(entry.prob)}
              </span>
            ))}
            <span className="tag">BJ: {percent(dist.bj)}</span>
          </div>
        </div>
      </div>

      <div className="results-row">
        <div className="stat highlight">
          <span className="stat-label">Recomendacao</span>
          <span className="stat-value">{result.bestAction.toUpperCase()}</span>
        </div>
        <div className="stat">
          <span className="stat-label">EV por acao</span>
          <div className="stat-tags">
            {Object.entries(result.actionEVs).map(([action, value]) => (
              <span className="tag" key={action}>
                {action.toUpperCase()}: {value!.toFixed(3)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
