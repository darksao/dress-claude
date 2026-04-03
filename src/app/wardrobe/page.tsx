'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import AuthGuard from '@/components/layout/AuthGuard'
import { SeasonCode, SeasonPalette } from '@/types'

type ZoneId = 'hair' | 'top' | 'bottom' | 'shoes' | 'accessories'

const ZONES: { id: ZoneId; label: string; icon: string }[] = [
  { id: 'hair', label: 'Cheveux', icon: '💇' },
  { id: 'top', label: 'Haut', icon: '👕' },
  { id: 'bottom', label: 'Bas', icon: '👖' },
  { id: 'shoes', label: 'Chaussures', icon: '👟' },
  { id: 'accessories', label: 'Accessoires', icon: '👜' },
]

type Outfit = Record<ZoneId, string>

const DEFAULT_OUTFIT: Outfit = {
  hair: '#5C4033',
  top: '#B8D4E3',
  bottom: '#2C3E6B',
  shoes: '#8D5524',
  accessories: '#DAA520',
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [h, s, l]
}

function suggest(zone: ZoneId, color: string, season: SeasonPalette): Partial<Outfit> {
  const palette = season.colors
  const hair = season.hairColors
  const [h, , l] = hexToHsl(color)
  const compHue = (h + 180) % 360

  function closest(targetHue: number, pool: string[], exclude: string[] = []) {
    return pool
      .filter(c => !exclude.includes(c) && hexToHsl(c)[1] > 0.1)
      .sort((a, b) => {
        const da = Math.min(Math.abs(hexToHsl(a)[0] - targetHue), 360 - Math.abs(hexToHsl(a)[0] - targetHue))
        const db = Math.min(Math.abs(hexToHsl(b)[0] - targetHue), 360 - Math.abs(hexToHsl(b)[0] - targetHue))
        return da - db
      })[0] ?? palette[0]
  }

  function neutral(lightness: 'light' | 'dark') {
    return palette.filter(c => hexToHsl(c)[1] < 0.2).sort((a, b) => {
      const la = hexToHsl(a)[2], lb = hexToHsl(b)[2]
      return lightness === 'light' ? lb - la : la - lb
    })[0] ?? (lightness === 'dark' ? '#333333' : '#F5F5F5')
  }

  const suggestions: Partial<Outfit> = {}
  const dark = neutral('dark')
  const light = neutral('light')
  const comp = closest(compHue, palette, [color])
  const ana = closest((h + 40) % 360, palette, [color])

  if (zone !== 'hair') suggestions.hair = hair[0] ?? '#5C4033'
  if (zone !== 'top') suggestions.top = zone === 'bottom' ? comp : ana
  if (zone !== 'bottom') suggestions.bottom = dark
  if (zone !== 'shoes') suggestions.shoes = l > 0.5 ? dark : light
  if (zone !== 'accessories') suggestions.accessories = comp

  return suggestions
}

