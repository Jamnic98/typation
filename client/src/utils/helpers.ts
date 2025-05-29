import { CursorStyles } from 'types/global'

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
