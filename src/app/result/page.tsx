'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import { SeasonCode } from '@/types'
import AuthGuard from '@/components/layout/AuthGuard'

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

function colorDistance(a: string, b: string): number {
  const [h1, s1, l1] = hexToHsl(a)
  const [h2, s2, l2] = hexToHsl(b)
  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180
  return Math.sqrt(dh * dh + (s1 - s2) ** 2 + (l1 - l2) ** 2)
}

function getSuggestions(selected: string, palette: string[]) {
  const [h, s, l] = hexToHsl(selected)
  const others = palette.filter(c => c !== selected)

  // Neutre : faible saturation
  const neutrals = others
    .filter(c => hexToHsl(c)[1] < 0.3)
    .sort((a, b) => colorDistance(selected, a) - colorDistance(selected, b))
    .slice(0, 2)

  // Analogues : teinte proche
  const analogues = others
    .filter(c => {
      const dh = Math.min(Math.abs(hexToHsl(c)[0] - h), 360 - Math.abs(hexToHsl(c)[0] - h))
      return dh < 60 && !neutrals.includes(c)
    })
    .slice(0, 2)

  // Contrastes : luminosité opposée
  const contrasts = others
    .filter(c => Math.abs(hexToHsl(c)[2] - l) > 0.3 && !neutrals.includes(c) && !analogues.includes(c))
    .slice(0, 2)

  return { neutrals, analogues, contrasts }
}

function ResultContent() {
  const searchParams = useSearchParams()
  const seasonCode = searchParams.get('season') as SeasonCode
  const confidence = searchParams.get('confidence')
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (seasonCode) {
      const stored = localStorage.getItem('dc_quiz')
      const existing = stored ? JSON.parse(stored) : {}
      localStorage.setItem('dc_quiz', JSON.stringify({ ...existing, season: seasonCode }))
    }
  }, [seasonCode])

  if (!seasonCode) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">Aucun résultat trouvé.</p>
      <Link href="/quiz" className="px-6 py-3 bg-black text-white rounded-xl font-medium">Faire le quiz →</Link>
    </div>
  )

  const season = getSeasonByCode(seasonCode)
  const suggestions = selected ? getSuggestions(selected, season.colors) : null

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      {/* Season header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-8 text-center mb-8">
        <span className="text-5xl">{season.emoji}</span>
        <h1 className="text-3xl font-bold mt-4">{season.name}</h1>
        <p className="mt-2 text-gray-300">{season.description}</p>
        {confidence === 'medium' && (
          <p className="mt-3 text-xs text-gray-400 bg-white/10 rounded-full px-3 py-1 inline-block">
            Confiance moyenne — <Link href="/quiz/photo" className="underline">affine avec une photo</Link>
          </p>
        )}
      </div>

      {/* Palette interactive */}
      <h2 className="text-xl font-bold mb-2">Ta palette idéale</h2>
      <p className="text-sm text-gray-400 mb-4">Clique sur une couleur pour voir ce qui va avec.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {season.colors.map((color, i) => (
          <button
            key={i}
            onClick={() => setSelected(selected === color ? null : color)}
            className={`w-11 h-11 rounded-xl border-4 transition-all shadow-sm ${selected === color ? 'border-black scale-110' : 'border-white hover:scale-105'}`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Combinaisons suggérées */}
      {selected && suggestions && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0" style={{ backgroundColor: selected }} />
            <div>
              <p className="font-semibold text-gray-900">Couleur sélectionnée</p>
              <p className="text-xs text-gray-400 font-mono">{selected}</p>
            </div>
            <button onClick={() => setSelected(null)} className="ml-auto text-gray-300 hover:text-gray-500 text-xl">×</button>
          </div>

          {suggestions.neutrals.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Neutrals — base de la tenue</p>
              <div className="flex gap-2">
                {suggestions.neutrals.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg border border-gray-100" style={{ backgroundColor: c }} />
                    <span className="text-xs text-gray-400 font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.analogues.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Teintes proches — harmonie douce</p>
              <div className="flex gap-2">
                {suggestions.analogues.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg border border-gray-100" style={{ backgroundColor: c }} />
                    <span className="text-xs text-gray-400 font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.contrasts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Contrastes — look dynamique</p>
              <div className="flex gap-2">
                {suggestions.contrasts.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg border border-gray-100" style={{ backgroundColor: c }} />
                    <span className="text-xs text-gray-400 font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Couleurs à éviter */}
      <h2 className="text-xl font-bold mb-4">Couleurs à éviter</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {season.avoid.map((color, i) => (
          <div key={i} className="relative">
            <div className="w-11 h-11 rounded-xl border border-gray-100 opacity-50" style={{ backgroundColor: color }} />
            <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold">✕</span>
          </div>
        ))}
      </div>

      <Link href="/quiz/photo" className="block w-full py-3 text-center border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        📸 Affiner avec une photo
      </Link>
    </div>
  )
}

export default function ResultPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
        <ResultContent />
      </Suspense>
    </AuthGuard>
  )
}
