const labels = ['Sua mao', 'Mesa', 'Jogadores']

type Props = {
  step: number
  onStepChange?: (step: number) => void
}

export const WizardSteps = ({ step, onStepChange }: Props) => (
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
