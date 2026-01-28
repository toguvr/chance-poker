import { useState } from 'react'
import { PokerOddsPage } from './pages/PokerOddsPage'
import { BlackjackOddsPage } from './pages/BlackjackOddsPage'

export default function App() {
  const [game, setGame] = useState<'poker' | 'blackjack'>('poker')

  return (
    <div className="app-root">
      <div className="game-selector">
        <label htmlFor="game-select">Jogo</label>
        <select id="game-select" value={game} onChange={(event) => setGame(event.target.value as 'poker' | 'blackjack')}>
          <option value="poker">Poker (Texas Hold'em)</option>
          <option value="blackjack">Blackjack</option>
        </select>
      </div>
      {game === 'poker' ? <PokerOddsPage /> : <BlackjackOddsPage />}
    </div>
  )
}
