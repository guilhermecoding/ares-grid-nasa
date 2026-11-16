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

type DrillTone = 'soft' | 'rock' | 'ice'

let drillStopFn: (() => void) | null = null

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

/** One oscillator that glides from one pitch to another. */
function sweep(from: number, to: number, duration: number, type: OscillatorType = 'sine', gain = 0.05): void {
  if (muted) return
  const audio = getCtx()
  if (!audio) return
  const t0 = audio.currentTime
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t0)
  osc.frequency.exponentialRampToValueAtTime(to, t0 + duration)
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration)
}

/** Short filtered noise: sparks, spray, water rush, dust. */
function noiseBurst(
  duration: number,
  filter: BiquadFilterType,
  from: number,
  to: number = from,
  gain = 0.05,
): void {
  if (muted) return
  const audio = getCtx()
  if (!audio) return
  const t0 = audio.currentTime
  const length = Math.max(1, Math.floor(audio.sampleRate * duration))
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1
  const noise = audio.createBufferSource()
  noise.buffer = buffer
  const biquad = audio.createBiquadFilter()
  biquad.type = filter
  biquad.frequency.setValueAtTime(from, t0)
  biquad.frequency.exponentialRampToValueAtTime(to, t0 + duration)
  biquad.Q.value = 0.9
  const g = audio.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  noise.connect(biquad)
  biquad.connect(g)
  g.connect(audio.destination)
  noise.start(t0)
  noise.stop(t0 + duration)
}

export const soundEngine = {
  /** Picking up a cable, a seed or a tool. */
  pickup: () => sweep(420, 760, 0.07, 'sine', 0.035),
  /** A module or a seed locks into place. */
  snap: () => {
    beep(170, 0.1, 'square', 0.06)
    setTimeout(() => beep(540, 0.05, 'square', 0.035), 45)
  },
  /** Electric cable connects: spark crackle and a rising charge. */
  zap: () => {
    noiseBurst(0.16, 'highpass', 2600, 5200, 0.07)
    sweep(240, 1500, 0.32, 'sawtooth', 0.05)
    setTimeout(() => beep(1320, 0.16, 'square', 0.04), 260)
  },
  /** Water pipe connects: rush and three bubbles. */
  flow: () => {
    noiseBurst(0.5, 'bandpass', 380, 1400, 0.06)
    setTimeout(() => sweep(420, 760, 0.08, 'sine', 0.045), 120)
    setTimeout(() => sweep(520, 900, 0.08, 'sine', 0.045), 240)
    setTimeout(() => sweep(640, 1100, 0.1, 'sine', 0.045), 360)
  },
  /** Mist nozzle. Call it while the sprayer moves. */
  spray: () => noiseBurst(0.12, 'highpass', 3400, 5200, 0.03),
  /** Plants grow one stage. */
  grow: () => {
    const notes = [392, 494, 587, 784, 988]
    notes.forEach((freq, i) => setTimeout(() => beep(freq, 0.1, 'sine', 0.045), i * 70))
    setTimeout(() => sweep(900, 1900, 0.3, 'triangle', 0.025), 300)
  },
  /** One link of a cycle lights up. Higher pitch for each new link. */
  cycle: (index: number) => {
    const base = 440 * 2 ** (Math.max(0, index) / 4)
    sweep(base * 0.6, base, 0.14, 'triangle', 0.05)
    setTimeout(() => beep(base * 1.5, 0.18, 'sine', 0.045), 120)
  },
  /** Heavy hatch latch closes. */
  latch: () => {
    beep(110, 0.14, 'square', 0.08)
    noiseBurst(0.07, 'bandpass', 1800, 900, 0.05)
    setTimeout(() => beep(1500, 0.03, 'square', 0.03), 70)
  },
  /** Ratchet tick while a latch slides. */
  ratchet: () => beep(300 + Math.random() * 60, 0.02, 'square', 0.025),
  /** One Geiger counter click. */
  geiger: () => noiseBurst(0.018, 'highpass', 3000, 3000, 0.06),
  /** Brush over dusty glass. */
  scrub: () => noiseBurst(0.09, 'bandpass', 900, 1500, 0.03),
  /** Scanner sweep on an inspection point. */
  scan: () => {
    sweep(520, 1560, 0.28, 'sine', 0.045)
    setTimeout(() => beep(1760, 0.1, 'square', 0.03), 280)
  },
  /** One data packet leaves the antenna. */
  uplink: () => {
    beep(1180, 0.04, 'square', 0.03)
    setTimeout(() => beep(1580, 0.05, 'square', 0.03), 55)
  },
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
  /** Two soft tones for the solar-radiation siren. Call it on a timer, not in a loop. */
  siren: () => {
    beep(660, 0.14, 'sine', 0.03)
    setTimeout(() => beep(440, 0.14, 'sine', 0.028), 170)
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
  /** Short chime when the drill enters a new soil layer. */
  layerPing: () => {
    beep(520, 0.08, 'square', 0.05)
    setTimeout(() => beep(780, 0.12, 'sine', 0.045), 70)
  },
  /** Looping drill rumble. Call again to change the layer tone. */
  drillStart: (tone: DrillTone = 'soft') => {
    soundEngine.drillStop()
    if (muted) return
    const audio = getCtx()
    if (!audio) return
    const buffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
    const noise = audio.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const filter = audio.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = tone === 'rock' ? 160 : tone === 'ice' ? 880 : 420
    filter.Q.value = tone === 'rock' ? 0.55 : 1.2
    const gain = audio.createGain()
    gain.gain.value = tone === 'rock' ? 0.07 : 0.04
    const osc = audio.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = tone === 'rock' ? 46 : tone === 'ice' ? 150 : 72
    const oscGain = audio.createGain()
    oscGain.gain.value = tone === 'rock' ? 0.05 : 0.03
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(audio.destination)
    osc.connect(oscGain)
    oscGain.connect(audio.destination)
    noise.start()
    osc.start()
    drillStopFn = () => {
      noise.stop()
      osc.stop()
    }
  },
  drillStop: () => {
    drillStopFn?.()
    drillStopFn = null
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
