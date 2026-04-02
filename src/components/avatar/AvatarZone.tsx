interface AvatarZoneProps {
  id: string
  isSelected: boolean
  onClick: () => void
  children: React.ReactNode
}

export default function AvatarZone({ id, isSelected, onClick, children }: AvatarZoneProps) {
  return (
    <g
      id={id}
      onClick={onClick}
      className="cursor-pointer"
      style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.4))' : undefined }}
    >
      {children}
    </g>
  )
}
