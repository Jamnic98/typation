import { type CharacterProps } from 'components/Character'
import { CursorStyles, type TypedStatus, type TypingStats } from 'types/global'

export const randomRotation = Math.floor(Math.random() * 201) - 100

export const getCursorStyle = (cursorStyle: CursorStyles | undefined) => {
  switch (cursorStyle) {
    case CursorStyles.UNDERSCORE:
      return 'animate-flash-underscore'
    case CursorStyles.BLOCK:
      return 'animate-flash-block'
    case CursorStyles.OUTLINE:
      return 'animate-flash-outline'
    case CursorStyles.PIPE:
      return 'animate-flash-pipe'
    default:
      return 'none'
  }
}

export const updateStats = (
  currentStats: TypingStats,
  charObjArray: CharacterProps[],
  typedStatus: TypedStatus,
  cursorIndex: number
): TypingStats => {
  console.log('[userStats]', charObjArray, typedStatus, cursorIndex)
  return {
    ...currentStats,
    startTime: Date.now(),
    endTime: Date.now(),
    // textToType: '',
    // textTyped: '',
  }
}
