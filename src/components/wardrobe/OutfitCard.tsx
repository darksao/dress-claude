'use client'

import { Outfit } from '@/types'

interface OutfitCardProps {
  outfit: Outfit
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export default function OutfitCard({ outfit, onToggleFavorite, onDelete }: OutfitCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Mini avatar preview */}
      <svg viewBox="0 0 120 200" className="w-full h-36 mx-auto">
        {/* Hair */}
        <ellipse cx="60" cy="20" rx="20" ry="12" fill={outfit.hair_color} />
        {/* Head */}
        <circle cx="60" cy="28" r="16" fill="#D4A574" />
        {/* Eyes */}
        <circle cx="54" cy="26" r="2" fill="#333" />
        <circle cx="66" cy="26" r="2" fill="#333" />
        {/* Top */}
        <rect x="40" y="46" width="40" height="50" rx="7" fill={outfit.top_color} />
        {/* Arms */}
        <rect x="28" y="48" width="12" height="30" rx="6" fill={outfit.top_color} />
        <rect x="80" y="48" width="12" height="30" rx="6" fill={outfit.top_color} />
        {/* Bottom */}
        <rect x="40" y="96" width="17" height="60" rx="6" fill={outfit.bottom_color} />
        <rect x="63" y="96" width="17" height="60" rx="6" fill={outfit.bottom_color} />
        {/* Shoes */}
        <ellipse cx="48" cy="162" rx="12" ry="5" fill={outfit.shoes_color} />
        <ellipse cx="72" cy="162" rx="12" ry="5" fill={outfit.shoes_color} />
      </svg>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">
          {new Date(outfit.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleFavorite(outfit.id)}
            className="text-base hover:scale-125 transition-transform"
            title={outfit.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {outfit.is_favorite ? '⭐' : '☆'}
          </button>
          <button
            onClick={() => onDelete(outfit.id)}
            className="text-base hover:scale-125 transition-transform text-gray-300 hover:text-red-400"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
