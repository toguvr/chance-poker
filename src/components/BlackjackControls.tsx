import type { BlackjackRules } from '../lib/blackjack/types'

const deckOptions = [1, 2, 4, 6, 8]

type Props = {
  decks: number
  onDecksChange: (value: number) => void
  rules: BlackjackRules
  onRulesChange: (rules: BlackjackRules) => void
}

export const BlackjackControls = ({ decks, onDecksChange, rules, onRulesChange }: Props) => {
  const updateRule = (key: keyof BlackjackRules, value: BlackjackRules[keyof BlackjackRules]) => {
    onRulesChange({ ...rules, [key]: value })
  }

  return (
    <div className="controls">
      <div className="control">
        <label>Baralhos no shoe</label>
        <div className="toggle-group">
          {deckOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={decks === option ? 'active' : ''}
              onClick={() => onDecksChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="control">
        <label>Regras do dealer</label>
        <div className="toggle-group">
          <button
            type="button"
            className={rules.dealerHitsSoft17 ? 'active' : ''}
            onClick={() => updateRule('dealerHitsSoft17', true)}
          >
            H17
          </button>
          <button
            type="button"
            className={!rules.dealerHitsSoft17 ? 'active' : ''}
            onClick={() => updateRule('dealerHitsSoft17', false)}
          >
            S17
          </button>
        </div>
      </div>

      <div className="control">
        <label>Pagamento Blackjack</label>
        <div className="toggle-group">
          <button
            type="button"
            className={rules.blackjackPayout === '3:2' ? 'active' : ''}
            onClick={() => updateRule('blackjackPayout', '3:2')}
          >
            3:2
          </button>
          <button
            type="button"
            className={rules.blackjackPayout === '6:5' ? 'active' : ''}
            onClick={() => updateRule('blackjackPayout', '6:5')}
          >
            6:5
          </button>
        </div>
      </div>

      <div className="control">
        <label>Acoes permitidas</label>
        <div className="toggle-group">
          <button
            type="button"
            className={rules.allowDouble ? 'active' : ''}
            onClick={() => updateRule('allowDouble', !rules.allowDouble)}
          >
            Double
          </button>
          <button
            type="button"
            className={rules.allowSplit ? 'active' : ''}
            onClick={() => updateRule('allowSplit', !rules.allowSplit)}
          >
            Split
          </button>
          <button
            type="button"
            className={rules.allowSurrender ? 'active' : ''}
            onClick={() => updateRule('allowSurrender', !rules.allowSurrender)}
          >
            Surrender
          </button>
        </div>
      </div>
    </div>
  )
}
