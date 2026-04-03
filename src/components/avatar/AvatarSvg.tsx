'use client'

import Image from 'next/image'
import { AvatarState, AvatarZoneId, Gender } from '@/types'

interface AvatarSvgProps {
  state: AvatarState
  skinTone: string
  gender: Gender
  selectedZone: AvatarZoneId | null
  onZoneClick: (zone: AvatarZoneId) => void
}

const ZONE_LABELS: Record<AvatarZoneId, string> = {
  hair: 'Cheveux',
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
}

export default function AvatarSvg({ state, selectedZone, onZoneClick }: AvatarSvgProps) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto select-none">
      <Image
        src="/avatar-nano-banana.png"
        alt="Avatar"
        width={280}
        height={280}
        className="w-full h-auto"
        priority
      />
      <svg
        viewBox="0 0 280 280"
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        {/* HAIR */}
        <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('hair')}>
          <ellipse cx="140" cy="55" rx="44" ry="28"
            fill={state.hair}
            opacity={selectedZone === 'hair' ? 0.55 : 0.28}
            stroke={selectedZone === 'hair' ? 'white' : 'transparent'}
            strokeWidth="1.5"
          />
          {selectedZone === 'hair' && <ZoneLabel cx={140} cy={55} label={ZONE_LABELS.hair} />}
          {selectedZone !== 'hair' && <ZoneHint cx={140} cy={55} />}
        </g>

        {/* TOP */}
        <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('top')}>
          <path
            d="M72 98 Q72 90 82 88 L140 84 L198 88 Q208 90 208 98 L212 162 Q140 168 68 162 Z"
            fill={state.top}
            opacity={selectedZone === 'top' ? 0.55 : 0.28}
            stroke={selectedZone === 'top' ? 'white' : 'transparent'}
            strokeWidth="1.5"
          />
          {selectedZone === 'top' && <ZoneLabel cx={140} cy={126} label={ZONE_LABELS.top} />}
          {selectedZone !== 'top' && <ZoneHint cx={140} cy={126} />}
        </g>

        {/* BOTTOM */}
        <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('bottom')}>
          <path
            d="M80 162 L68 162 L62 228 L116 230 L140 200 L164 230 L218 228 L212 162 L200 162 Z"
            fill={state.bottom}
            opacity={selectedZone === 'bottom' ? 0.55 : 0.28}
            stroke={selectedZone === 'bottom' ? 'white' : 'transparent'}
            strokeWidth="1.5"
          />
          {selectedZone === 'bottom' && <ZoneLabel cx={140} cy={196} label={ZONE_LABELS.bottom} />}
          {selectedZone !== 'bottom' && <ZoneHint cx={140} cy={196} />}
        </g>

        {/* SHOES */}
        <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('shoes')}>
          <ellipse cx="108" cy="244" rx="34" ry="12"
            fill={state.shoes}
            opacity={selectedZone === 'shoes' ? 0.6 : 0.3}
            stroke={selectedZone === 'shoes' ? 'white' : 'transparent'}
            strokeWidth="1.5"
          />
          <ellipse cx="172" cy="244" rx="34" ry="12"
            fill={state.shoes}
            opacity={selectedZone === 'shoes' ? 0.6 : 0.3}
            stroke={selectedZone === 'shoes' ? 'white' : 'transparent'}
            strokeWidth="1.5"
          />
          {selectedZone === 'shoes' && <ZoneLabel cx={140} cy={244} label={ZONE_LABELS.shoes} />}
          {selectedZone !== 'shoes' && <ZoneHint cx={140} cy={244} />}
        </g>
      </svg>
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
  return <circle cx={cx} cy={cy} r={6} fill="white" opacity={0.35} />
}