export default function WardrobePage() {
  const [season, setSeason] = useState<SeasonPalette | null>(null)
  const [outfit, setOutfit] = useState<Outfit>(DEFAULT_OUTFIT)
  const [selectedZone, setSelectedZone] = useState<ZoneId | null>(null)
  const [locked, setLocked] = useState<Set<ZoneId>>(new Set())
  const [savedOutfits, setSavedOutfits] = useState<{ id: string; outfit: Outfit; name?: string }[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Load season
      const stored = localStorage.getItem('dc_quiz')
      let seasonCode: SeasonCode | null = null

      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.season) seasonCode = parsed.season as SeasonCode
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && !seasonCode) {
        const { data } = await supabase.from('profiles').select('season').eq('id', user.id).single()
        if (data?.season) seasonCode = data.season as SeasonCode
      }

      if (seasonCode) {
        const s = getSeasonByCode(seasonCode)
        setSeason(s)
        setOutfit(prev => ({
          ...prev,
          hair: s.hairColors[0] ?? prev.hair,
          top: s.colors[0] ?? prev.top,
          bottom: s.colors[5] ?? prev.bottom,
          shoes: s.colors[10] ?? prev.shoes,
          accessories: s.colors[3] ?? prev.accessories,
        }))
      }

      if (user) {
        const { data } = await supabase.from('outfits').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (data) {
          setSavedOutfits(data.map((o: Record<string, string>) => ({
            id: o.id,
            name: o.name,
            outfit: { hair: o.hair_color, top: o.top_color, bottom: o.bottom_color, shoes: o.shoes_color, accessories: o.accessories_color ?? o.shoes_color },
          })))
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  function toggleLock(zone: ZoneId) {
    setLocked(prev => {
      const next = new Set(prev)
      next.has(zone) ? next.delete(zone) : next.add(zone)
      return next
    })
  }

  function pickHarmonious(pool: string[], refColor: string, strategy: 'complement' | 'analogue' | 'neutral'): string {
    const [rH] = hexToHsl(refColor)
    if (strategy === 'neutral') {
      const neutrals = pool.filter(c => hexToHsl(c)[1] < 0.25)
      if (neutrals.length > 0) return neutrals[Math.floor(Math.random() * neutrals.length)]
    }
    const targetHue = strategy === 'complement'
      ? (rH + 180) % 360
      : (rH + 30 + Math.random() * 60) % 360
    // Score with a randomness factor so results vary each time
    const scored = pool.map(c => {
      const [h] = hexToHsl(c)
      const d = Math.min(Math.abs(h - targetHue), 360 - Math.abs(h - targetHue))
      return { c, score: d + Math.random() * 50 }
    })
    return scored.sort((a, b) => a.score - b.score)[0].c
  }

  function generateRandom() {
    if (!season) return

    const lockedZones = ZONES.filter(z => locked.has(z.id))

    if (lockedZones.length === 0) {
      // No constraints — pure random from palette
      const pick = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)]
      setOutfit(prev => ({
        hair: pick(season.hairColors),
        top: pick(season.colors),
        bottom: pick(season.colors),
        shoes: pick(season.colors),
        accessories: pick(season.colors),
      }))
      setSelectedZone(null)
      return
    }

    // Pick the most visually impactful locked zone as reference
    const priority: ZoneId[] = ['top', 'hair', 'bottom', 'shoes', 'accessories']
    const refZone = priority.find(z => locked.has(z)) ?? lockedZones[0].id
    const refColor = outfit[refZone]

    setOutfit(prev => {
      const next = { ...prev }
      for (const z of ZONES) {
        if (locked.has(z.id)) continue
        const pool = z.id === 'hair' ? season.hairColors : season.colors
        if (z.id === 'bottom' || z.id === 'shoes') {
          // Grounding zones → neutral tones that go with everything
          next[z.id] = pickHarmonious(pool, refColor, 'neutral')
        } else {
          // Accent zones → complement or analogue, randomised each call
          next[z.id] = pickHarmonious(pool, refColor, Math.random() > 0.5 ? 'complement' : 'analogue')
        }
      }
      return next
    })
    setSelectedZone(null)
  }

  function showNotif(msg: string) {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  function handleColorPick(color: string) {
    if (!selectedZone || !season) return
    const suggestions = suggest(selectedZone, color, season)
    setOutfit(prev => ({ ...prev, [selectedZone]: color, ...suggestions }))
    setSelectedZone(null)
  }

  async function handleSave() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showNotif('Connecte-toi pour sauvegarder 🔒'); return }

    const { data } = await supabase.from('outfits').insert({
      user_id: user.id,
      hair_color: outfit.hair,
      top_color: outfit.top,
      bottom_color: outfit.bottom,
      shoes_color: outfit.shoes,
      accessories_color: outfit.accessories,
    }).select().single()

    if (data) {
      setSavedOutfits(prev => [{ id: data.id, outfit }, ...prev])
      showNotif('Tenue sauvegardée !')
    }
  }

  const paletteColors = selectedZone && season
    ? selectedZone === 'hair' ? season.hairColors : season.colors
    : []

  if (loading) return (
    <AuthGuard>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    </AuthGuard>
  )

  if (!season) return (
    <AuthGuard>
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <p className="text-4xl mb-4">🎨</p>
        <p className="text-gray-500 mb-6">Fais d&apos;abord le quiz ou uploade une photo pour obtenir ta palette.</p>
        <a href="/quiz" className="px-6 py-3 bg-black text-white rounded-xl font-medium">Faire le quiz →</a>
      </div>
    </AuthGuard>
  )

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium">
            {notification}
          </div>
        )}

        {/* Season badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{season.emoji}</span>
          <div>
            <p className="font-bold text-lg">{season.name}</p>
            <p className="text-xs text-gray-400">Clique une zone pour changer sa couleur</p>
          </div>
        </div>

        {/* Outfit zones */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {ZONES.map(z => (
            <div key={z.id} className="relative">
              <button
                onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all w-full ${selectedZone === z.id ? 'border-black bg-gray-50 scale-105' : locked.has(z.id) ? 'border-amber-300 bg-amber-50' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: outfit[z.id] }} />
                <span className="text-lg">{z.icon}</span>
                <span className="text-xs text-gray-500 font-medium">{z.label}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLock(z.id) }}
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border transition-all ${locked.has(z.id) ? 'bg-amber-400 border-amber-500 text-white' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400'}`}
                title={locked.has(z.id) ? 'Déverrouiller' : 'Verrouiller'}
              >
                {locked.has(z.id) ? '🔒' : '🔓'}
              </button>
            </div>
          ))}
        </div>

        {/* Generate button */}
        <button
          onClick={generateRandom}
          className="w-full py-3 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          🎲 Générer une tenue aléatoire
          {locked.size > 0 && <span className="text-xs opacity-80">({locked.size} verrouillé{locked.size > 1 ? 's' : ''})</span>}
        </button>

        {/* Color palette */}
        {selectedZone && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
              Palette {ZONES.find(z => z.id === selectedZone)?.label} — {season.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {paletteColors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => handleColorPick(color)}
                  className={`w-10 h-10 rounded-xl border-4 transition-all hover:scale-110 ${outfit[selectedZone] === color ? 'border-black scale-110' : 'border-white shadow-sm'}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Sélectionne une couleur → les autres zones seront automatiquement suggérées
            </p>
          </div>
        )}

        {/* Outfit preview */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Aperçu de la tenue</p>
          <div className="flex gap-3 items-end">
            {ZONES.map(z => (
              <div key={z.id} className="flex flex-col items-center gap-1">
                <div className="rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: outfit[z.id], width: z.id === 'accessories' ? 28 : 40, height: z.id === 'accessories' ? 28 : 40 }} />
                <span className="text-[10px] text-gray-400">{z.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors mb-10">
          💾 Sauvegarder cette tenue
        </button>

        {/* Saved outfits */}
        {savedOutfits.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Tenues sauvegardées</h2>
            <div className="space-y-3">
              {savedOutfits.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setOutfit(s.outfit); setSelectedZone(null) }}
                  className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-all text-left"
                >
                  <div className="flex gap-1">
                    {ZONES.map(z => (
                      <div key={z.id} className="w-7 h-7 rounded-lg border border-white shadow-sm" style={{ backgroundColor: s.outfit[z.id] }} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Cliquer pour charger</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
