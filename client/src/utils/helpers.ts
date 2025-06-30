import { type CharacterProps } from 'components/Character'
import {
  CursorStyles,
  TypedStatus,
  type KeyEvent,
  type Action,
  type State,
  type TypingSessionStats,
  type DigraphTimingAverage,
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

    case 'UPDATE_STATS':
      return {
        ...state,
        wpm: action.payload.wpm !== undefined ? action.payload.wpm : state.wpm,
        accuracy: action.payload.accuracy !== undefined ? action.payload.accuracy : state.accuracy,
      }

    case 'TICK':
      return { ...state, stopWatchTime: state.stopWatchTime + 10 }

    case 'SET_STOPWATCH_TIME':
      return { ...state, stopWatchTime: action.payload }

    default:
      return state
  }
}

export const isValidDigraphKey = (key: string): boolean => {
  return typeof key === 'string' && key.length === 2
}

export const calculateErrorCount = (text: string, typedText: string): number => {
  let errorCount = 0
  const len = Math.min(text.length, typedText.length)

  for (let i = 0; i < len; i++) {
    if (text[i] !== typedText[i]) {
      errorCount++
    }
  }

  // Count any extra characters in typedText as errors
  errorCount += Math.max(0, typedText.length - text.length)

  return errorCount
}

export const findDeleteFrom = (charObjArray: CharacterProps[], index: number): number => {
  let i = index
  while (i >= 0 && charObjArray[i].typedStatus === TypedStatus.MISS) {
    i--
  }
  return i + 1
}

export const calculateTypingSessionStats = (
  keyEvents: KeyEvent[],
  targetText: string,
  correctedCharCount: number,
  deletedCharCount: number,
  startTime: number,
  endTime: number
): TypingSessionStats => {
  const typedText = keyEvents.map((keyEvent) => keyEvent.key).join('')
  const typedCharCount = keyEvents.filter((e) => e.typedStatus === TypedStatus.HIT).length
  const errorCharCount = keyEvents.filter((e) => e.typedStatus === TypedStatus.MISS).length
  const totalCharCount = keyEvents.length

  const digraphTimings: Record<string, number[]> = {}
  const digraphStats: Record<string, { count: number; hit: number }> = {}
  const unigraphStats: Record<string, { count: number; hit: number }> = {}

  for (let i = 0; i < keyEvents.length; i++) {
    const { key, typedStatus } = keyEvents[i]

    // --- Unigraph Stats ---
    if (!unigraphStats[key]) {
      unigraphStats[key] = { count: 0, hit: 0 }
    }
    unigraphStats[key].count++
    if (typedStatus === TypedStatus.HIT) unigraphStats[key].hit++

    // --- Digraph Stats ---
    if (i > 0) {
      const prev = keyEvents[i - 1]
      const digraph = prev.key + key
      const interval = keyEvents[i].timestamp - prev.timestamp

      if (!digraphTimings[digraph]) digraphTimings[digraph] = []
      digraphTimings[digraph].push(interval)

      if (!digraphStats[digraph]) {
        digraphStats[digraph] = { count: 0, hit: 0 }
      }

      digraphStats[digraph].count++
      if (prev.typedStatus === TypedStatus.HIT && typedStatus === TypedStatus.HIT) {
        digraphStats[digraph].hit++
      }
    }
  }

  // Convert unigraphStats to array
  const finalUnigraphStats = Object.entries(unigraphStats).map(([key, { count, hit }]) => ({
    key,
    count,
    accuracy: Math.round((hit / count) * 100),
  }))

  // Convert digraphStats to array with separate first/second key
  const finalDigraphStats = Object.entries(digraphStats).map(([digraph, { count, hit }]) => ({
    firstKey: digraph[0],
    secondKey: digraph[1],
    count,
    accuracy: Math.round((hit / count) * 100),
  }))

  // Average digraph timings
  const averageDigraphTimings: Record<string, number> = {}
  for (const digraph in digraphTimings) {
    const times = digraphTimings[digraph]
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    averageDigraphTimings[digraph] = Math.round(avg)
  }

  const averageDigraphTimingsArray: DigraphTimingAverage[] = Object.entries(
    averageDigraphTimings
  ).map(([digraph, timing]) => ({ key: digraph, averageInterval: timing }))

  const practiceDuration = Math.round((endTime - startTime) / 1000)
  const elapsed = endTime - startTime
  const wpm = calculateWpm(targetText, typedText, elapsed)
  const accuracy = calculateAccuracy(targetText, typedText)

  return {
    startTime,
    endTime,
    practiceDuration,
    wpm,
    accuracy,
    errorCount: errorCharCount,

    correctedCharCount,
    deletedCharCount,
    typedCharCount,
    totalCharCount,
    errorCharCount,

    digraphTimings: averageDigraphTimingsArray,

    unigraphStats: finalUnigraphStats,
    digraphStats: finalDigraphStats,
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
