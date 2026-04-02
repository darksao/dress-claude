'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import AuthGuard from '@/components/layout/AuthGuard'
import PhotoAnalyzer from '@/components/quiz/PhotoAnalyzer'
import { SeasonCode } from '@/types'

export default function PhotoPage() {
  const router = useRouter()
  const [currentSeason, setCurrentSeason] = useState<SeasonCode | null>(null)
  const [result, setResult] = useState<{ season: SeasonCode; skinHex: string } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('season')
        .eq('id', user.id)
        .single()

      if (data?.season) setCurrentSeason(data.season as SeasonCode)
    }
    load()
  }, [])

  async function handleResult(season: SeasonCode, skinHex: string) {
    setResult({ season, skinHex })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({ season }).eq('id', user.id)
  }

  if (!currentSeason) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen px-6 text-center">
          <div>
            <p className="text-4xl mb-4">🎨</p>
            <p className="text-gray-500 mb-4">Fais d&apos;abord le quiz avant d&apos;uploader une photo.</p>
            <a href="/quiz" className="px-6 py-3 bg-black text-white rounded-xl font-medium">Faire le quiz →</a>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const season = result ? getSeasonByCode(result.season) : getSeasonByCode(currentSeason)
  const changed = result && result.season !== currentSeason

  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Affine avec une photo</h1>
        <p className="text-gray-500 mb-8">Upload un selfie en lumière naturelle pour affiner ton résultat.</p>

        <PhotoAnalyzer currentSeason={currentSeason} onResult={handleResult} />

        {result && (
          <div className="mt-8">
            <div className={`p-6 rounded-2xl text-center ${changed ? 'bg-purple-50' : 'bg-green-50'}`}>
              <span className="text-4xl">{season.emoji}</span>
              <h2 className="text-2xl font-bold mt-2">{season.name}</h2>
              <p className="text-gray-500 mt-1">
                {changed
                  ? '✨ Ta saison a été ajustée grâce à la photo !'
                  : '✅ La photo confirme ton résultat du quiz.'}
              </p>
            </div>
            <button
              onClick={() => router.push('/avatar')}
              className="w-full mt-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Essayer l&apos;avatar →
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
