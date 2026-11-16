import type { HabitatLighting } from '../data/mission2Data'

export interface MarsZoomLook {
  voidTop: string
  voidBot: string
  marsLit: string
  marsMid: string
  marsDark: string
  atmosphere: string
  sunGlow: string
  sunCore: string
  starAlpha: number
  sunAngle: number
  sunRadius: number
  sunAlpha: number
  polarAlpha: number
}

/** Same globe the Missão 02 window shows. Radius is a fraction of the shorter side. */
export const MARS_ZOOM_RADIUS = 0.42
export const MARS_ZOOM_CY = 0.58

export const MARS_ZOOM_LOOKS: Record<HabitatLighting, MarsZoomLook> = {
  morning: {
    voidTop: '#050814',
    voidBot: '#0c1228',
    marsLit: '#e8a878',
    marsMid: '#c4683a',
    marsDark: '#4a1e12',
    atmosphere: 'rgba(255,180,120,0.45)',
    sunGlow: 'rgba(255,220,160,0.55)',
    sunCore: '#ffe8b0',
    starAlpha: 0.55,
    sunAngle: -0.55,
    sunRadius: 0.28,
    sunAlpha: 0.95,
    polarAlpha: 0.35,
  },
  afternoon: {
    voidTop: '#04060f',
    voidBot: '#0a1020',
    marsLit: '#d48850',
    marsMid: '#a84828',
    marsDark: '#3a160c',
    atmosphere: 'rgba(255,140,80,0.4)',
    sunGlow: 'rgba(255,200,120,0.5)',
    sunCore: '#ffd090',
    starAlpha: 0.65,
    sunAngle: -0.15,
    sunRadius: 0.28,
    sunAlpha: 0.95,
    polarAlpha: 0.35,
  },
  dusk: {
    voidTop: '#06040e',
    voidBot: '#120818',
    marsLit: '#c85840',
    marsMid: '#7a2818',
    marsDark: '#1a0808',
    atmosphere: 'rgba(220,80,60,0.35)',
    sunGlow: 'rgba(255,120,70,0.4)',
    sunCore: '#ff9a60',
    starAlpha: 0.85,
    sunAngle: 0.75,
    sunRadius: 0.28,
    sunAlpha: 0.95,
    polarAlpha: 0.35,
  },
  night: {
    voidTop: '#020308',
    voidBot: '#060810',
    marsLit: '#6a3a28',
    marsMid: '#2a1410',
    marsDark: '#080406',
    atmosphere: 'rgba(100,60,80,0.25)',
    sunGlow: 'rgba(180,160,220,0.15)',
    sunCore: '#c8c0e8',
    starAlpha: 1,
    sunAngle: 2.4,
    sunRadius: 0.12,
    sunAlpha: 0.45,
    polarAlpha: 0.15,
  },
  dawn: {
    voidTop: '#060812',
    voidBot: '#101828',
    marsLit: '#e09868',
    marsMid: '#a85830',
    marsDark: '#3a180c',
    atmosphere: 'rgba(255,160,100,0.4)',
    sunGlow: 'rgba(255,190,140,0.5)',
    sunCore: '#ffd8a0',
    starAlpha: 0.7,
    sunAngle: -1.05,
    sunRadius: 0.28,
    sunAlpha: 0.95,
    polarAlpha: 0.35,
  },
}

export interface MarsStar {
  x: number
  y: number
  r: number
  tw: number
}

export function createMarsStars(count = 120): MarsStar[] {
  return Array.from({ length: count }, (_, i) => ({
    x: (i * 97 + 13) % 1000,
    y: (i * 53 + 29) % 1000,
    r: 0.4 + (i % 4) * 0.35,
    tw: (i % 9) * 0.35,
  }))
}

/** Frame of the approach: starts farther out and ends on the Missão 02 zoom. */
export function marsApproachFrame(w: number, h: number, progress: number) {
  const p = Math.min(1, Math.max(0, progress))
  const ease = p * p * (3 - 2 * p)
  return {
    cx: w * 0.5,
    cy: h * (0.4 + ease * (MARS_ZOOM_CY - 0.4)),
    radius: Math.min(w, h) * (0.09 + ease * (MARS_ZOOM_RADIUS - 0.09)),
  }
}

