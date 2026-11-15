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
  /** Soft Matrix keystroke for mission brief typing. */
  typeTick: () => beep(980 + Math.random() * 220, 0.022, 'square', 0.018),
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
    g.gain.value = 0.06 + intensity * 0.1
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.55)
    osc.connect(g)
    g.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + 0.55)
  },
  /** Dedicated launch-pad countdown beep; intensifies as n approaches 0. */
  countdownTick: (n: number) => {
    const urgency = Math.max(0, Math.min(1, (10 - n) / 10))
    const freq = 700 + urgency * 340
    const dur = n === 0 ? 0.32 : 0.1 + urgency * 0.05
    const gain = 0.1 + urgency * 0.1
    beep(freq, dur, 'square', gain)
    beep(freq * 1.5, dur * 0.6, 'sine', gain * 0.55)
    beep(freq * 0.5, dur * 0.4, 'triangle', gain * 0.35)
    if (n <= 3) {
      soundEngine.ignition(n)
    }
    if (n === 0) {
      beep(90, 0.5, 'sawtooth', 0.14)
      setTimeout(() => beep(55, 0.4, 'sawtooth', 0.12), 90)
    }
  },
  /** Punchy “GO!!!” start / liftoff sting. */
  goStart: () => {
    if (muted) return
    const audio = getCtx()
    if (!audio) return

    // Rising whoosh
    const osc = audio.createOscillator()
    const g = audio.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, audio.currentTime)
    osc.frequency.exponentialRampToValueAtTime(520, audio.currentTime + 0.28)
    g.gain.setValueAtTime(0.16, audio.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35)
    osc.connect(g)
    g.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + 0.35)

    // Bright start chord
    beep(523, 0.18, 'square', 0.14)
    setTimeout(() => beep(659, 0.2, 'square', 0.15), 70)
    setTimeout(() => beep(784, 0.28, 'square', 0.16), 140)
    setTimeout(() => beep(1046, 0.35, 'sine', 0.12), 200)
  },
  /** Soft power-up whoosh + HUD chime when entering the cockpit. */
  cockpitEnter: () => {
    if (muted) return
    const audio = getCtx()
    if (!audio) return

    const whoosh = audio.createOscillator()
    const g = audio.createGain()
    whoosh.type = 'sine'
    whoosh.frequency.setValueAtTime(180, audio.currentTime)
    whoosh.frequency.exponentialRampToValueAtTime(720, audio.currentTime + 0.55)
    g.gain.setValueAtTime(0.001, audio.currentTime)
    g.gain.exponentialRampToValueAtTime(0.12, audio.currentTime + 0.08)
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.7)
    whoosh.connect(g)
    g.connect(audio.destination)
    whoosh.start()
    whoosh.stop(audio.currentTime + 0.7)

    const rumble = audio.createOscillator()
    const rg = audio.createGain()
    rumble.type = 'triangle'
    rumble.frequency.value = 70
    rg.gain.setValueAtTime(0.08, audio.currentTime)
    rg.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.5)
    rumble.connect(rg)
    rg.connect(audio.destination)
    rumble.start()
    rumble.stop(audio.currentTime + 0.5)

    setTimeout(() => beep(660, 0.08, 'sine', 0.07), 180)
    setTimeout(() => beep(880, 0.1, 'sine', 0.08), 280)
    setTimeout(() => beep(1175, 0.16, 'sine', 0.09), 400)
  },
  /** CRT / pixel-dialog power-on. */
  dialogOpen: () => {
    if (muted) return
    const audio = getCtx()
    if (!audio) return

    const whoosh = audio.createOscillator()
    const g = audio.createGain()
    whoosh.type = 'sawtooth'
    whoosh.frequency.setValueAtTime(90, audio.currentTime)
    whoosh.frequency.exponentialRampToValueAtTime(480, audio.currentTime + 0.18)
    g.gain.setValueAtTime(0.001, audio.currentTime)
    g.gain.exponentialRampToValueAtTime(0.1, audio.currentTime + 0.04)
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.22)
    whoosh.connect(g)
    g.connect(audio.destination)
    whoosh.start()
    whoosh.stop(audio.currentTime + 0.22)

    beep(880, 0.06, 'square', 0.06)
    setTimeout(() => beep(1320, 0.08, 'sine', 0.05), 50)
  },
  /** Animated fanfare when a mission gate opens / mission starts. */
  missionOpen: () => {
    if (muted) return
    const audio = getCtx()
    if (!audio) return
    const t0 = audio.currentTime

    // Long launch whoosh (~1.4s)
    const whoosh = audio.createOscillator()
    const wg = audio.createGain()
    whoosh.type = 'sawtooth'
    whoosh.frequency.setValueAtTime(55, t0)
    whoosh.frequency.exponentialRampToValueAtTime(180, t0 + 0.55)
    whoosh.frequency.exponentialRampToValueAtTime(720, t0 + 1.25)
    wg.gain.setValueAtTime(0.001, t0)
    wg.gain.exponentialRampToValueAtTime(0.16, t0 + 0.1)
    wg.gain.setValueAtTime(0.12, t0 + 0.7)
    wg.gain.exponentialRampToValueAtTime(0.001, t0 + 1.45)
    whoosh.connect(wg)
    wg.connect(audio.destination)
    whoosh.start(t0)
    whoosh.stop(t0 + 1.5)

    // Deep rumble under the whole open (~1.6s)
    const rumble = audio.createOscillator()
    const rg = audio.createGain()
    rumble.type = 'triangle'
    rumble.frequency.setValueAtTime(48, t0)
    rumble.frequency.exponentialRampToValueAtTime(95, t0 + 0.9)
    rumble.frequency.exponentialRampToValueAtTime(130, t0 + 1.5)
    rg.gain.setValueAtTime(0.001, t0)
    rg.gain.exponentialRampToValueAtTime(0.12, t0 + 0.08)
    rg.gain.setValueAtTime(0.09, t0 + 0.9)
    rg.gain.exponentialRampToValueAtTime(0.001, t0 + 1.65)
    rumble.connect(rg)
    rg.connect(audio.destination)
    rumble.start(t0)
    rumble.stop(t0 + 1.7)

    // Sustained pad layer
    const pad = audio.createOscillator()
    const pg = audio.createGain()
    pad.type = 'sine'
    pad.frequency.setValueAtTime(196, t0 + 0.2)
    pad.frequency.exponentialRampToValueAtTime(392, t0 + 1.4)
    pg.gain.setValueAtTime(0.001, t0 + 0.2)
    pg.gain.exponentialRampToValueAtTime(0.06, t0 + 0.45)
    pg.gain.exponentialRampToValueAtTime(0.001, t0 + 1.8)
    pad.connect(pg)
    pg.connect(audio.destination)
    pad.start(t0 + 0.2)
    pad.stop(t0 + 1.85)

    // Longer rising mission sting (~2s)
    setTimeout(() => beep(262, 0.14, 'square', 0.06), 120)
    setTimeout(() => beep(330, 0.14, 'square', 0.07), 280)
    setTimeout(() => beep(392, 0.15, 'square', 0.08), 440)
    setTimeout(() => beep(523, 0.16, 'square', 0.09), 620)
    setTimeout(() => beep(659, 0.18, 'square', 0.1), 820)
    setTimeout(() => beep(784, 0.2, 'square', 0.11), 1040)
    setTimeout(() => beep(1046, 0.35, 'sine', 0.1), 1280)
    setTimeout(() => beep(1319, 0.4, 'sine', 0.08), 1520)
    setTimeout(() => beep(1568, 0.45, 'sine', 0.06), 1750)
  },
  /** Long celebratory fanfare when a mission is completed. */
  missionComplete: () => {
    if (muted) return
    const audio = getCtx()
    if (!audio) return
    const t0 = audio.currentTime

    // Bright shimmer sweep
    const shimmer = audio.createOscillator()
    const sg = audio.createGain()
    shimmer.type = 'sawtooth'
    shimmer.frequency.setValueAtTime(220, t0)
    shimmer.frequency.exponentialRampToValueAtTime(1320, t0 + 0.55)
    sg.gain.setValueAtTime(0.001, t0)
    sg.gain.exponentialRampToValueAtTime(0.1, t0 + 0.08)
    sg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.7)
    shimmer.connect(sg)
    sg.connect(audio.destination)
    shimmer.start(t0)
    shimmer.stop(t0 + 0.75)

    // Warm victory pad
    const pad = audio.createOscillator()
    const pg = audio.createGain()
    pad.type = 'triangle'
    pad.frequency.setValueAtTime(262, t0 + 0.15)
    pad.frequency.setValueAtTime(330, t0 + 0.9)
    pad.frequency.setValueAtTime(392, t0 + 1.5)
    pg.gain.setValueAtTime(0.001, t0 + 0.15)
    pg.gain.exponentialRampToValueAtTime(0.07, t0 + 0.35)
    pg.gain.setValueAtTime(0.05, t0 + 1.4)
    pg.gain.exponentialRampToValueAtTime(0.001, t0 + 2.2)
    pad.connect(pg)
    pg.connect(audio.destination)
    pad.start(t0 + 0.15)
    pad.stop(t0 + 2.25)

    // Confetti-like sparkle blips
    const sparkles = [880, 1175, 1480, 1760, 2093, 1568, 2349]
    sparkles.forEach((freq, i) => {
      setTimeout(() => beep(freq, 0.08 + (i % 3) * 0.02, 'sine', 0.045), 60 + i * 90)
    })

    // Ascending victory arpeggio
    setTimeout(() => beep(392, 0.14, 'square', 0.08), 100)
    setTimeout(() => beep(494, 0.14, 'square', 0.085), 220)
    setTimeout(() => beep(587, 0.15, 'square', 0.09), 360)
    setTimeout(() => beep(784, 0.18, 'square', 0.1), 520)
    setTimeout(() => beep(988, 0.22, 'square', 0.11), 700)
    setTimeout(() => beep(1175, 0.35, 'sine', 0.1), 920)
    // Final resolving chord tones
    setTimeout(() => beep(523, 0.55, 'triangle', 0.07), 1100)
    setTimeout(() => beep(659, 0.55, 'sine', 0.08), 1120)
    setTimeout(() => beep(784, 0.7, 'sine', 0.09), 1140)
    setTimeout(() => beep(1046, 0.85, 'sine', 0.07), 1300)
  },
  /** CRT / pixel-dialog power-off. */
  dialogClose: () => {
    if (muted) return
    const audio = getCtx()
    if (!audio) return

    const whoosh = audio.createOscillator()
    const g = audio.createGain()
    whoosh.type = 'sawtooth'
    whoosh.frequency.setValueAtTime(420, audio.currentTime)
    whoosh.frequency.exponentialRampToValueAtTime(70, audio.currentTime + 0.2)
    g.gain.setValueAtTime(0.001, audio.currentTime)
    g.gain.exponentialRampToValueAtTime(0.09, audio.currentTime + 0.03)
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.24)
    whoosh.connect(g)
    g.connect(audio.destination)
    whoosh.start()
    whoosh.stop(audio.currentTime + 0.24)

    beep(330, 0.07, 'square', 0.05)
    setTimeout(() => beep(180, 0.1, 'triangle', 0.04), 40)
  },
}
