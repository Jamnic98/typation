import { type RefObject } from 'react'

import { type CharacterProps } from 'components'
import { AVERAGE_WORD_LENGTH, TYPING_WIDGET_INITIAL_STATE } from './constants'
import {
  CursorStyles,
  TypedStatus,
  type KeyEvent,
  type Action,
  type State,
  type TypingSessionStats,
  SpecialEvent,
} from 'types'

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
        netWpm: action.payload.netWpm !== undefined ? action.payload.netWpm : state.netWpm,
        accuracy: action.payload.accuracy !== undefined ? action.payload.accuracy : state.accuracy,
        rawAccuracy:
          action.payload.rawAccuracy !== undefined ? action.payload.rawAccuracy : state.rawAccuracy,
        totalCharsTyped:
          action.payload.totalCharsTyped !== undefined
            ? action.payload.totalCharsTyped
            : state.totalCharsTyped,
        correctedCharCount:
          action.payload.correctedCharCount !== undefined
            ? action.payload.correctedCharCount
            : state.correctedCharCount,
        errorCharCount:
          action.payload.errorCharCount !== undefined
            ? action.payload.errorCharCount
            : state.errorCharCount,
        deletedCharCount:
          action.payload.deletedCharCount !== undefined
            ? action.payload.deletedCharCount
            : state.deletedCharCount,
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
  events: KeyEvent[],
  startTime: number,
  endTime: number
): TypingSessionStats => {
  let hits = 0
  let fixed = 0
  let misses = 0
  let unfixed = 0
  let deletes = 0

  // const unigraphStats: Record<string, { count: number; hit: number; miss: number }> = {}
  // const digraphTimings: Record<string, number[]> = {}

  for (let i = 0; i < events.length; i++) {
    const e = events[i]

    if (e.key === SpecialEvent.BACKSPACE) {
      deletes += e.deleteCount ?? 1
      continue // don’t log in unigraph/digraph
    }

    // if (!unigraphStats[e.key]) {
    //   unigraphStats[e.key] = { count: 0, hit: 0, miss: 0 }
    // }
    // unigraphStats[e.key].count++

    switch (e.typedStatus) {
      case TypedStatus.HIT:
        hits++
        // unigraphStats[e.key].hit++
        break
      case TypedStatus.FIXED:
        fixed++
        // unigraphStats[e.key].hit++
        break
      case TypedStatus.MISS:
        misses++
        // unigraphStats[e.key].miss++
        break
      case TypedStatus.UNFIXED:
        unfixed++
        // unigraphStats[e.key].miss++
        break
    }
  }

  //   // --- Digraph timings (only between non-backspace chars) ---
  //   if (i > 0 && events[i - 1].key !== SpecialEvent.BACKSPACE) {
  //     const prev = events[i - 1]
  //     const expectedDigraph = (prev.expectedChar || '') + (e.expectedChar || '')
  //     const interval = e.timestamp - prev.timestamp
  //     if (!digraphTimings[expectedDigraph]) digraphTimings[expectedDigraph] = []
  //     digraphTimings[expectedDigraph].push(interval)
  //   }
  // }

  const corrected = Math.min(fixed, deletes)
  const finalCorrect = hits + corrected

  // attempts = all typed chars (hits + misses + unfixed + corrected)
  const attempts = hits + misses + unfixed + corrected
  const accuracy = toPercent(finalCorrect, attempts)

  const rawAccuracy = toPercent(finalCorrect, attempts + deletes)

  const elapsed = endTime - startTime
  const grossWpm = calculateGrossWpm(attempts, elapsed)
  const netWpm = calculateNetWpm(grossWpm, accuracy)

  // const unigraphs = Object.entries(unigraphStats).map(([key, { count, hit }]) => ({
  //   key,
  //   count,
  //   accuracy: count ? Math.floor((hit / count) * 100) : 0,
  //   // rawAccuracy: hit / count, // Placeholder: set to actual raw accuracy if available
  //   mistyped: [], // TODO: Populate with actual mistyped data if available
  // }))

  // const digraphs = Object.entries(digraphTimings).map(([key, arr]) => ({
  //   key,
  //   count: arr.length,
  //   meanInterval: Math.floor(arr.reduce((a, b) => a + b, 0) / arr.length),
  //   // TODO: calculate digraph accuracy
  //   accuracy: 1, // Placeholder: set to 1 (100%) or compute actual accuracy if available
  // }))

  return {
    startTime,
    endTime,
    practiceDuration: Math.floor(elapsed / 1000),
    wpm: grossWpm,
    netWpm,
    accuracy,
    rawAccuracy,
    correctedCharCount: corrected,
    errorCharCount: misses,
    deletedCharCount: deletes,
    correctCharsTyped: finalCorrect,
    totalCharsTyped: hits + corrected + misses + unfixed + deletes,
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

export const prettifyInt = (num: number): string => num.toLocaleString('en-GB')

export const prettifyDuration = (v: number): string => {
  if (v <= 0) return '0s'

  const days = Math.floor(v / 86400)
  const hours = Math.floor((v % 86400) / 3600)
  const minutes = Math.floor((v % 3600) / 60)
  const seconds = v % 60

  const parts: string[] = []

  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`)
  if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`)
  if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

export const getReadableErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err)

export const resetTypedStatus = (chars: CharacterProps[] | string): CharacterProps[] => {
  if (typeof chars === 'string') {
    return chars.split('').map((char, index) => ({
      char,
      typedStatus: TypedStatus.NONE,
      isActive: index === 0,
    }))
  }

  return chars.map((c) => ({ ...c, typedStatus: TypedStatus.NONE }))
}

export const trackMistypedKey = (
  mistypedRef: RefObject<Record<string, Record<string, number>>>,
  key: string,
  intended: string
) => {
  const ref = mistypedRef.current
  ref[intended] ??= {}
  ref[intended][key] = (ref[intended][key] ?? 0) + 1
}

const toPercent = (numerator: number, denominator: number, decimals = 1): number => {
  if (!denominator) return 0
  return parseFloat(((numerator / denominator) * 100).toFixed(decimals))
}

export const displayValue = (val?: number | null, opts?: { percent?: boolean }): string => {
  if (val == null) return 'n/a'
  if (opts?.percent) return `${Math.floor(val)}%`
  return prettifyInt(val)
}

export const percentChange = (
  current: number,
  baseline: number
): { text: string; arrow: '▲' | '▼' | null; positive: boolean | null } | null => {
  // No data in both
  if (baseline === 0 && current === 0) return null

  // No baseline, but current exists -> meaningless
  if (baseline === 0 && current > 0) return null

  // No current, baseline exists -> skip (don't show ▼ 100%)
  if (baseline > 0 && current === 0) return null

  if (baseline > 0 && current === 0) {
    return { text: '100%', arrow: '▼', positive: false }
  }

  const change = ((current - baseline) / baseline) * 100
  return {
    text: `${Math.abs(change).toFixed(1)}%`,
    arrow: change >= 0 ? '▲' : '▼',
    positive: change >= 0,
  }
}

export const getGlobalIndex = (lineIndex: number, colIndex: number, lines: CharacterProps[][]) => {
  let index = 0
  for (let i = 0; i < lineIndex; i++) {
    index += lines[i].length
  }
  return index + colIndex
}

export const calculateGrossWpm = (totalCharsTyped: number, elapsedTime: number) => {
  const minutesElapsed = Math.max(elapsedTime, 1) / (60 * 1000) // avoid div/0
  const wordsTyped = totalCharsTyped / AVERAGE_WORD_LENGTH
  return Math.floor(wordsTyped / minutesElapsed)
}

// Net WPM = gross WPM * accuracy
export const calculateNetWpm = (grossWpm: number, accuracyPercent: number) => {
  return Math.floor(grossWpm * (accuracyPercent / 100))
}

export const formatDateTime = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', // Mon
    day: '2-digit', // 25
    month: 'short', // Aug
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
