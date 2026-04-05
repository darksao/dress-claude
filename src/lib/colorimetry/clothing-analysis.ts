import { SeasonPalette } from '@/types'

export type ClothingRating = 'excellente' | 'neutre' | 'a-eviter'

export interface ColorResult {
  hex: string
  rating: ClothingRating
  label: string
  zone?: 'top' | 'middle' | 'bottom'
}

export interface ClothingAnalysisResult {
  colors: ColorResult[]
  globalVerdict?: ClothingRating
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

function hslDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1)
  const [r2, g2, b2] = hexToRgb(hex2)
  const [h1, s1, l1] = rgbToHsl(r1, g1, b1)
  const [h2, s2, l2] = rgbToHsl(r2, g2, b2)
  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180
  return Math.sqrt(dh * dh + (s1 - s2) ** 2 + (l1 - l2) ** 2) * 100
}

function extractDominantFromPixels(pixels: Uint8ClampedArray): string | null {
  const buckets = Array.from({ length: 12 }, () => ({
    totalR: 0, totalG: 0, totalB: 0, count: 0,
  }))

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
    const [h, , l] = rgbToHsl(r, g, b)
    if (l > 0.88 || l < 0.08) continue
    const bucket = Math.floor(h / 30) % 12
    buckets[bucket].totalR += r
    buckets[bucket].totalG += g
    buckets[bucket].totalB += b
    buckets[bucket].count++
  }

  const best = buckets.reduce((a, b) => b.count > a.count ? b : a)
  if (best.count === 0) return null
  return rgbToHex(best.totalR / best.count, best.totalG / best.count, best.totalB / best.count)
}

export function extractClothingColors(
  canvas: HTMLCanvasElement,
  mode: 'vetement' | 'tenue'
): { hex: string; zone?: 'top' | 'middle' | 'bottom' }[] {
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas

  if (mode === 'vetement') {
    const hex = extractDominantFromPixels(ctx.getImageData(0, 0, width, height).data)
    return hex ? [{ hex }] : []
  }

  const zoneH = Math.floor(height / 3)
  const zones: { zone: 'top' | 'middle' | 'bottom'; y: number }[] = [
    { zone: 'top', y: 0 },
    { zone: 'middle', y: zoneH },
    { zone: 'bottom', y: zoneH * 2 },
  ]

  return zones.flatMap(({ zone, y }) => {
    const hex = extractDominantFromPixels(ctx.getImageData(0, y, width, zoneH).data)
    return hex ? [{ hex, zone }] : []
  })
}

export function scoreColor(
  hex: string,
  season: SeasonPalette
): { rating: ClothingRating; label: string } {
  const minAvoid = Math.min(...season.avoid.map(c => hslDistance(hex, c)))
  if (minAvoid < 40) {
    return { rating: 'a-eviter', label: "Ne met pas en valeur ta carnation" }
  }
  const minGood = Math.min(...season.colors.map(c => hslDistance(hex, c)))
  if (minGood < 30) {
    return { rating: 'excellente', label: `Parfaite pour ${season.name}` }
  }
  return { rating: 'neutre', label: "Cette couleur peut fonctionner" }
}

export function analyzeClothingPhoto(
  canvas: HTMLCanvasElement,
  mode: 'vetement' | 'tenue',
  season: SeasonPalette
): ClothingAnalysisResult {
  const extracted = extractClothingColors(canvas, mode)
  const colors: ColorResult[] = extracted.map(({ hex, zone }) => ({
    hex,
    zone,
    ...scoreColor(hex, season),
  }))

  if (mode === 'vetement' || colors.length === 0) return { colors }

  const hasAvoid = colors.some(c => c.rating === 'a-eviter')
  const hasExcellente = colors.some(c => c.rating === 'excellente')
  const globalVerdict: ClothingRating = hasAvoid
    ? 'a-eviter'
    : hasExcellente
    ? 'excellente'
    : 'neutre'

  return { colors, globalVerdict }
}
