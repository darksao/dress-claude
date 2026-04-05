'use client'

import { useRef, useState } from 'react'
import { SeasonPalette } from '@/types'
import {
  analyzeClothingPhoto,
  ClothingAnalysisResult,
  ClothingRating,
} from '@/lib/colorimetry/clothing-analysis'

interface Props {
  season: SeasonPalette
}

const ZONE_LABELS: Record<string, string> = {
  top: 'Haut',
  middle: 'Milieu',
  bottom: 'Bas',
}

const RATING_CONFIG: Record<ClothingRating, { badge: string; color: string }> = {
  excellente: { badge: '✅ Excellente', color: 'text-green-600' },
  neutre: { badge: '⚪ Neutre', color: 'text-gray-500' },
  'a-eviter': { badge: '❌ À éviter', color: 'text-red-500' },
}

const VERDICT_STYLES: Record<ClothingRating, string> = {
  excellente: 'bg-green-50 text-green-700 border-green-200',
  neutre: 'bg-gray-50 text-gray-600 border-gray-200',
  'a-eviter': 'bg-red-50 text-red-600 border-red-200',
}

const VERDICT_LABELS: Record<ClothingRating, string> = {
  excellente: '✅ Verdict global : Excellente tenue pour ta saison',
  neutre: '⚪ Verdict global : Tenue correcte',
  'a-eviter': '❌ Verdict global : Certaines couleurs sont à éviter',
}

export default function ClothingAnalyzer({ season }: Props) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'vetement' | 'tenue'>('vetement')
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<ClothingAnalysisResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setPreview(src)

      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current!
        canvas.width = img.width
        canvas.height = img.height
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        setResult(analyzeClothingPhoto(canvas, mode, season))
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  function handleReset() {
    setPreview(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleModeChange(newMode: 'vetement' | 'tenue') {
    setMode(newMode)
    setResult(null)
    if (preview && canvasRef.current) {
      setResult(analyzeClothingPhoto(canvasRef.current, newMode, season))
    }
  }

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-sm">📸 Analyser une photo</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            {(['vetement', 'tenue'] as const).map(m => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                  mode === m
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {m === 'vetement' ? '👕 Vêtement' : '🧍 Tenue'}
              </button>
            ))}
          </div>

          {/* Upload zone */}
          {!preview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-10 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-gray-300 transition-colors bg-white"
            >
              <span className="text-3xl block mb-2">📂</span>
              <span className="text-sm text-gray-500 font-medium">
                Clique pour choisir une photo
              </span>
              <span className="text-xs text-gray-400 block mt-1">
                {mode === 'vetement'
                  ? 'Idéal : fond uni, un seul vêtement'
                  : 'Idéal : tenue complète de haut en bas'}
              </span>
            </button>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Photo analysée"
                className="w-full max-h-48 object-contain rounded-xl border border-gray-100"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full w-7 h-7 text-xs flex items-center justify-center hover:bg-gray-50 shadow-sm"
                title="Changer la photo"
              >
                ✕
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Results */}
          {result && result.colors.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Résultats</p>
              {result.colors.map((c, i) => {
                const cfg = RATING_CONFIG[c.rating]
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl border-2 border-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      {c.zone && (
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {ZONE_LABELS[c.zone]}
                        </p>
                      )}
                      <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.badge}</p>
                      <p className="text-xs text-gray-400">{c.label}</p>
                    </div>
                  </div>
                )
              })}

              {result.globalVerdict && (
                <div
                  className={`mt-2 px-4 py-3 rounded-xl border text-sm font-medium ${
                    VERDICT_STYLES[result.globalVerdict]
                  }`}
                >
                  {VERDICT_LABELS[result.globalVerdict]}
                </div>
              )}
            </div>
          )}

          {result && result.colors.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">
              Impossible d&apos;extraire les couleurs. Essaie une photo avec plus de contraste.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
