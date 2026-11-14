/** Lightweight procedural SFX via Web Audio API — no external mp3 files. */

let ctx: AudioContext | null = null
let muted = true

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
  }
  return ctx
}

export function setMuted(value: boolean): void {
  muted = value
}

export function isMuted(): boolean {
  return muted
}

export async function unlockAudio(): Promise<void> {
  const audio = getCtx()
  if (!audio) return
  if (audio.state === 'suspended') await audio.resume()
}

function beep(freq: number, duration: number, type: OscillatorType = 'square', gain = 0.04): void {
  if (muted) return
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration)
}

export const soundEngine = {
  telemetry: () => beep(880, 0.06, 'sine', 0.03),
  step: () => beep(220, 0.08, 'triangle', 0.04),
  harvest: () => {
    beep(523, 0.07, 'sine', 0.04)
    setTimeout(() => beep(659, 0.08, 'sine', 0.04), 60)
  },
  storm: () => {
    beep(110, 0.35, 'sawtooth', 0.05)
    setTimeout(() => beep(90, 0.4, 'sawtooth', 0.045), 80)
  },
  success: () => {
    beep(392, 0.1, 'square', 0.04)
    setTimeout(() => beep(523, 0.12, 'square', 0.04), 90)
    setTimeout(() => beep(659, 0.16, 'square', 0.04), 180)
  },
  fail: () => beep(150, 0.35, 'sawtooth', 0.05),
  click: () => beep(640, 0.04, 'square', 0.025),
  /** Rising engine rumble for final countdown seconds (3,2,1,0). */
  ignition: (count: number) => {
    if (muted) return
    const audio = getCtx()
    if (!audio) return
    const osc = audio.createOscillator()
    const g = audio.createGain()
    const intensity = Math.max(0, 3 - count) / 3
    osc.type = 'sawtooth'
    osc.frequency.value = 55 + intensity * 40
    g.gain.value = 0.02 + intensity * 0.05
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.55)
    osc.connect(g)
    g.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + 0.55)
  },
}
