export type Gender = 'male' | 'female'

export type SeasonCode =
  | 'light-spring' | 'warm-spring' | 'bright-spring'
  | 'light-summer' | 'cool-summer' | 'soft-summer'
  | 'soft-autumn' | 'warm-autumn' | 'deep-autumn'
  | 'deep-winter' | 'cool-winter' | 'bright-winter'

export type SkinTone = 'fair' | 'medium' | 'deep'
export type Undertone = 'warm' | 'cool' | 'neutral'
export type EyeColor = 'blue' | 'green' | 'hazel' | 'brown' | 'dark-brown'
export type HairColor = 'blonde' | 'light-brown' | 'medium-brown' | 'dark-brown' | 'black' | 'red'
export type ContrastLevel = 'high' | 'medium' | 'low'

export interface Profile {
  id: string
  gender: Gender
  season: SeasonCode | null
  skin_tone: SkinTone | null
  eye_color: EyeColor | null
  hair_color: HairColor | null
  contrast_level: ContrastLevel | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface QuizAnswers {
  skin_tone: SkinTone
  undertone: Undertone
  eye_color: EyeColor
  hair_color: HairColor
  contrast_level: ContrastLevel
}

export interface QuizResult {
  id: string
  user_id: string
  answers: QuizAnswers
  season_result: SeasonCode
  confidence: 'high' | 'medium'
  photo_analysis: PhotoAnalysis | null
  created_at: string
}

export interface PhotoAnalysis {
  skin_hex: string
  eye_hex: string
  hair_hex: string
  adjusted_season: SeasonCode | null
}

export interface Outfit {
  id: string
  user_id: string
  name: string | null
  hair_color: string
  top_color: string
  bottom_color: string
  shoes_color: string
  accessories_color: string | null
  is_favorite: boolean
  created_at: string
}

export interface SeasonPalette {
  code: SeasonCode
  name: string
  emoji: string
  family: 'spring' | 'summer' | 'autumn' | 'winter'
  description: string
  colors: string[]
  avoid: string[]
  hairColors: string[]
  characteristics: {
    warmth: 'warm' | 'cool'
    depth: 'light' | 'deep'
    clarity: 'bright' | 'soft'
  }
}

export type AvatarZoneId = 'hair' | 'top' | 'bottom' | 'shoes'

export interface AvatarState {
  hair: string
  top: string
  bottom: string
  shoes: string
}
