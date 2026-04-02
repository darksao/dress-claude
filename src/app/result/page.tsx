'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import { SeasonCode } from '@/types'
import AuthGuard from '@/components/layout/AuthGuard'
import { Suspense } from 'react'

function ResultContent() {
  const searchParams = useSearchParams()
  const seasonCode = searchParams.get('season') as SeasonCode
  const confidence = searchParams.get('confidence')

  if (!seasonCode) return <p className="p-6 text-gray-500">Aucun résultat trouvé. <Link href="/quiz" className="underline">Refaire le quiz</Link></p>

  const season = getSeasonByCode(seasonCode)

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-8 text-center mb-8">
        <span className="text-5xl">{season.emoji}</span>
        <h1 className="text-3xl font-bold mt-4">{season.name}</h1>
        <p className="mt-2 text-gray-300">{season.description}</p>
        {confidence === 'medium' && (
          <p className="mt-3 text-xs text-gray-400 bg-white/10 rounded-full px-3 py-1 inline-block">
            Confiance moyenne — affine avec une photo
          </p>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Ta palette idéale</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {season.colors.map((color, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg border border-gray-100 shadow-sm"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Couleurs à éviter</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {season.avoid.map((color, i) => (
          <div key={i} className="relative">
            <div
              className="w-10 h-10 rounded-lg border border-gray-100 opacity-50"
              style={{ backgroundColor: color }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-sm">✕</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/quiz/photo"
          className="flex-1 py-3 text-center border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          📸 Affiner avec photo
        </Link>
        <Link
          href="/avatar"
          className="flex-1 py-3 text-center bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          👤 Essayer l&apos;avatar →
        </Link>
      </div>
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
