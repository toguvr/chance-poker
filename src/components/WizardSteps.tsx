type Props = {
  step: number
  onStepChange?: (step: number) => void
  labels?: string[]
}

const defaultLabels = ['Sua mao', 'Mesa', 'Jogadores']

export const WizardSteps = ({ step, onStepChange, labels = defaultLabels }: Props) => (
  <div className="wizard">
    {labels.map((label, index) => (
      <button
        key={label}
        className={`wizard-step ${index === step ? 'active' : ''}`}
        onClick={() => onStepChange?.(index)}
        type="button"
      >
        <span className="step-index">{index + 1}</span>
        <span className="step-label">{label}</span>
      </button>
    ))}
  </div>
)
