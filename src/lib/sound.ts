export const playClick = () => {
  const context = new AudioContext()
  const osc = context.createOscillator()
  const gain = context.createGain()

  osc.type = 'triangle'
  osc.frequency.value = 520
  gain.gain.value = 0.06

  osc.connect(gain)
  gain.connect(context.destination)
  osc.start()
  osc.stop(context.currentTime + 0.08)

  osc.onended = () => {
    context.close()
  }
}

export const playSuccess = () => {
  const context = new AudioContext()
  const osc = context.createOscillator()
  const gain = context.createGain()

  osc.type = 'sine'
  osc.frequency.value = 680
  gain.gain.value = 0.08

  osc.connect(gain)
  gain.connect(context.destination)
  osc.start()
  osc.frequency.exponentialRampToValueAtTime(980, context.currentTime + 0.15)
  osc.stop(context.currentTime + 0.2)

  osc.onended = () => {
    context.close()
  }
}
