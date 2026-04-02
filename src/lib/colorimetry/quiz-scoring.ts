import { QuizAnswers, SeasonCode } from '@/types'

interface ScoreAxis {
  warmth: number  // -1 (cool) to +1 (warm)
  depth: number   // -1 (light) to +1 (deep)
  clarity: number // -1 (soft) to +1 (bright)
}

const SKIN_SCORES: Record<string, Partial<ScoreAxis>> = {
  'fair-warm': { warmth: 0.5, depth: -0.8 },
  'fair-cool': { warmth: -0.5, depth: -0.8 },
  'fair-neutral': { warmth: 0, depth: -0.8 },
  'medium-warm': { warmth: 0.5, depth: 0 },
  'medium-cool': { warmth: -0.5, depth: 0 },
  'medium-neutral': { warmth: 0, depth: 0 },
  'deep-warm': { warmth: 0.5, depth: 0.8 },
  'deep-cool': { warmth: -0.5, depth: 0.8 },
  'deep-neutral': { warmth: 0, depth: 0.8 },
}

const EYE_SCORES: Record<string, Partial<ScoreAxis>> = {
  'blue': { warmth: -0.3, clarity: 0.3 },
  'green': { warmth: 0.2, clarity: 0.2 },
  'hazel': { warmth: 0.3, clarity: -0.1 },
  'brown': { warmth: 0.1, depth: 0.2 },
  'dark-brown': { warmth: 0, depth: 0.5 },
}

const HAIR_SCORES: Record<string, Partial<ScoreAxis>> = {
  'blonde': { warmth: 0.3, depth: -0.7, clarity: 0.2 },
  'light-brown': { warmth: 0.1, depth: -0.3, clarity: 0 },
  'medium-brown': { warmth: 0, depth: 0.1, clarity: -0.1 },
  'dark-brown': { warmth: -0.1, depth: 0.5, clarity: -0.1 },
  'black': { warmth: -0.2, depth: 0.8, clarity: 0.3 },
  'red': { warmth: 0.6, depth: 0, clarity: 0.3 },
}

const CONTRAST_SCORES: Record<string, Partial<ScoreAxis>> = {
  'high': { clarity: 0.6 },
  'medium': { clarity: 0 },
  'low': { clarity: -0.6 },
}

const SEASON_TARGETS: Record<SeasonCode, ScoreAxis> = {
  'light-spring':  { warmth: 0.5, depth: -0.7, clarity: 0.3 },
  'warm-spring':   { warmth: 0.8, depth: 0.2, clarity: 0.5 },
  'bright-spring': { warmth: 0.4, depth: -0.3, clarity: 0.8 },
  'light-summer':  { warmth: -0.3, depth: -0.7, clarity: -0.3 },
  'cool-summer':   { warmth: -0.7, depth: -0.2, clarity: -0.3 },
  'soft-summer':   { warmth: -0.2, depth: -0.3, clarity: -0.7 },
  'soft-autumn':   { warmth: 0.3, depth: -0.2, clarity: -0.7 },
  'warm-autumn':   { warmth: 0.8, depth: 0.5, clarity: -0.3 },
  'deep-autumn':   { warmth: 0.5, depth: 0.8, clarity: -0.3 },
  'deep-winter':   { warmth: -0.3, depth: 0.8, clarity: 0.5 },
  'cool-winter':   { warmth: -0.8, depth: 0.3, clarity: 0.5 },
  'bright-winter': { warmth: -0.3, depth: 0.3, clarity: 0.8 },
}

function computeScores(answers: QuizAnswers): ScoreAxis {
  const skinKey = `${answers.skin_tone}-${answers.undertone}`
  const skin = SKIN_SCORES[skinKey] || {}
  const eye = EYE_SCORES[answers.eye_color] || {}
  const hair = HAIR_SCORES[answers.hair_color] || {}
  const contrast = CONTRAST_SCORES[answers.contrast_level] || {}

  return {
    warmth: (skin.warmth || 0) + (eye.warmth || 0) + (hair.warmth || 0),
    depth: (skin.depth || 0) + (eye.depth || 0) + (hair.depth || 0),
    clarity: (eye.clarity || 0) + (hair.clarity || 0) + (contrast.clarity || 0),
  }
}

function distance(a: ScoreAxis, b: ScoreAxis): number {
  return Math.sqrt(
    Math.pow(a.warmth - b.warmth, 2) +
    Math.pow(a.depth - b.depth, 2) +
    Math.pow(a.clarity - b.clarity, 2)
  )
}

export function determineSeason(answers: QuizAnswers): { season: SeasonCode; confidence: 'high' | 'medium' } {
  const scores = computeScores(answers)

  const ranked = (Object.entries(SEASON_TARGETS) as [SeasonCode, ScoreAxis][])
    .map(([code, target]) => ({ code, dist: distance(scores, target) }))
    .sort((a, b) => a.dist - b.dist)

  const best = ranked[0]
  const second = ranked[1]
  const gap = second.dist - best.dist

  return {
    season: best.code,
    confidence: gap > 0.4 ? 'high' : 'medium',
  }
}
