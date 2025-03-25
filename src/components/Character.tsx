import { TypedStatus, type SpaceSymbol } from 'types'
import './character.css'

export interface CharacterProps {
  char: string
  highlighted: boolean
  typedStatus?: TypedStatus
  spaceSymbol?: SpaceSymbol
}

const statusStyles: Record<TypedStatus, string> = {
  [TypedStatus.MISS]: 'text-red-500',
  [TypedStatus.HIT]: 'text-green-500',
}

export const Character = ({ char, highlighted, typedStatus, spaceSymbol }: CharacterProps) => {
  const statusClass = typedStatus == null ? 'text-black' : statusStyles[typedStatus]

  return (
    <span
      className={`${statusClass} ${highlighted ? 'animate-flash' : ''}`}
      data-testid="character"
    >
      {char === ' ' && spaceSymbol ? spaceSymbol : char}
    </span>
  )
}
