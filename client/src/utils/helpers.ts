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
        accuracy: action.payload.accuracy !== undefined ? action.payload.accuracy : state.accuracy,
        rawAccuracy:
          action.payload.rawAccuracy !== undefined ? action.payload.rawAccuracy : state.rawAccuracy,
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

const rebuildFinalText = (events: KeyEvent[]): string => {
  const buffer: { char: string; status: TypedStatus }[] = []

  for (const e of events) {
    if (e.key === SpecialEvent.BACKSPACE) {
      let toDelete = e.deleteCount ?? 1

      // Only MISS can be deleted
      while (toDelete > 0 && buffer.length > 0) {
        const last = buffer[buffer.length - 1]

        if (last.status === TypedStatus.MISS) {
          buffer.pop()
          toDelete--
        } else {
          // stop if we hit HIT, CORRECTED, or FAILED_CORRECTION
          break
        }
      }
    } else {
      // Append the typed char (HIT, MISS, CORRECTED, FAILED_CORRECTION)
      buffer.push({ char: e.key, status: e.typedStatus ?? TypedStatus.NONE })
    }
  }

  return buffer.map((b) => b.char).join('')
}

export const calculateTypingSessionStats = (
  events: KeyEvent[],
  targetText: string,
  startTime: number,
  endTime: number
): TypingSessionStats => {
  const typedText = rebuildFinalText(events)

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
      deletes++
      continue // don’t log in unigraph/digraph
    }

    // if (!unigraphStats[e.key]) {
    //   unigraphStats[e.key] = { count: 0, hit: 0, miss: 0 }
    // }
    // unigraphStats[e.key].count++

    console.log(e.typedStatus, e.key)
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

  const finalCorrect = hits + fixed
  const accuracy = toPercent(finalCorrect, targetText.length)
  const rawAccuracy = toPercent(finalCorrect, hits + fixed + misses + unfixed + deletes)

  // const unigraphs = Object.entries(unigraphStats).map(([key, { count, hit }]) => ({
  //   key,
  //   count,
  //   accuracy: count ? Math.round((hit / count) * 100) : 0,
  //   // rawAccuracy: hit / count, // Placeholder: set to actual raw accuracy if available
  //   mistyped: [], // TODO: Populate with actual mistyped data if available
  // }))

  // const digraphs = Object.entries(digraphTimings).map(([key, arr]) => ({
  //   key,
  //   count: arr.length,
  //   meanInterval: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
  //   // TODO: calculate digraph accuracy
  //   accuracy: 1, // Placeholder: set to 1 (100%) or compute actual accuracy if available
  // }))

  const elapsed = endTime - startTime
  const wpm = calculateWpm(targetText, typedText, elapsed)

  return {
    startTime,
    endTime,
    practiceDuration: Math.round(elapsed / 1000),
    wpm,
    accuracy,
    rawAccuracy,
    correctedCharCount: fixed,
    errorCharCount: misses,
    deletedCharCount: deletes,
    // unigraphs,
    // digraphs,
    correctCharsTyped: finalCorrect,
    totalCharsTyped: hits + fixed + misses + unfixed + deletes,
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
  if (opts?.percent) return `${val.toFixed(1)}%`
  return prettifyInt(val)
}

export const percentChange = (current: number, previous: number): string | null => {
  if (previous !== 0) {
    const change = ((current - previous) / previous) * 100
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }
  return null
}
