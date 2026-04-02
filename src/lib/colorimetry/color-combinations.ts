import { SeasonPalette, AvatarState } from '@/types'

interface OutfitSuggestion {
  label: string
  top: string
  bottom: string
  shoes: string
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
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

function isNeutral(hex: string): boolean {
  const { s } = hexToHsl(hex)
  return s < 0.15
}

function getComplementaryHue(h: number): number {
  return (h + 180) % 360
}

function getAnalogousHues(h: number): [number, number] {
  return [(h + 30) % 360, (h + 330) % 360]
}

function findClosestInPalette(targetHue: number, palette: string[], exclude: string[]): string | null {
  let best: string | null = null
  let bestDist = Infinity

  for (const color of palette) {
    if (exclude.includes(color)) continue
    const { h, s } = hexToHsl(color)
    if (s < 0.1) continue
    const dist = Math.min(Math.abs(h - targetHue), 360 - Math.abs(h - targetHue))
    if (dist < bestDist) {
      bestDist = dist
      best = color
    }
  }
  return best
}

function findNeutralInPalette(palette: string[], lightness: 'light' | 'dark', exclude: string[]): string {
  const neutrals = palette.filter(c => {
    if (exclude.includes(c)) return false
    const { s, l } = hexToHsl(c)
    if (s > 0.2) return false
    return lightness === 'light' ? l > 0.5 : l <= 0.5
  })
  return neutrals[0] || (lightness === 'dark' ? '#333333' : '#F5F5F5')
}

export function suggestOutfits(
  selectedZone: keyof AvatarState,
  selectedColor: string,
  season: SeasonPalette
): OutfitSuggestion[] {
  const palette = season.colors
  const { h } = hexToHsl(selectedColor)
  const suggestions: OutfitSuggestion[] = []

  // Suggestion 1: Complementary harmony
  const compHue = getComplementaryHue(h)
  const compColor = findClosestInPalette(compHue, palette, [selectedColor])
  const neutral1 = findNeutralInPalette(palette, 'dark', [selectedColor])
  if (compColor) {
    suggestions.push({
      label: 'Complémentaire',
      top: selectedZone === 'top' ? selectedColor : compColor,
      bottom: selectedZone === 'bottom' ? selectedColor : (selectedZone === 'top' ? compColor : neutral1),
      shoes: selectedZone === 'shoes' ? selectedColor : neutral1,
    })
  }

  // Suggestion 2: Analogous harmony
  const [anaHue1] = getAnalogousHues(h)
  const anaColor = findClosestInPalette(anaHue1, palette, [selectedColor])
  const neutral2 = findNeutralInPalette(palette, 'light', [selectedColor])
  if (anaColor) {
    suggestions.push({
      label: 'Harmonieux',
      top: selectedZone === 'top' ? selectedColor : anaColor,
      bottom: selectedZone === 'bottom' ? selectedColor : (selectedZone === 'top' ? anaColor : neutral2),
      shoes: selectedZone === 'shoes' ? selectedColor : neutral2,
    })
  }

  // Suggestion 3: Neutral + accent
  const darkNeutral = findNeutralInPalette(palette, 'dark', [])
  const lightNeutral = findNeutralInPalette(palette, 'light', [])
  suggestions.push({
    label: 'Neutre + accent',
    top: selectedZone === 'top' ? selectedColor : (isNeutral(selectedColor) ? palette[Math.floor(Math.random() * 10)] : darkNeutral),
    bottom: selectedZone === 'bottom' ? selectedColor : darkNeutral,
    shoes: selectedZone === 'shoes' ? selectedColor : lightNeutral,
  })

  return suggestions.slice(0, 3)
}
