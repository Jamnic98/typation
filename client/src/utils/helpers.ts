import { type CharacterProps } from 'components/Character'
import {
  CursorStyles,
  type Action,
  type State,
  type TypedStatus,
  type TypingStats,
} from 'types/global'
import { AVERAGE_WORD_LENGTH, TYPING_WIDGET_INITIAL_STATE } from './constants'

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
  }
}

export const calculateAccuracy = (targetText: string, typedText: string) => {
  const len = Math.min(targetText.length, typedText.length)
  let correct = 0

  for (let i = 0; i < len; i++) {
    if (typedText[i] === targetText[i]) {
      correct++
    }
  }

  return typedText.length > 0 ? Math.round((correct / typedText.length) * 100) : 0
}

export const calculateWpm = (targetText: string, typedText: string, elapsedTime: number) => {
  console.log(
    '[calculateWpm] targetText:',
    targetText,
    'typedText:',
    typedText,
    'elapsedTime:',
    elapsedTime
  )

  const len = Math.min(targetText.length, typedText.length)
  let correct = 0

  for (let i = 0; i < len; i++) {
    if (typedText[i] === targetText[i]) {
      correct++
    }
  }

  // const minutesElapsed = Math.max(elapsedTime, MIN_ELAPSED_TIME_MS) / (60 * 1000)
  const minutesElapsed = elapsedTime / (60 * 1000)
  const wordsTyped = correct / AVERAGE_WORD_LENGTH

  return Math.round(wordsTyped / minutesElapsed)
}

export const typingWidgetStateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TEXT':
      return { ...state, text: action.payload }

    case 'RESET_SESSION':
      return {
        ...TYPING_WIDGET_INITIAL_STATE,
        text: state.text,
      }

    case 'RESET_ALL':
      return TYPING_WIDGET_INITIAL_STATE

    case 'START':
      return { ...state, runStopWatch: true, stopWatchTime: 0 }

    case 'STOP':
      return { ...state, runStopWatch: false }

    case 'SET_WPM':
      return { ...state, wpm: action.payload }

    case 'SET_ACCURACY':
      return { ...state, accuracy: action.payload }

    case 'TICK':
      return { ...state, stopWatchTime: state.stopWatchTime + 10 }

    case 'SET_STOPWATCH_TIME':
      return { ...state, stopWatchTime: action.payload }

    default:
      return state
  }
}
