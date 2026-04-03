'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { extractColorsFromImage, determineSeasonFromPhoto, refineSeasonFromPhoto } from '@/lib/colorimetry/photo-analysis'
import AuthGuard from '@/components/layout/AuthGuard'
import { SeasonCode } from '@/types'

export default function PhotoPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const src = ev.target?.result as string
      setPreview(src)

      const img = new Image()
      img.onload = async () => {
        const canvas = canvasRef.current!
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext('2d')!.drawImage(img, 0, 0)

        setAnalyzing(true)
        setTimeout(async () => {
          const extracted = extractColorsFromImage(canvas)

          // Check if user already has a season from quiz
          const stored = localStorage.getItem('dc_quiz')
          let season: SeasonCode

          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed.season) {
              const refined = refineSeasonFromPhoto(parsed.season as SeasonCode, extracted)
              season = refined.season
            } else {
              season = determineSeasonFromPhoto(extracted).season
            }
          } else {
            season = determineSeasonFromPhoto(extracted).season
          }

          // Save to localStorage
          const existing = stored ? JSON.parse(stored) : {}
          localStorage.setItem('dc_quiz', JSON.stringify({ ...existing, season }))

          // Save to Supabase if logged in
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) await supabase.from('profiles').update({ season }).eq('id', user.id)

          setAnalyzing(false)
          router.push(`/result?season=${season}&confidence=medium`)
        }, 1500)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Trouve ta saison par photo</h1>
        <p className="text-gray-500 mb-2">Upload un selfie en lumière naturelle.</p>
        <p className="text-xs text-gray-400 mb-8">Sans maquillage · Cheveux visibles · Fond neutre de préférence</p>

        <canvas ref={canvasRef} className="hidden" />

        {!preview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-20 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-purple-300 hover:bg-purple-50 transition-colors bg-white"
          >
            <span className="text-5xl block mb-4">📸</span>
            <span className="text-gray-700 block font-medium text-lg">Clique pour uploader un selfie</span>
            <span className="text-xs text-gray-400 mt-2 block">JPG, PNG — depuis ta galerie ou caméra</span>
          </button>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selfie" className="w-full max-w-sm mx-auto rounded-2xl" />
            {analyzing && (
              <div className="absolute inset-0 bg-white/85 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4" />
                  <p className="font-medium text-gray-700">Analyse des couleurs en cours...</p>
                  <p className="text-xs text-gray-400 mt-1">Détection du teint et des sous-tons</p>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview && !analyzing && (
          <button
            onClick={() => { setPreview(null) }}
            className="w-full mt-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Changer de photo
          </button>
        )}
      </div>
    </AuthGuard>
  )
}
