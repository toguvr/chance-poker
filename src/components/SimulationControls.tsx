import type { SimulationMode } from '../lib/poker/simTypes'

type Props = {
  players: number
  onPlayersChange: (value: number) => void
  mode: SimulationMode
  onModeChange: (mode: SimulationMode) => void
  rangeText: string
  onRangeTextChange: (value: string) => void
  iterations: number
  onIterationsChange: (value: number) => void
  soundOn: boolean
  onSoundToggle: () => void
}

const iterationOptions = [10000, 50000, 100000]

export const SimulationControls = ({
  players,
  onPlayersChange,
  mode,
  onModeChange,
  rangeText,
  onRangeTextChange,
  iterations,
  onIterationsChange,
  soundOn,
  onSoundToggle,
}: Props) => (
  <div className="controls">
    <div className="control">
      <label>Jogadores</label>
      <input
        type="range"
        min={2}
        max={9}
        value={players}
        onChange={(event) => onPlayersChange(Number(event.target.value))}
      />
      <span className="control-value">{players}</span>
    </div>

    <div className="control">
      <label>Adversarios</label>
      <div className="toggle-group">
        <button
          type="button"
          className={mode === 'random' ? 'active' : ''}
          onClick={() => onModeChange('random')}
        >
          Aleatorio
        </button>
        <button
          type="button"
          className={mode === 'range' ? 'active' : ''}
          onClick={() => onModeChange('range')}
        >
          Range
        </button>
      </div>
      {mode === 'range' && (
        <input
          type="text"
          placeholder="Ex: QQ, AKs, AJo"
          value={rangeText}
          onChange={(event) => onRangeTextChange(event.target.value)}
        />
      )}
    </div>

    <div className="control">
      <label>Iteracoes Monte Carlo</label>
      <div className="toggle-group">
        {iterationOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={iterations === option ? 'active' : ''}
            onClick={() => onIterationsChange(option)}
          >
            {option >= 1000 ? `${option / 1000}k` : option}
          </button>
        ))}
      </div>
    </div>

    <div className="control inline">
      <label>Som</label>
      <button type="button" className={soundOn ? 'active' : ''} onClick={onSoundToggle}>
        {soundOn ? 'Ligado' : 'Desligado'}
      </button>
    </div>
  </div>
)
