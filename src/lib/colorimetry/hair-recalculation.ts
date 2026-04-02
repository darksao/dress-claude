import { SeasonCode, QuizAnswers, HairColor } from '@/types'
import { determineSeason } from './quiz-scoring'

const HAIR_HEX_TO_NAME: Record<string, HairColor> = {
  '#F5DEB3': 'blonde', '#D2B48C': 'blonde', '#C4A882': 'blonde',
  '#DAA520': 'blonde', '#B8860B': 'light-brown', '#CD853F': 'light-brown',
  '#D2691E': 'medium-brown', '#A0522D': 'medium-brown', '#8B7355': 'medium-brown',
  '#8B4513': 'dark-brown', '#6B4423': 'dark-brown', '#5C4033': 'dark-brown',
  '#4A3728': 'dark-brown', '#3B2314': 'black', '#2F2F2F': 'black',
  '#1C1C1C': 'black', '#000000': 'black', '#4A4A4A': 'black',
  '#696969': 'dark-brown', '#808080': 'light-brown', '#A9A9A9': 'blonde',
  '#800000': 'red', '#993333': 'red', '#CC6633': 'red',
}

function closestHairName(hex: string): HairColor {
  if (HAIR_HEX_TO_NAME[hex]) return HAIR_HEX_TO_NAME[hex]

  let closest: HairColor = 'medium-brown'
  let minDist = Infinity

  for (const [refHex, name] of Object.entries(HAIR_HEX_TO_NAME)) {
    const r1 = parseInt(hex.slice(1, 3), 16)
    const g1 = parseInt(hex.slice(3, 5), 16)
    const b1 = parseInt(hex.slice(5, 7), 16)
    const r2 = parseInt(refHex.slice(1, 3), 16)
    const g2 = parseInt(refHex.slice(3, 5), 16)
    const b2 = parseInt(refHex.slice(5, 7), 16)
    const dist = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
    if (dist < minDist) {
      minDist = dist
      closest = name
    }
  }

  return closest
}

export function recalculateSeasonForHair(
  currentAnswers: QuizAnswers,
  newHairHex: string
): { season: SeasonCode; confidence: 'high' | 'medium'; changed: boolean; previousSeason: SeasonCode } {
  const previousResult = determineSeason(currentAnswers)
  const newHairName = closestHairName(newHairHex)

  const updatedAnswers: QuizAnswers = {
    ...currentAnswers,
    hair_color: newHairName,
  }

  const newResult = determineSeason(updatedAnswers)

  return {
    season: newResult.season,
    confidence: newResult.confidence,
    changed: newResult.season !== previousResult.season,
    previousSeason: previousResult.season,
  }
}