export function drawMarsZoom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  now: number,
  t0: number,
  look: MarsZoomLook,
  stars: readonly MarsStar[],
  frame?: { cx: number; cy: number; radius: number },
) {
  const cx = frame?.cx ?? w * 0.5
  const cy = frame?.cy ?? h * MARS_ZOOM_CY
  const R = frame?.radius ?? Math.min(w, h) * MARS_ZOOM_RADIUS

  const voidGrad = ctx.createLinearGradient(0, 0, 0, h)
  voidGrad.addColorStop(0, look.voidTop)
  voidGrad.addColorStop(1, look.voidBot)
  ctx.fillStyle = voidGrad
  ctx.fillRect(0, 0, w, h)

  const pulse = (Math.sin((now - t0) / 900) + 1) * 0.5
  for (const s of stars) {
    ctx.globalAlpha = look.starAlpha * (0.35 + 0.55 * (0.5 + 0.5 * Math.sin(now / 600 + s.tw)) + 0.15 * pulse)
    ctx.fillStyle = '#eef4ff'
    ctx.beginPath()
    ctx.arc((s.x / 1000) * w, (s.y / 1000) * h, s.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  const sunX = cx + Math.cos(look.sunAngle) * R * 1.55
  const sunY = cy + Math.sin(look.sunAngle) * R * 0.55 - R * 0.35
  const sunR = R * look.sunRadius
  const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3.5)
  halo.addColorStop(0, look.sunGlow)
  halo.addColorStop(0.5, 'rgba(255,200,140,0.08)')
  halo.addColorStop(1, 'transparent')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR * 3.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = look.sunCore
  ctx.globalAlpha = look.sunAlpha
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  const litX = cx + Math.cos(look.sunAngle) * R * 0.35
  const litY = cy + Math.sin(look.sunAngle) * R * 0.25
  const body = ctx.createRadialGradient(litX, litY, R * 0.1, cx, cy, R)
  body.addColorStop(0, look.marsLit)
  body.addColorStop(0.45, look.marsMid)
  body.addColorStop(1, look.marsDark)
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fillStyle = body
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.clip()

  ctx.globalAlpha = 0.22
  ctx.strokeStyle = look.marsDark
  ctx.lineWidth = R * 0.04
  for (let i = 0; i < 5; i++) {
    const yy = cy - R * 0.55 + i * R * 0.28 + Math.sin(now / 4000 + i) * R * 0.02
    ctx.beginPath()
    ctx.moveTo(cx - R, yy)
    ctx.quadraticCurveTo(cx, yy + R * 0.08 * ((i % 2) * 2 - 1), cx + R, yy - R * 0.04)
    ctx.stroke()
  }

  ctx.globalAlpha = look.polarAlpha
  ctx.fillStyle = '#f0e8e0'
  ctx.beginPath()
  ctx.ellipse(cx, cy - R * 0.72, R * 0.35, R * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()

  const shade = ctx.createLinearGradient(
    cx - Math.cos(look.sunAngle) * R,
    cy - Math.sin(look.sunAngle) * R,
    cx + Math.cos(look.sunAngle) * R,
    cy + Math.sin(look.sunAngle) * R,
  )
  shade.addColorStop(0, 'transparent')
  shade.addColorStop(0.55, 'transparent')
  shade.addColorStop(0.85, 'rgba(0,0,0,0.35)')
  shade.addColorStop(1, 'rgba(0,0,0,0.72)')
  ctx.globalAlpha = 1
  ctx.fillStyle = shade
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2)

  ctx.fillStyle = 'rgba(255,200,150,0.2)'
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + now / 8000
    const rr = R * (0.82 + (i % 3) * 0.05)
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.92, 1 + (i % 2), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  const atmo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.08)
  atmo.addColorStop(0, 'transparent')
  atmo.addColorStop(0.7, look.atmosphere)
  atmo.addColorStop(1, 'transparent')
  ctx.beginPath()
  ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2)
  ctx.fillStyle = atmo
  ctx.fill()

  ctx.strokeStyle = look.marsLit
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, R, look.sunAngle - 1.1, look.sunAngle + 1.1)
  ctx.stroke()
  ctx.globalAlpha = 1
}
