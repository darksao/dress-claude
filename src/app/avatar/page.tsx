'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import { suggestOutfits } from '@/lib/colorimetry/color-combinations'
import { recalculateSeasonForHair } from '@/lib/colorimetry/hair-recalculation'
import AuthGuard from '@/components/layout/AuthGuard'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import ColorPicker from '@/components/avatar/ColorPicker'
import { useSearchParams } from 'next/navigation'
import { AvatarState, AvatarZoneId, SeasonCode, Profile, QuizAnswers } from '@/types'

const SKIN_HEX: Record<string, string> = {
  'very-fair': '#FDF3E7',
  'fair': '#F5DEB3',
  'light-medium': '#E8C99A',
  'medium': '#D4A574',
  'tan': '#C08B5C',
  'deep': '#8D5524',
  'very-deep': '#4A2810',
}

const HAIR_HEX: Record<string, string> = {
  'platinum': '#E8E0D0',
  'blonde': '#F5DEB3',
  'light-brown': '#C4A882',
  'medium-brown': '#8B7355',
  'dark-brown': '#5C4033',
  'black': '#1C1C1C',
  'red': '#993333',
  'auburn': '#8B4513',
  'grey': '#9E9E9E',
}

function AvatarContent() {
  const searchParams = useSearchParams()
  const seasonFromUrl = searchParams.get('season') as SeasonCode | null
  const [profile, setProfile] = useState<Profile | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null)
  const [seasonCode, setSeasonCode] = useState<SeasonCode | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState<AvatarZoneId | null>(null)
  const [avatarState, setAvatarState] = useState<AvatarState>({
    hair: '#8B6345',
    top: '#5B7D8F',
    bottom: '#C4A07A',
    shoes: '#5C3D2E',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // URL param takes priority (coming from result page)
        if (seasonFromUrl) {
          setSeasonCode(seasonFromUrl)
        } else {
          const stored = localStorage.getItem('dc_quiz')
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.season) setSeasonCode(parsed.season as SeasonCode)
            if (parsed.answers) setQuizAnswers(parsed.answers as QuizAnswers)
            if (parsed.answers?.hair_color) {
              const raw = parsed.answers.hair_color as string
              const hex = raw.startsWith('custom:') ? raw.replace('custom:', '') : HAIR_HEX[raw]
              if (hex) setAvatarState(prev => ({ ...prev, hair: hex }))
            }
          }
        }
        setDataLoading(false)
        return
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        setProfile(profileData as Profile)
        if (profileData.season) setSeasonCode(profileData.season as SeasonCode)
        else if (seasonFromUrl) setSeasonCode(seasonFromUrl)
        if (profileData.hair_color) {
          const raw = profileData.hair_color as string
          const hex = raw.startsWith('custom:') ? raw.replace('custom:', '') : HAIR_HEX[raw]
          if (hex) setAvatarState(prev => ({ ...prev, hair: hex }))
        }
      }

      // If still no season, use URL param
      if (seasonFromUrl) setSeasonCode(prev => prev ?? seasonFromUrl)

      const { data: quizData } = await supabase.from('quiz_results').select('answers').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single()
      if (quizData) setQuizAnswers(quizData.answers as QuizAnswers)
      setDataLoading(false)
    }
    load()
  }, [])

  function showNotification(msg: string) {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  function handleColorSelect(color: string) {
    if (!selectedZone) return
    setAvatarState(prev => ({ ...prev, [selectedZone]: color }))
    if (selectedZone === 'hair' && quizAnswers) {
      const res = recalculateSeasonForHair(quizAnswers, color)
      if (res.changed) {
        setSeasonCode(res.season)
        showNotification(`Avec cette couleur, ta palette passe à ${getSeasonByCode(res.season).emoji} ${getSeasonByCode(res.season).name}`)
      }
    }
  }

  async function handleSaveOutfit() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showNotification('Connecte-toi pour sauvegarder 🔒'); return }
    await supabase.from('outfits').insert({
      user_id: user.id,
      hair_color: avatarState.hair,
      top_color: avatarState.top,
      bottom_color: avatarState.bottom,
      shoes_color: avatarState.shoes,
    })
    showNotification('Tenue sauvegardée ! 💾')
  }

  const season = seasonCode ? getSeasonByCode(seasonCode) : null
  const colorsForPicker = selectedZone && season ? (selectedZone === 'hair' ? season.hairColors : season.colors) : []
  const suggestions = selectedZone && selectedZone !== 'hair' && season ? suggestOutfits(selectedZone, avatarState[selectedZone], season) : []

  if (dataLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </AuthGuard>
    )
  }

  if (!season) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <p className="text-4xl mb-4">🎨</p>
          <p className="text-gray-500 mb-6">Tu n&apos;as pas encore fait le quiz colorimétrie.</p>
          <a href="/quiz" className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
            Faire le quiz →
          </a>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium">
            {notification}
          </div>
        )}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl px-6 py-4 mb-8 flex items-center gap-4">
          <span className="text-3xl">{season.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Ta saison</p>
            <p className="text-xl font-bold">{season.name}</p>
          </div>
          <a href="/quiz" className="ml-auto text-xs text-gray-400 hover:text-gray-200 underline">Refaire le quiz</a>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 md:w-[280px]">
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-6">
              <AvatarSvg
                state={avatarState}
                selectedZone={selectedZone}
                onZoneClick={setSelectedZone}
              />
              <p className="text-center text-xs text-gray-400 mt-4">Clique sur une zone pour changer sa couleur</p>
            </div>
            <button onClick={handleSaveOutfit} className="w-full mt-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
              💾 Sauvegarder cette tenue
            </button>
          </div>
          <div className="flex-1 space-y-6">
            {selectedZone ? (
              <>
                <ColorPicker zone={selectedZone} colors={colorsForPicker} selectedColor={avatarState[selectedZone]} onColorSelect={handleColorSelect} />
                {suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">💡 Suggestions de tenues</p>
                    <div className="space-y-3">
                      {suggestions.map((s, i) => (
                        <button key={i} onClick={() => setAvatarState(prev => ({ ...prev, top: s.top, bottom: s.bottom, shoes: s.shoes }))} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left">
                          <div className="flex gap-1 flex-shrink-0">
                            <div className="w-8 h-8 rounded-md border border-gray-100" style={{ backgroundColor: s.top }} />
                            <div className="w-8 h-8 rounded-md border border-gray-100" style={{ backgroundColor: s.bottom }} />
                            <div className="w-8 h-8 rounded-md border border-gray-100" style={{ backgroundColor: s.shoes }} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">{s.label}</span>
                            <p className="text-xs text-gray-400">Cliquer pour appliquer</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center text-gray-400">
                <p className="text-5xl mb-3">👈</p>
                <p>Clique sur une zone de l&apos;avatar<br />pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

export default function AvatarPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
      <AvatarContent />
    </Suspense>
  )
}
