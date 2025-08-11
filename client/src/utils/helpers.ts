import { type CharacterProps } from 'components'
import {
  CursorStyles,
  TypedStatus,
  type KeyEvent,
  type Action,
  type State,
  type TypingSessionStats,
} from 'types'
import { AVERAGE_WORD_LENGTH, TYPING_WIDGET_INITIAL_STATE } from './constants'

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
      return { ...state, isRunning: true, stopWatchTime: 0 }

    case 'STOP':
      return { ...state, isRunning: false }

    case 'UPDATE_STATS':
      return {
        ...state,
        wpm: action.payload.wpm !== undefined ? action.payload.wpm : state.wpm,
        accuracy: action.payload.accuracy !== undefined ? action.payload.accuracy : state.accuracy,
      }

    case 'SET_STOPWATCH_TIME':
      return { ...state, stopWatchTime: action.payload }

    default:
      return state
  }
}

export const isValidDigraphKey = (key: string): boolean => {
  return typeof key === 'string' && key.length === 2
}

export const findDeleteFrom = (charObjArray: CharacterProps[], index: number): number => {
  for (let i = index; i >= 0; i--) {
    if (charObjArray[i].typedStatus !== TypedStatus.MISS) {
      return i + 1
    }
  }
  return 0
}

export const calculateTypingSessionStats = (
  keyEvents: KeyEvent[],
  targetText: string,
  correctedCharCount: number,
  deletedCharCount: number,
  startTime: number,
  endTime: number,
  mistyped: Record<string, Record<string, number>>
): TypingSessionStats => {
  const typedText = keyEvents.map((keyEvent) => keyEvent.key).join('')

  const correctCharsTyped = keyEvents.filter((e) => e.typedStatus === TypedStatus.HIT).length
  const errorCharCount = keyEvents.filter((e) => e.typedStatus === TypedStatus.MISS).length
  const totalCharsTyped = keyEvents.length + deletedCharCount

  const digraphTimings: Record<string, number[]> = {}
  const digraphStats: Record<string, { count: number; hit: number }> = {}
  const unigraphStats: Record<
    string,
    { count: number; hit: number; mistyped: { key: string; count: number }[] }
  > = {}

  for (let i = 0; i < keyEvents.length; i++) {
    const { key, typedStatus } = keyEvents[i]

    // --- Unigraph Stats ---
    if (!unigraphStats[key]) {
      unigraphStats[key] = { count: 0, hit: 0, mistyped: [] }
    }
    if (typedStatus === TypedStatus.HIT) {
      unigraphStats[key].hit++
    }
    unigraphStats[key].count++

    // --- Digraph Stats ---
    if (i > 0 && i < targetText.length) {
      const prev = keyEvents[i - 1]

      // Expected digraph from target text (position i-1, i)
      const expectedDigraph = targetText[i - 1] + targetText[i]

      // Typed digraph from actual keys typed
      const typedDigraph = prev.key + key

      // Calculate interval as before
      const interval = keyEvents[i].timestamp - prev.timestamp

      // Initialize timings array
      if (!digraphTimings[expectedDigraph]) digraphTimings[expectedDigraph] = []
      digraphTimings[expectedDigraph].push(interval)

      // Initialize stats for expected digraph
      if (!digraphStats[expectedDigraph]) digraphStats[expectedDigraph] = { count: 0, hit: 0 }
      digraphStats[expectedDigraph].count++

      // Increment hit only if typed digraph matches expected and both keys are hits
      if (
        typedDigraph === expectedDigraph &&
        prev.typedStatus === TypedStatus.HIT &&
        typedStatus === TypedStatus.HIT
      ) {
        digraphStats[expectedDigraph].hit++
      }
    }
  }

  // create an array of incorrectly typed keys
  for (const key of Object.keys(unigraphStats)) {
    const mistypedDict = mistyped[key] ?? {}
    const mistypedList = Object.entries(mistypedDict).map(([mistypedKey, count]) => ({
      key: mistypedKey,
      count,
    }))
    unigraphStats[key].mistyped = mistypedList
  }

  // Compute unigraphs array with accuracy and array of mistyped characters
  const unigraphs = Object.entries(unigraphStats).map(([key, { count, mistyped = [] }]) => {
    const missCount = Array.isArray(mistyped)
      ? mistyped.reduce((acc, val) => acc + val.count, 0)
      : 0

    return {
      key,
      count,
      accuracy: count ? Math.round(((count - missCount) / count) * 100) : 0,
      mistyped,
    }
  })

  // Compute digraphs array with accuracy and mean intervals
  const digraphs = Object.entries(digraphStats).map(([key, { count, hit }]) => {
    const intervals = digraphTimings[key] || []
    const meanInterval = intervals.length
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : 0
    const accuracy = count > 0 ? Math.round((hit / count) * 100) : 0
    return {
      key,
      count,
      accuracy,
      meanInterval,
    }
  })

  const elapsed = endTime - startTime
  const practiceDuration = Math.round(elapsed / 1000)
  const wpm = calculateWpm(targetText, typedText, elapsed)
  const accuracy = calculateAccuracy(targetText, typedText)

  return {
    startTime,
    endTime,
    practiceDuration,
    wpm,
    accuracy,
    correctedCharCount,
    deletedCharCount,
    correctCharsTyped,
    totalCharsTyped,
    errorCharCount,
    digraphs,
    unigraphs,
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

  return typedText.length > 0 ? parseFloat(((correct / typedText.length) * 100).toFixed(1)) : 0
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

export const prettifyInt = (num: number): string => num.toLocaleString('en-GB')
