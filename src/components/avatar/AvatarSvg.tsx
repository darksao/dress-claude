'use client'

import { useEffect, useRef, useCallback } from 'react'
import { AvatarState, AvatarZoneId, Gender } from '@/types'

interface AvatarSvgProps {
  state: AvatarState
  selectedZone: AvatarZoneId | null
  onZoneClick: (zone: AvatarZoneId) => void
}

const ZONE_LABELS: Record<AvatarZoneId, string> = {
  hair: 'Cheveux',
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
}

// HSL ranges for zone classification
const ZONE_HSL: Record<AvatarZoneId, { hMin: number; hMax: number; sMin: number; sMax: number; lMin: number; lMax: number }> = {
  hair:   { hMin: 20,  hMax: 40,  sMin: 0.30, sMax: 0.65, lMin: 0.28, lMax: 0.52 },
  top:    { hMin: 195, hMax: 225, sMin: 0.15, sMax: 0.45, lMin: 0.35, lMax: 0.58 },
  bottom: { hMin: 25,  hMax: 45,  sMin: 0.30, sMax: 0.60, lMin: 0.55, lMax: 0.78 },
  shoes:  { hMin: 15,  hMax: 35,  sMin: 0.20, sMax: 0.55, lMin: 0.18, lMax: 0.36 },
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h * 360, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return rgbToHsl(r, g, b)
}

function classifyPixel(r: number, g: number, b: number, a: number): AvatarZoneId | null {
  if (a < 100) return null
  const [h, s, l] = rgbToHsl(r, g, b)
  // Exclude background (very light)
  if (l > 0.92) return null
  // Exclude skin (warm hue, moderate sat, high lightness)
  if (h >= 15 && h <= 35 && s > 0.25 && l > 0.65) return null

  for (const [zone, range] of Object.entries(ZONE_HSL) as [AvatarZoneId, typeof ZONE_HSL[AvatarZoneId]][]) {
    if (h >= range.hMin && h <= range.hMax && s >= range.sMin && s <= range.sMax && l >= range.lMin && l <= range.lMax) {
      return zone
    }
  }
  return null
}

export default function AvatarSvg({ state, selectedZone, onZoneClick }: AvatarSvgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalPixelsRef = useRef<Uint8ClampedArray | null>(null)
  const zoneMaskRef = useRef<(AvatarZoneId | null)[] | null>(null)
  const imgSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 })

  const renderCanvas = useCallback((
    ctx: CanvasRenderingContext2D,
    original: Uint8ClampedArray,
    mask: (AvatarZoneId | null)[],
    currentState: AvatarState,
    w: number,
    h: number
  ) => {
    const output = new Uint8ClampedArray(original)
    const hslCache: Partial<Record<AvatarZoneId, [number, number, number]>> = {}

    for (let i = 0; i < mask.length; i++) {
      const zone = mask[i]
      if (!zone) continue
      const colorHex = currentState[zone]
      if (!colorHex) continue

      if (!hslCache[zone]) hslCache[zone] = hexToHsl(colorHex)
      const [hNew, sNew] = hslCache[zone]!

      const pi = i * 4
      const [, , lOrig] = rgbToHsl(original[pi], original[pi + 1], original[pi + 2])
      const [r, g, b] = hslToRgb(hNew, sNew, lOrig)
      output[pi] = r
      output[pi + 1] = g
      output[pi + 2] = b
      output[pi + 3] = original[pi + 3]
    }

    const imageData = new ImageData(output, w, h)
    ctx.putImageData(imageData, 0, 0)
  }, [])

  // Load image, compute original pixels and zone mask
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      imgSizeRef.current = { w: img.naturalWidth, h: img.naturalHeight }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
      originalPixelsRef.current = new Uint8ClampedArray(imageData.data)

      const mask: (AvatarZoneId | null)[] = new Array(img.naturalWidth * img.naturalHeight).fill(null)
      for (let i = 0; i < imageData.data.length; i += 4) {
        mask[i / 4] = classifyPixel(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3])
      }
      zoneMaskRef.current = mask

      renderCanvas(ctx, imageData.data, mask, state, img.naturalWidth, img.naturalHeight)
    }
    img.src = '/avatar-nano-banana.png'
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render when state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !originalPixelsRef.current || !zoneMaskRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = imgSizeRef.current
    renderCanvas(ctx, originalPixelsRef.current, zoneMaskRef.current, state, w, h)
  }, [state, renderCanvas])

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <svg
          viewBox="0 0 280 280"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          {/* HAIR */}
          <g style={{ cursor: 'pointer' }} onClick={() => onZoneClick('hair')}>
            <ellipse cx="140" cy="58" rx="46" ry="30" fill="transparent" stroke={selectedZone === 'hair' ? 'white' : 'transparent'} strokeWidth="2" />
            {selectedZone === 'hair' && <ZoneLabel cx={140} cy={58} label={ZONE_LABELS.hair} />}
            {selectedZone !== 'hair' && <ZoneHint cx={140} cy={58} />}
          </g>

          {/* TOP */}
          <g style={{ cursor: 'pointer' }} onClick={() => onZoneClick('top')}>
            <path d="M68 102 Q68 92 80 90 L140 86 L200 90 Q212 92 212 102 L216 168 Q140 174 64 168 Z" fill="transparent" stroke={selectedZone === 'top' ? 'white' : 'transparent'} strokeWidth="2" />
            {selectedZone === 'top' && <ZoneLabel cx={140} cy={130} label={ZONE_LABELS.top} />}
            {selectedZone !== 'top' && <ZoneHint cx={140} cy={130} />}
          </g>

          {/* BOTTOM */}
          <g style={{ cursor: 'pointer' }} onClick={() => onZoneClick('bottom')}>
            <path d="M76 168 L64 168 L58 236 L118 238 L140 206 L162 238 L222 236 L216 168 L204 168 Z" fill="transparent" stroke={selectedZone === 'bottom' ? 'white' : 'transparent'} strokeWidth="2" />
            {selectedZone === 'bottom' && <ZoneLabel cx={140} cy={202} label={ZONE_LABELS.bottom} />}
            {selectedZone !== 'bottom' && <ZoneHint cx={140} cy={202} />}
          </g>

          {/* SHOES */}
          <g style={{ cursor: 'pointer' }} onClick={() => onZoneClick('shoes')}>
            <ellipse cx="104" cy="250" rx="36" ry="13" fill="transparent" stroke={selectedZone === 'shoes' ? 'white' : 'transparent'} strokeWidth="2" />
            <ellipse cx="176" cy="250" rx="36" ry="13" fill="transparent" stroke={selectedZone === 'shoes' ? 'white' : 'transparent'} strokeWidth="2" />
            {selectedZone === 'shoes' && <ZoneLabel cx={140} cy={250} label={ZONE_LABELS.shoes} />}
            {selectedZone !== 'shoes' && <ZoneHint cx={140} cy={250} />}
          </g>
        </svg>
      </div>
    </div>
  )
}

function ZoneLabel({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  const w = label.length * 7 + 20
  return (
    <g>
      <rect x={cx - w / 2} y={cy - 11} width={w} height={20} rx={10} fill="rgba(0,0,0,0.72)" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="white"
        fontFamily="system-ui, sans-serif" fontWeight="500">
        {label} ✏️
      </text>
    </g>
  )
}

function ZoneHint({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={5} fill="white" opacity={0.4} />
}
