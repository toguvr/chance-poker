import { cardsToText } from '../lib/cards'
import type { SimulationHistoryItem } from '../lib/simTypes'

type Props = {
  history: SimulationHistoryItem[]
}

export const HistoryList = ({ history }: Props) => (
  <div className="history">
    <div className="history-title">Ultimas simulacoes</div>
    {history.length === 0 ? (
      <div className="history-empty">Nenhuma simulacao ainda.</div>
    ) : (
      history.map((item) => (
        <div key={item.id} className="history-item">
          <div className="history-row">
            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
            <span>{item.input.players} jogadores</span>
            <span>{item.input.iterations.toLocaleString()} iteracoes</span>
          </div>
          <div className="history-row muted">
            <span>Mao: {cardsToText(item.input.hero)}</span>
            <span>Mesa: {cardsToText(item.input.board) || '-'}</span>
          </div>
          <div className="history-row">
            <span>Win {((item.result.win / item.result.iterations) * 100).toFixed(1)}%</span>
            <span>Equidade {(item.result.equity * 100).toFixed(1)}%</span>
          </div>
        </div>
      ))
    )}
  </div>
)
