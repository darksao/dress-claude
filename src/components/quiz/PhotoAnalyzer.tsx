'use client'

import { useRef, useState } from 'react'
import { extractColorsFromImage, refineSeasonFromPhoto } from '@/lib/colorimetry/photo-analysis'
import { SeasonCode } from '@/types'

interface PhotoAnalyzerProps {
  currentSeason: SeasonCode
  onResult: (season: SeasonCode, skinHex: string) => void
}

export default function PhotoAnalyzer({ currentSeason, onResult }: PhotoAnalyzerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setPreview(src)

      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current!
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        setAnalyzing(true)
        setTimeout(() => {
          const extracted = extractColorsFromImage(canvas)
          const result = refineSeasonFromPhoto(currentSeason, extracted)
          onResult(result.season, extracted.skin)
          setAnalyzing(false)
        }, 1200)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-16 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-gray-300 transition-colors bg-white"
        >
          <span className="text-4xl block mb-3">📸</span>
          <span className="text-gray-500 block font-medium">Clique pour uploader un selfie</span>
          <span className="text-xs text-gray-400 mt-1 block">Lumière naturelle · Sans maquillage · Cheveux visibles</span>
        </button>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selfie" className="w-full max-w-sm mx-auto rounded-2xl" />
          {analyzing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">Analyse des couleurs...</p>
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
    </div>
  )
}
