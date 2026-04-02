'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/layout/AuthGuard'
import OutfitGrid from '@/components/wardrobe/OutfitGrid'
import { Outfit } from '@/types'

export default function WardrobePage() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOutfits(data as Outfit[])
    }
    load()
  }, [])

  async function handleToggleFavorite(id: string) {
    const outfit = outfits.find(o => o.id === id)
    if (!outfit) return

    const supabase = createClient()
    await supabase.from('outfits').update({ is_favorite: !outfit.is_favorite }).eq('id', id)
    setOutfits(prev => prev.map(o => o.id === id ? { ...o, is_favorite: !o.is_favorite } : o))
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('outfits').delete().eq('id', id)
    setOutfits(prev => prev.filter(o => o.id !== id))
  }

  const filtered = filter === 'favorites' ? outfits.filter(o => o.is_favorite) : outfits

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Garde-robe</h1>
          <div className="flex gap-2">
            {(['all', 'favorites'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  filter === f ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Toutes' : '⭐ Favoris'}
              </button>
            ))}
          </div>
        </div>
        <OutfitGrid
          outfits={filtered}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
