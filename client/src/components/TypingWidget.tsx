import { useEffect, useReducer, useRef, useState } from 'react'

import {
  Accuracy,
  StopWatch,
  TypingWidgetText /*  Accuracy, StopWatch, WordsPerMin, type CharacterProps */,
  WordsPerMin,
} from 'components'
import { fetchTypingString, saveStats } from 'api'
import {
  TypingAction,
  AlertType,
  type KeyEvent,
  type FontSettings,
  type OnTypeParams,
} from 'types/global'
import {
  calculateAccuracy,
  calculateTypingSessionStats,
  calculateWpm,
  typingWidgetStateReducer,
} from 'utils/helpers'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  TYPING_WIDGET_INITIAL_STATE,
} from 'utils/constants'
import { useUser } from 'api/context/UserContext'
import { useAlert } from './AlertContext'
import { getReadableErrorMessage } from 'api/helpers'

export const TypingWidget = () => {
  const token = useUser().token
  const startTimestamp = useRef<number>(0)
  const deletedCharCount = useRef<number>(0)
  const keyEventQueue = useRef<KeyEvent[]>([])
  const [state, dispatch] = useReducer(typingWidgetStateReducer, TYPING_WIDGET_INITIAL_STATE)
  const [showStats, setShowStats] = useState<boolean>(false)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)
  const { showAlert } = useAlert()

  const fetchAndSetText = async () => {
    const newText = await fetchTypingString()
    dispatch({ type: 'SET_TEXT', payload: newText })
    localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
  }

  // On mount
  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    if (savedText && completed === 'false') {
      dispatch({ type: 'SET_TEXT', payload: savedText })
    } else {
      fetchAndSetText()
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
    setShowStats(false)
    dispatch({ type: 'RESET_SESSION' })
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
    deletedCharCount.current = 0
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
    deletedCharCount.current += deleteCount
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

    // ✅ Live stats calculation
    const typedText = keyEventQueue.current.map((e) => e.key).join('')
    const targetText = state.text ?? ''
    const now = Date.now()
    const elapsed = now - startTimestamp.current

    if (elapsed > 0 && typedText.length > 0) {
      const accuracy = calculateAccuracy(targetText, typedText)
      const wpm = calculateWpm(targetText, typedText, elapsed)

      dispatch({ type: 'UPDATE_STATS', payload: { wpm, accuracy } })
    }
  }

  const onComplete = async (correctedCharCount: number): Promise<void> => {
    if (!state.text) return
    dispatch({ type: 'STOP' })
    setShowStats(true)

    const now = Date.now()
    const elapsedTime = now - startTimestamp.current

    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })

    const sessionStats = calculateTypingSessionStats(
      keyEventQueue.current,
      state.text,
      correctedCharCount,
      deletedCharCount.current,
      startTimestamp.current,
      now
    )

    dispatch({
      type: 'UPDATE_STATS',
      payload: { wpm: sessionStats.wpm, accuracy: sessionStats.accuracy },
    })

    // Save stats to server – handle failure gracefully
    try {
      token &&
        (await saveStats(
          {
            wpm: sessionStats.wpm,
            accuracy: sessionStats.accuracy,
            startTime: startTimestamp.current,
            endTime: now,
            practiceDuration: 60,
            correctedCharCount: sessionStats.correctedCharCount,
            deletedCharCount: sessionStats.deletedCharCount,
            correctCharsTyped: sessionStats.correctCharsTyped,
            totalCharsTyped: sessionStats.totalCharsTyped,
            errorCharCount: sessionStats.errorCharCount,
            unigraphs: sessionStats.unigraphs,
            digraphs: sessionStats.digraphs,
          },
          token
        ))

      localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')
      await fetchAndSetText()
    } catch (err) {
      console.error('Failed to save stats:', err)
      showAlert({
        title: 'Failed to save stats',
        message: getReadableErrorMessage(err),
        type: AlertType.ERROR,
      })
    }
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
          <WordsPerMin wpm={state.wpm} />
          <Accuracy accuracy={state.accuracy} />
          <StopWatch time={state.stopWatchTime} />
        </div>
      ) : null}
    </div>
  ) : null
}
