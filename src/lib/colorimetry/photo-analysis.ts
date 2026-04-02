import { SeasonCode } from '@/types'
import { SEASONS } from './seasons'

interface ExtractedColors {
  skin: string
  dominantHue: number
  dominantSaturation: number
  dominantLightness: number
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s, l }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

export function extractColorsFromImage(canvas: HTMLCanvasElement): ExtractedColors {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height

  const centerX = Math.floor(width * 0.3)
  const centerY = Math.floor(height * 0.2)
  const sampleW = Math.floor(width * 0.4)
  const sampleH = Math.floor(height * 0.4)

  const imageData = ctx.getImageData(centerX, centerY, sampleW, sampleH)
  const pixels = imageData.data

  let totalR = 0, totalG = 0, totalB = 0, count = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
    const { l } = rgbToHsl(r, g, b)
    if (l > 0.15 && l < 0.85) {
      totalR += r; totalG += g; totalB += b; count++
    }
  }

  if (count === 0) return { skin: '#D4A574', dominantHue: 30, dominantSaturation: 0.3, dominantLightness: 0.6 }

  const avgR = Math.round(totalR / count)
  const avgG = Math.round(totalG / count)
  const avgB = Math.round(totalB / count)
  const { h, s, l } = rgbToHsl(avgR, avgG, avgB)

  return {
    skin: rgbToHex(avgR, avgG, avgB),
    dominantHue: h,
    dominantSaturation: s,
    dominantLightness: l,
  }
}

export function refineSeasonFromPhoto(
  currentSeason: SeasonCode,
  extracted: ExtractedColors
): { season: SeasonCode; changed: boolean } {
  const current = SEASONS[currentSeason]

  const isWarm = extracted.dominantHue >= 15 && extracted.dominantHue <= 50
  const currentIsWarm = current.characteristics.warmth === 'warm'

  if (isWarm === currentIsWarm) {
    return { season: currentSeason, changed: false }
  }

  const targetWarmth = isWarm ? 'warm' : 'cool'
  const targetDepth = current.characteristics.depth

  const match = Object.values(SEASONS).find(s =>
    s.characteristics.warmth === targetWarmth &&
    s.characteristics.depth === targetDepth
  )

  if (match) {
    return { season: match.code, changed: match.code !== currentSeason }
  }

  return { season: currentSeason, changed: false }
}
