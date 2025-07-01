import { useEffect, useReducer, useRef, useState } from 'react'

import {
  TypingWidgetText /*  Accuracy, StopWatch, WordsPerMin, type CharacterProps */,
} from 'components'
import { fetchNewString, saveStats } from 'api'
import { type KeyEvent, type FontSettings, type OnTypeParams, TypingAction } from 'types/global'
import { calculateTypingSessionStats, typingWidgetStateReducer } from 'utils/helpers'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  TYPING_WIDGET_INITIAL_STATE,
} from 'utils/constants'
import { useUser } from 'api/context/UserContext'

export const TypingWidget = () => {
  const token = useUser().token
  const startTimestamp = useRef<number>(0)
  const keyEventQueue = useRef<KeyEvent[]>([])
  const [state, dispatch] = useReducer(typingWidgetStateReducer, TYPING_WIDGET_INITIAL_STATE)
  const [showStats /* setShowStats */] = useState<boolean>(true)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  // Load persisted text from localStorage or fetch new text on mount
  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    try {
      if (savedText && completed === 'false') {
        dispatch({ type: 'SET_TEXT', payload: savedText })
      } else {
        // If no saved text or completed, fetch a new string
        // setIsLoadingText(true)
        localStorage.removeItem(LOCAL_STORAGE_TEXT_KEY) // Clear old text
        localStorage.removeItem(LOCAL_STORAGE_COMPLETED_KEY) // Clear completed status
        // Get new text
        const getText = async () => {
          const newText = await fetchNewString()
          dispatch({ type: 'SET_TEXT', payload: newText })
          localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
          localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
        }
        getText()
      }
    } catch (error) {
      console.error('Error loading text from localStorage:', error)
    }
  }, [])

  // Stopwatch interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (state.runStopWatch) {
      intervalId = setInterval(() => dispatch({ type: 'TICK' }), 10)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [state.runStopWatch])

  const reset = (): void => {
    dispatch({ type: 'RESET_SESSION' })
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
    keyEventQueue.current = []
  }

  const onStart = (): void => {
    reset()
    dispatch({ type: 'START' })
    startTimestamp.current = Date.now()
  }

  const onType = ({
    key,
    typedStatus,
    cursorIndex,
    timestamp,
    action,
    deleteCount = 0,
  }: OnTypeParams) => {
    switch (action) {
      case TypingAction.BackspaceSingle:
        keyEventQueue.current.pop()
        break
      case TypingAction.ClearMissRange:
        for (let i = 0; i < deleteCount; i++) {
          keyEventQueue.current.pop()
        }
        break
      case TypingAction.AddKey:
      default:
        keyEventQueue.current.push({ key, typedStatus, cursorIndex, timestamp })
    }
  }

  const onComplete = async (): Promise<void> => {
    if (!state.text) return
    dispatch({ type: 'STOP' })

    const now = Date.now()
    const elapsedTime = startTimestamp ? now - startTimestamp.current : state.stopWatchTime

    // Update reducer time so UI matches final elapsedTime
    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })

    const sessionStats = calculateTypingSessionStats(
      keyEventQueue.current,
      state.text,
      // TODO: update to use actual values
      0,
      0,
      startTimestamp.current,
      now
    )

    dispatch({
      type: 'UPDATE_STATS',
      payload: { wpm: sessionStats.wpm, accuracy: sessionStats.accuracy },
    })

    // TODO: Replace with actual stats calculation logic
    // This is a placeholder for the actual stats you would calculate
    // based on the typedText and state.text
    token &&
      saveStats(
        {
          wpm: sessionStats.wpm,
          accuracy: sessionStats.accuracy,
          startTime: startTimestamp.current,
          endTime: now,
          practiceDuration: 60, // in seconds

          errorCount: sessionStats.errorCount,

          correctedCharCount: sessionStats.correctedCharCount,
          deletedCharCount: sessionStats.deletedCharCount,

          typedCharCount: sessionStats.typedCharCount,
          totalCharCount: sessionStats.totalCharCount,
          errorCharCount: sessionStats.errorCharCount,

          // Intervals (in ms) between each digraph grouped by digraph string
          aveDigraphTimings: sessionStats.aveDigraphTimings,

          // Frequency + accuracy per key
          unigraphStats: sessionStats.unigraphStats,

          // Frequency + accuracy per key pair
          digraphStats: sessionStats.digraphStats,
        },
        token
      )

    const newText = await fetchNewString()
    dispatch({ type: 'SET_TEXT', payload: newText })
    localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')
  }

  return state.text ? (
    <div id="typing-widget" data-testid="typing-widget">
      <TypingWidgetText
        onStart={onStart}
        onComplete={onComplete}
        onType={onType}
        reset={reset}
        textToType={state.text}
        fontSettings={fontSettings}
      />
      <br />
      {showStats ? (
        <div id="stats" className="space-y-4">
          {/* <WordsPerMin wpm={state.wpm} />
          <Accuracy accuracy={state.accuracy} /> 
          <StopWatch time={state.stopWatchTime} /> */}
        </div>
      ) : null}
    </div>
  ) : null
}
