import { Outfit } from '@/types'
import OutfitCard from './OutfitCard'
import Link from 'next/link'

interface OutfitGridProps {
  outfits: Outfit[]
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export default function OutfitGrid({ outfits, onToggleFavorite, onDelete }: OutfitGridProps) {
  if (outfits.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">👗</p>
        <p className="text-gray-400 mb-6">Aucune tenue sauvegardée pour l&apos;instant.</p>
        <Link href="/avatar" className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
          Créer ma première tenue →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {outfits.map(outfit => (
        <OutfitCard
          key={outfit.id}
          outfit={outfit}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
