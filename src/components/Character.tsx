import { TypedStatus, type SpaceSymbol } from 'types'

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
      className={`inline-flex w-[0.4em] h-[1.5em] justify-center items-center leading-none px-[0.4em] ${highlighted ? 'animate-flash ' : ''} ${statusClass}`}
      data-testid="character"
    >
      {char === ' ' && spaceSymbol ? spaceSymbol : char}
    </span>
  )
}
