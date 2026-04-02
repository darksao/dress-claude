'use client'

import { AvatarZoneId } from '@/types'

interface ColorPickerProps {
  zone: AvatarZoneId
  colors: string[]
  selectedColor: string
  onColorSelect: (color: string) => void
}

const ZONE_LABELS: Record<AvatarZoneId, string> = {
  hair: 'Cheveux',
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
}

export default function ColorPicker({ zone, colors, selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Zone sélectionnée</p>
      <p className="text-lg font-bold mb-4">{ZONE_LABELS[zone]}</p>
      <p className="text-sm text-gray-500 mb-3">
        {zone === 'hair' ? 'Couleurs de cheveux réalistes :' : 'Couleurs recommandées pour ta saison :'}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => onColorSelect(color)}
            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
              selectedColor === color ? 'border-black scale-110 shadow-md' : 'border-gray-100'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}
