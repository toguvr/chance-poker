import type { SimulationProgress } from '../lib/poker/simTypes'

const formatMs = (ms: number) => {
  const secs = Math.max(0, Math.round(ms / 1000))
  if (secs < 60) return `${secs}s`
  const mins = Math.floor(secs / 60)
  const rem = secs % 60
  return `${mins}m ${rem}s`
}

type Props = {
  progress: SimulationProgress
}

export const ProgressBar = ({ progress }: Props) => {
  const percent = progress.total > 0 ? Math.min(100, (progress.completed / progress.total) * 100) : 0
  return (
    <div className="progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-meta">
        <span>{progress.completed.toLocaleString()} / {progress.total.toLocaleString()}</span>
        <span>ETA {formatMs(progress.etaMs)}</span>
      </div>
    </div>
  )
}
