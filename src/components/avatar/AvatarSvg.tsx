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
    <div style={{ position: 'relative', width: '100%', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
        <Image
          src="/avatar-nano-banana.png"
          alt="Avatar"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
        <svg
          viewBox="0 0 280 280"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {/* HAIR */}
          <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('hair')}>
            <ellipse cx="140" cy="58" rx="46" ry="30"
              fill={state.hair}
              opacity={selectedZone === 'hair' ? 0.5 : 0.22}
              stroke={selectedZone === 'hair' ? 'white' : 'transparent'}
              strokeWidth="2"
            />
            {selectedZone === 'hair' && <ZoneLabel cx={140} cy={58} label={ZONE_LABELS.hair} />}
            {selectedZone !== 'hair' && <ZoneHint cx={140} cy={58} />}
          </g>

          {/* TOP */}
          <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('top')}>
            <path
              d="M68 102 Q68 92 80 90 L140 86 L200 90 Q212 92 212 102 L216 168 Q140 174 64 168 Z"
              fill={state.top}
              opacity={selectedZone === 'top' ? 0.5 : 0.22}
              stroke={selectedZone === 'top' ? 'white' : 'transparent'}
              strokeWidth="2"
            />
            {selectedZone === 'top' && <ZoneLabel cx={140} cy={130} label={ZONE_LABELS.top} />}
            {selectedZone !== 'top' && <ZoneHint cx={140} cy={130} />}
          </g>

          {/* BOTTOM */}
          <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('bottom')}>
            <path
              d="M76 168 L64 168 L58 236 L118 238 L140 206 L162 238 L222 236 L216 168 L204 168 Z"
              fill={state.bottom}
              opacity={selectedZone === 'bottom' ? 0.5 : 0.22}
              stroke={selectedZone === 'bottom' ? 'white' : 'transparent'}
              strokeWidth="2"
            />
            {selectedZone === 'bottom' && <ZoneLabel cx={140} cy={202} label={ZONE_LABELS.bottom} />}
            {selectedZone !== 'bottom' && <ZoneHint cx={140} cy={202} />}
          </g>

          {/* SHOES */}
          <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onClick={() => onZoneClick('shoes')}>
            <ellipse cx="104" cy="250" rx="36" ry="13"
              fill={state.shoes}
              opacity={selectedZone === 'shoes' ? 0.55 : 0.25}
              stroke={selectedZone === 'shoes' ? 'white' : 'transparent'}
              strokeWidth="2"
            />
            <ellipse cx="176" cy="250" rx="36" ry="13"
              fill={state.shoes}
              opacity={selectedZone === 'shoes' ? 0.55 : 0.25}
              stroke={selectedZone === 'shoes' ? 'white' : 'transparent'}
              strokeWidth="2"
            />
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
