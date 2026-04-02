'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import { suggestOutfits } from '@/lib/colorimetry/color-combinations'
import { recalculateSeasonForHair } from '@/lib/colorimetry/hair-recalculation'
import AuthGuard from '@/components/layout/AuthGuard'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import ColorPicker from '@/components/avatar/ColorPicker'
import { AvatarState, AvatarZoneId, SeasonCode, Profile, QuizAnswers } from '@/types'

const SKIN_HEX: Record<string, string> = {
  'fair': '#FDEBD0',
  'medium': '#D4A574',
  'deep': '#8D5524',
}

const HAIR_HEX: Record<string, string> = {
  'blonde': '#F5DEB3',
  'light-brown': '#C4A882',
  'medium-brown': '#8B7355',
  'dark-brown': '#5C4033',
  'black': '#1C1C1C',
  'red': '#993333',
}

export default function AvatarPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null)
  const [seasonCode, setSeasonCode] = useState<SeasonCode | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<AvatarZoneId | null>(null)
  const [avatarState, setAvatarState] = useState<AvatarState>({
    hair: '#1C1C1C',
    top: '#B8D4E3',
    bottom: '#2C3E6B',
    shoes: '#FFFFFF',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData as Profile)
        if (profileData.season) setSeasonCode(profileData.season as SeasonCode)
        if (profileData.hair_color && HAIR_HEX[profileData.hair_color]) {
          setAvatarState(prev => ({ ...prev, hair: HAIR_HEX[profileData.hair_color] }))
        }
      }

      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('answers')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (quizData) setQuizAnswers(quizData.answers as QuizAnswers)
    }
    load()
  }, [])

  const season = seasonCode ? getSeasonByCode(seasonCode) : null

  function showNotification(msg: string) {
    setNotification(msg)
    setTimeout(() => setNotification(null), 4000)
  }

  function handleColorSelect(color: string) {
    if (!selectedZone) return
    setAvatarState(prev => ({ ...prev, [selectedZone]: color }))

    if (selectedZone === 'hair' && quizAnswers) {
      const result = recalculateSeasonForHair(quizAnswers, color)
      if (result.changed) {
        setSeasonCode(result.season)
        const newSeason = getSeasonByCode(result.season)
        showNotification(`Avec cette couleur, ta palette passe à ${newSeason.emoji} ${newSeason.name}`)
      }
    }
  }

  async function handleSaveOutfit() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('outfits').insert({
      user_id: user.id,
      hair_color: avatarState.hair,
      top_color: avatarState.top,
      bottom_color: avatarState.bottom,
      shoes_color: avatarState.shoes,
    })

    showNotification('Tenue sauvegardée ! 💾')
  }

  const colorsForPicker = selectedZone && season
    ? selectedZone === 'hair' ? season.hairColors : season.colors
    : []

  const suggestions = selectedZone && selectedZone !== 'hair' && season
    ? suggestOutfits(selectedZone, avatarState[selectedZone], season)
    : []

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
        {/* Notification toast */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium">
            {notification}
          </div>
        )}

        {/* Season badge */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl px-6 py-4 mb-8 flex items-center gap-4">
          <span className="text-3xl">{season.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Ta saison</p>
            <p className="text-xl font-bold">{season.name}</p>
          </div>
          <a href="/quiz" className="ml-auto text-xs text-gray-400 hover:text-gray-200 underline">Refaire le quiz</a>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar column */}
          <div className="flex-shrink-0 md:w-[280px]">
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-6">
              <AvatarSvg
                state={avatarState}
                skinTone={SKIN_HEX[profile?.skin_tone || 'medium']}
                gender={profile?.gender || 'male'}
                selectedZone={selectedZone}
                onZoneClick={setSelectedZone}
              />
              <p className="text-center text-xs text-gray-400 mt-4">
                Clique sur une zone pour changer sa couleur
              </p>
            </div>
            <button
              onClick={handleSaveOutfit}
              className="w-full mt-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              💾 Sauvegarder cette tenue
            </button>
          </div>

          {/* Right panel */}
          <div className="flex-1 space-y-6">
            {selectedZone ? (
              <>
                <ColorPicker
                  zone={selectedZone}
                  colors={colorsForPicker}
                  selectedColor={avatarState[selectedZone]}
                  onColorSelect={handleColorSelect}
                />

                {suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">💡 Suggestions de tenues</p>
                    <div className="space-y-3">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setAvatarState(prev => ({ ...prev, top: s.top, bottom: s.bottom, shoes: s.shoes }))}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left"
                        >
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
