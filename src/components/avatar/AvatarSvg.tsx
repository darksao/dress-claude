'use client'

import { AvatarState, AvatarZoneId, Gender } from '@/types'
import AvatarZone from './AvatarZone'

interface AvatarSvgProps {
  state: AvatarState
  skinTone: string
  gender: Gender
  selectedZone: AvatarZoneId | null
  onZoneClick: (zone: AvatarZoneId) => void
}

export default function AvatarSvg({ state, skinTone, selectedZone, onZoneClick }: AvatarSvgProps) {
  const skin = skinTone || '#D4A574'

  return (
    <svg viewBox="0 0 220 440" className="w-full max-w-[220px] mx-auto">
      {/* Shadow */}
      <ellipse cx="110" cy="430" rx="50" ry="8" fill="rgba(0,0,0,0.06)" />

      {/* Hair zone */}
      <AvatarZone id="hair" isSelected={selectedZone === 'hair'} onClick={() => onZoneClick('hair')}>
        <path d="M74 45 Q70 15 90 8 Q110 2 130 8 Q150 15 146 45 Q148 30 152 42 L152 60 Q155 70 148 75 L142 60" fill={state.hair} />
        <path d="M74 45 L70 60 Q66 70 72 75 L78 60" fill={state.hair} />
        {selectedZone === 'hair' && (
          <rect x="82" y="5" width="56" height="18" rx="9" fill="rgba(0,0,0,0.6)" />
        )}
        {selectedZone === 'hair' && (
          <text x="110" y="17" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui">CHEVEUX ✏️</text>
        )}
      </AvatarZone>

      {/* Head */}
      <ellipse cx="110" cy="58" rx="32" ry="38" fill={skin} />
      <path d="M78 55 Q78 90 110 98 Q142 90 142 55" fill={skin} />

      {/* Ears */}
      <ellipse cx="76" cy="58" rx="5" ry="8" fill={skin} />
      <ellipse cx="144" cy="58" rx="5" ry="8" fill={skin} />

      {/* Eyes */}
      <ellipse cx="96" cy="55" rx="6" ry="5" fill="white" />
      <ellipse cx="124" cy="55" rx="6" ry="5" fill="white" />
      <circle cx="97" cy="55" r="3.5" fill="#3D2B1F" />
      <circle cx="125" cy="55" r="3.5" fill="#3D2B1F" />
      <circle cx="99" cy="53" r="1" fill="white" />
      <circle cx="127" cy="53" r="1" fill="white" />

      {/* Eyebrows */}
      <path d="M88 45 Q95 41 103 44" stroke={state.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M117 44 Q125 41 132 45" stroke={state.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nose */}
      <path d="M107 58 Q109 67 107 71 Q105 74 110 75 Q115 74 113 71" stroke={skin} strokeWidth="1.2" fill="none" opacity="0.5" />

      {/* Mouth */}
      <path d="M100 82 Q110 89 120 82" stroke="#C27070" strokeWidth="2" fill="#D4878F" />

      {/* Neck */}
      <rect x="98" y="94" width="24" height="16" rx="8" fill={skin} />

      {/* Top zone */}
      <AvatarZone id="top" isSelected={selectedZone === 'top'} onClick={() => onZoneClick('top')}>
        <path
          d="M72 110 Q65 108 55 115 L38 135 L50 143 L68 126 L68 210 Q68 215 73 215 L147 215 Q152 215 152 210 L152 126 L170 143 L182 135 L165 115 Q155 108 148 110 L135 107 Q120 102 110 102 Q100 102 85 107 Z"
          fill={state.top}
        />
        <path d="M92 102 Q100 108 110 102 Q120 108 128 102" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />
        {selectedZone === 'top' && (
          <rect x="82" y="155" width="56" height="18" rx="9" fill="rgba(0,0,0,0.6)" />
        )}
        {selectedZone === 'top' && (
          <text x="110" y="167" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui">HAUT ✏️</text>
        )}
      </AvatarZone>

      {/* Hands */}
      <circle cx="38" cy="138" r="8" fill={skin} />
      <circle cx="182" cy="138" r="8" fill={skin} />

      {/* Bottom zone */}
      <AvatarZone id="bottom" isSelected={selectedZone === 'bottom'} onClick={() => onZoneClick('bottom')}>
        <path d="M72 215 L68 335 Q68 340 75 340 L105 340 Q108 340 108 335 L105 215 Z" fill={state.bottom} />
        <path d="M115 215 L112 335 Q112 340 118 340 L145 340 Q152 340 152 335 L148 215 Z" fill={state.bottom} />
        <line x1="88" y1="220" x2="86" y2="335" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
        <line x1="132" y1="220" x2="130" y2="335" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
        {selectedZone === 'bottom' && (
          <rect x="82" y="268" width="56" height="18" rx="9" fill="rgba(0,0,0,0.6)" />
        )}
        {selectedZone === 'bottom' && (
          <text x="110" y="280" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui">BAS ✏️</text>
        )}
      </AvatarZone>

      {/* Shoes zone */}
      <AvatarZone id="shoes" isSelected={selectedZone === 'shoes'} onClick={() => onZoneClick('shoes')}>
        <path d="M60 336 L108 336 Q113 336 113 341 L113 352 Q113 358 108 358 L65 358 Q60 358 60 352 Z" fill={state.shoes} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <path d="M107 336 L152 336 Q157 336 157 341 L157 352 Q157 358 152 358 L112 358 Q107 358 107 352 Z" fill={state.shoes} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        {selectedZone === 'shoes' && (
          <rect x="82" y="343" width="56" height="14" rx="7" fill="rgba(0,0,0,0.6)" />
        )}
        {selectedZone === 'shoes' && (
          <text x="110" y="353" textAnchor="middle" fontSize="8" fill="white" fontFamily="system-ui">SHOES ✏️</text>
        )}
      </AvatarZone>
    </svg>
  )
}
