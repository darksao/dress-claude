import { SeasonCode, SeasonPalette } from '@/types'

export const SEASONS: Record<SeasonCode, SeasonPalette> = {
  'light-spring': {
    code: 'light-spring',
    name: 'Light Spring',
    emoji: '🌸',
    family: 'spring',
    description: 'Couleurs légères, lumineuses et chaudes. Teintes pastel vivantes.',
    colors: [
      '#FADADD', '#FFB6C1', '#FFDAB9', '#FFE4B5', '#FFFACD',
      '#E0F0E0', '#B5EAD7', '#C7CEEA', '#FFD700', '#FF6347',
      '#FFA07A', '#F08080', '#90EE90', '#87CEEB', '#DDA0DD',
      '#F5DEB3', '#FAFAD2', '#FFE4E1', '#FFF0F5', '#FFFFF0',
      '#FF69B4', '#FF7F50', '#FFDEAD', '#EEE8AA', '#98FB98',
      '#AFEEEE', '#DB7093', '#F0E68C', '#FFC0CB', '#FFE4C4'
    ],
    avoid: ['#000000', '#1C1C1C', '#2F4F4F', '#191970', '#4B0082'],
    hairColors: ['#F5DEB3', '#D2B48C', '#C4A882', '#B8860B', '#DAA520', '#CD853F'],
    characteristics: { warmth: 'warm', depth: 'light', clarity: 'bright' }
  },
  'warm-spring': {
    code: 'warm-spring',
    name: 'Warm Spring',
    emoji: '🌻',
    family: 'spring',
    description: 'Couleurs chaudes et dorées. Tons pêche, corail, turquoise.',
    colors: [
      '#FF6347', '#FF7F50', '#FFA500', '#FFD700', '#FFDAB9',
      '#F4A460', '#DAA520', '#CD853F', '#DEB887', '#D2691E',
      '#FF4500', '#FF8C00', '#FFA07A', '#FFDEAD', '#FFE4B5',
      '#BDB76B', '#808000', '#6B8E23', '#9ACD32', '#32CD32',
      '#00CED1', '#20B2AA', '#40E0D0', '#48D1CC', '#7FFFD4',
      '#F0E68C', '#EEE8AA', '#FFFACD', '#FAFAD2', '#FFFFF0'
    ],
    avoid: ['#000000', '#C0C0C0', '#808080', '#4B0082', '#FF1493'],
    hairColors: ['#B8860B', '#DAA520', '#CD853F', '#D2691E', '#A0522D', '#8B4513'],
    characteristics: { warmth: 'warm', depth: 'deep', clarity: 'bright' }
  },
  'bright-spring': {
    code: 'bright-spring',
    name: 'Bright Spring',
    emoji: '🌈',
    family: 'spring',
    description: 'Couleurs vives et saturées. Contrastes nets avec des teintes chaudes.',
    colors: [
      '#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500',
      '#FFD700', '#FFFF00', '#00FF00', '#32CD32', '#00CED1',
      '#00BFFF', '#1E90FF', '#4169E1', '#FF1493', '#FF69B4',
      '#FF00FF', '#BA55D3', '#9370DB', '#00FA9A', '#7FFF00',
      '#FFFFFF', '#FFF8DC', '#FFFAF0', '#F0FFFF', '#F5FFFA',
      '#FFDAB9', '#FFE4B5', '#FFEFD5', '#FFF5EE', '#FDF5E6'
    ],
    avoid: ['#808080', '#A9A9A9', '#BC8F8F', '#D2B48C', '#C0C0C0'],
    hairColors: ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#B8860B', '#1C1C1C'],
    characteristics: { warmth: 'warm', depth: 'light', clarity: 'bright' }
  },
  'light-summer': {
    code: 'light-summer',
    name: 'Light Summer',
    emoji: '🌊',
    family: 'summer',
    description: 'Couleurs douces, fraîches et pastel. Teintes lavande et rose poudré.',
    colors: [
      '#E6E6FA', '#D8BFD8', '#DDA0DD', '#EE82EE', '#DA70D6',
      '#C71585', '#DB7093', '#FF69B4', '#FFB6C1', '#FFC0CB',
      '#B0C4DE', '#ADD8E6', '#87CEEB', '#87CEFA', '#00BFFF',
      '#AFEEEE', '#E0FFFF', '#F0F8FF', '#F5F5DC', '#FFF0F5',
      '#FFE4E1', '#FAEBD7', '#FFFAFA', '#F0FFF0', '#F5FFFA',
      '#B0E0E6', '#5F9EA0', '#6495ED', '#7B68EE', '#9370DB'
    ],
    avoid: ['#000000', '#8B0000', '#006400', '#191970', '#FF4500'],
    hairColors: ['#D2B48C', '#C4A882', '#A9A9A9', '#808080', '#B8860B', '#DEB887'],
    characteristics: { warmth: 'cool', depth: 'light', clarity: 'soft' }
  },
  'cool-summer': {
    code: 'cool-summer',
    name: 'Cool Summer',
    emoji: '🫐',
    family: 'summer',
    description: 'Couleurs fraîches et douces. Rose, bleu et gris subtils.',
    colors: [
      '#4682B4', '#5F9EA0', '#6495ED', '#7B68EE', '#9370DB',
      '#8B008B', '#9932CC', '#BA55D3', '#C71585', '#DB7093',
      '#FF69B4', '#FFB6C1', '#FFC0CB', '#B0C4DE', '#778899',
      '#708090', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC',
      '#E0E0E0', '#F5F5F5', '#FFFFFF', '#E6E6FA', '#D8BFD8',
      '#FFFAFA', '#F0F8FF', '#F8F8FF', '#F0FFF0', '#FFF0F5'
    ],
    avoid: ['#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#8B4513'],
    hairColors: ['#696969', '#808080', '#A9A9A9', '#4A4A4A', '#2F2F2F', '#5C4033'],
    characteristics: { warmth: 'cool', depth: 'light', clarity: 'soft' }
  },
  'soft-summer': {
    code: 'soft-summer',
    name: 'Soft Summer',
    emoji: '🌫️',
    family: 'summer',
    description: 'Couleurs douces et atténuées. Teintes poudrées et grisées.',
    colors: [
      '#778899', '#708090', '#B0C4DE', '#AFEEEE', '#E0FFFF',
      '#D8BFD8', '#DDA0DD', '#E6E6FA', '#C0C0C0', '#A9A9A9',
      '#BC8F8F', '#CD5C5C', '#DB7093', '#D2B48C', '#C4A882',
      '#8FBC8F', '#2E8B57', '#3CB371', '#66CDAA', '#5F9EA0',
      '#4682B4', '#6495ED', '#9370DB', '#8B7D7B', '#D2691E',
      '#F5F5DC', '#FAEBD7', '#FFF8DC', '#FAF0E6', '#FFFFF0'
    ],
    avoid: ['#FF0000', '#FF4500', '#00FF00', '#FFD700', '#000000'],
    hairColors: ['#8B7355', '#A0522D', '#696969', '#808080', '#6B4423', '#8B7765'],
    characteristics: { warmth: 'cool', depth: 'light', clarity: 'soft' }
  },
  'soft-autumn': {
    code: 'soft-autumn',
    name: 'Soft Autumn',
    emoji: '🍂',
    family: 'autumn',
    description: 'Couleurs chaudes et atténuées. Tons terre doux et poudrés.',
    colors: [
      '#D2B48C', '#DEB887', '#F5DEB3', '#FAEBD7', '#FFE4C4',
      '#CD853F', '#D2691E', '#8B4513', '#A0522D', '#BC8F8F',
      '#F4A460', '#DAA520', '#B8860B', '#808000', '#6B8E23',
      '#556B2F', '#2E8B57', '#8FBC8F', '#BDB76B', '#9ACD32',
      '#CD5C5C', '#B22222', '#A52A2A', '#8B0000', '#C0C0C0',
      '#708090', '#778899', '#696969', '#FAFAD2', '#FFF8DC'
    ],
    avoid: ['#FF1493', '#FF69B4', '#00BFFF', '#1E90FF', '#000000'],
    hairColors: ['#8B7355', '#A0522D', '#6B4423', '#8B7765', '#D2B48C', '#C4A882'],
    characteristics: { warmth: 'warm', depth: 'light', clarity: 'soft' }
  },
  'warm-autumn': {
    code: 'warm-autumn',
    name: 'Warm Autumn',
    emoji: '🍁',
    family: 'autumn',
    description: 'Couleurs chaudes et profondes. Rouille, olive, moutarde.',
    colors: [
      '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#B8860B',
      '#DAA520', '#808000', '#556B2F', '#6B8E23', '#2E8B57',
      '#8B0000', '#A52A2A', '#B22222', '#CD5C5C', '#FF4500',
      '#FF6347', '#FF8C00', '#FFA500', '#D2B48C', '#DEB887',
      '#F5DEB3', '#FAEBD7', '#FFE4B5', '#FFDAB9', '#BDB76B',
      '#696969', '#808080', '#778899', '#F4A460', '#E9967A'
    ],
    avoid: ['#FF1493', '#FF69B4', '#00BFFF', '#C0C0C0', '#000000'],
    hairColors: ['#8B4513', '#A0522D', '#D2691E', '#B8860B', '#6B4423', '#800000'],
    characteristics: { warmth: 'warm', depth: 'deep', clarity: 'soft' }
  },
  'deep-autumn': {
    code: 'deep-autumn',
    name: 'Deep Autumn',
    emoji: '🌰',
    family: 'autumn',
    description: 'Couleurs chaudes, profondes et riches. Bordeaux, vert forêt, chocolat.',
    colors: [
      '#800000', '#8B0000', '#A52A2A', '#B22222', '#8B4513',
      '#A0522D', '#D2691E', '#006400', '#228B22', '#2E8B57',
      '#556B2F', '#6B8E23', '#808000', '#B8860B', '#DAA520',
      '#191970', '#000080', '#2F4F4F', '#4B0082', '#800080',
      '#D2B48C', '#DEB887', '#FFD700', '#FF8C00', '#FF4500',
      '#1C1C1C', '#333333', '#696969', '#F5DEB3', '#FAEBD7'
    ],
    avoid: ['#FFB6C1', '#FFC0CB', '#E6E6FA', '#ADD8E6', '#AFEEEE'],
    hairColors: ['#1C1C1C', '#2F2F2F', '#4A3728', '#3B2314', '#8B4513', '#800000'],
    characteristics: { warmth: 'warm', depth: 'deep', clarity: 'soft' }
  },
  'deep-winter': {
    code: 'deep-winter',
    name: 'Deep Winter',
    emoji: '🌑',
    family: 'winter',
    description: 'Contrastes forts, couleurs saturées et profondes.',
    colors: [
      '#000000', '#1C1C1C', '#191970', '#000080', '#00008B',
      '#0000CD', '#8B0000', '#B22222', '#006400', '#008000',
      '#4B0082', '#800080', '#8B008B', '#C71585', '#FF1493',
      '#FFFFFF', '#F5F5F5', '#DCDCDC', '#C0C0C0', '#FF0000',
      '#00FF00', '#1E90FF', '#FF00FF', '#FFD700', '#00CED1',
      '#DC143C', '#4169E1', '#2E8B57', '#9400D3', '#FF4500'
    ],
    avoid: ['#F5DEB3', '#FFA07A', '#98FB98', '#DEB887', '#D2B48C'],
    hairColors: ['#000000', '#1C1C1C', '#2F2F2F', '#1a0a00', '#3B2314', '#4A3728'],
    characteristics: { warmth: 'cool', depth: 'deep', clarity: 'bright' }
  },
  'cool-winter': {
    code: 'cool-winter',
    name: 'Cool Winter',
    emoji: '❄️',
    family: 'winter',
    description: 'Couleurs froides et vives. Bleu glacier, rose fuchsia, argent.',
    colors: [
      '#000000', '#191970', '#000080', '#0000FF', '#4169E1',
      '#1E90FF', '#00BFFF', '#87CEEB', '#FF1493', '#FF69B4',
      '#C71585', '#8B008B', '#9400D3', '#BA55D3', '#4B0082',
      '#FFFFFF', '#F5F5F5', '#C0C0C0', '#808080', '#708090',
      '#E6E6FA', '#D8BFD8', '#B0C4DE', '#F0F8FF', '#FFFAFA',
      '#DC143C', '#FF0000', '#00CED1', '#20B2AA', '#2E8B57'
    ],
    avoid: ['#FF8C00', '#FFA500', '#FFD700', '#8B4513', '#D2691E'],
    hairColors: ['#000000', '#1C1C1C', '#4A4A4A', '#696969', '#2F2F2F', '#3B2314'],
    characteristics: { warmth: 'cool', depth: 'deep', clarity: 'bright' }
  },
  'bright-winter': {
    code: 'bright-winter',
    name: 'Bright Winter',
    emoji: '💎',
    family: 'winter',
    description: 'Couleurs éclatantes et contrastées. Jewel tones vifs.',
    colors: [
      '#FF0000', '#0000FF', '#FF00FF', '#00FFFF', '#FFD700',
      '#FF1493', '#00FF00', '#FF4500', '#8A2BE2', '#DC143C',
      '#4169E1', '#1E90FF', '#00CED1', '#FF69B4', '#9400D3',
      '#000000', '#FFFFFF', '#C0C0C0', '#F5F5F5', '#191970',
      '#006400', '#8B0000', '#4B0082', '#800080', '#008B8B',
      '#B22222', '#2E8B57', '#6A5ACD', '#483D8B', '#00008B'
    ],
    avoid: ['#D2B48C', '#DEB887', '#F5DEB3', '#BC8F8F', '#808080'],
    hairColors: ['#000000', '#1C1C1C', '#3B2314', '#4A3728', '#2F2F2F', '#4A4A4A'],
    characteristics: { warmth: 'cool', depth: 'deep', clarity: 'bright' }
  }
}

export function getSeasonByCode(code: SeasonCode): SeasonPalette {
  return SEASONS[code]
}

export function getAllSeasons(): SeasonPalette[] {
  return Object.values(SEASONS)
}

export function getSeasonsByFamily(family: SeasonPalette['family']): SeasonPalette[] {
  return Object.values(SEASONS).filter(s => s.family === family)
}
