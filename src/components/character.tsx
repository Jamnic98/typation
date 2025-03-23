import classNames from 'classnames'
import { type TypedStatus } from 'types'

interface CharacterProps {
  char: string
  highlighted: boolean
  typedStatus: TypedStatus
}

const statusStyles: Record<TypedStatus, string> = {
  hit: 'text-green-500',
  miss: 'text-red-500',
  none: '',
}

export const Character = ({ char, highlighted, typedStatus }: CharacterProps) => {
  const statusClass = statusStyles[typedStatus]

  return (
    <span
      className={classNames(statusClass, {
        'animate-flash': highlighted,
      })}
    >
      {char === ' ' ? '⎵' : char}
    </span>
  )
}
