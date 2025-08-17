import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { Accuracy, StopWatch, TypingWidgetText, WordsPerMin } from 'components'
import { fetchTypingString, saveStats, useAlert, useUser } from 'api'
import {
  calculateAccuracy,
  calculateTypingSessionStats,
  calculateWpm,
  typingWidgetStateReducer,
  getReadableErrorMessage,
  trackMistypedKey,
} from 'utils/helpers'
import {
  defaultFontSettings,
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  TYPING_WIDGET_INITIAL_STATE,
} from 'utils/constants'
import {
  TypingAction,
  AlertType,
  type KeyEvent,
  type FontSettings,
  type OnTypeParams,
  TypedStatus,
} from 'types'

export const TypingWidget = () => {
  const { token } = useUser()
  const { showAlert } = useAlert()

  const [state, dispatch] = useReducer(typingWidgetStateReducer, TYPING_WIDGET_INITIAL_STATE)

  const startTimestamp = useRef<number>(0)
  const deletedCharCount = useRef<number>(0)
  const keyEventQueue = useRef<KeyEvent[]>([])
  const mistypedRef = useRef<Record<string, Record<string, number>>>({})

  const [displayTime, setDisplayTime] = useState(0)
  const [showStats, setShowStats] = useState<boolean>(false)
  const [fontSettings /* , setFontSettings */] = useState<FontSettings>(defaultFontSettings)

  const fetchAndSetText = useCallback(async () => {
    try {
      const newText = await fetchTypingString()
      dispatch({ type: 'SET_TEXT', payload: newText })
      localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, newText)
      localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
    } catch (err) {
      const errorMsg = 'Failed to fetch typing text'
      console.error(errorMsg, err)
      showAlert({
        title: errorMsg,
        message: getReadableErrorMessage(err),
        type: AlertType.ERROR,
      })
    }
  }, [showAlert])

  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    if (savedText && completed === 'false') {
      dispatch({ type: 'SET_TEXT', payload: savedText })
    } else {
      fetchAndSetText()
    }
  }, [fetchAndSetText])

  const reset = (): void => {
    setShowStats(false)
    dispatch({ type: 'RESET_SESSION' })
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
    deletedCharCount.current = 0
    mistypedRef.current = {}
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

    if (typedStatus === TypedStatus.MISS && cursorIndex < state.text.length) {
      trackMistypedKey(mistypedRef, key, state.text[cursorIndex])
    }

    // Live stats calculation of wpm and accuracy
    const now = Date.now()
    const elapsed = now - startTimestamp.current
    const typedText = keyEventQueue.current.map((e) => e.key).join('')

    if (elapsed && typedText.length > 0) {
      const targetText = state.text
      const wpm = calculateWpm(targetText, typedText, elapsed)
      const accuracy = calculateAccuracy(targetText, typedText)
      dispatch({ type: 'UPDATE_STATS', payload: { wpm, accuracy } })
    }
  }

  const onComplete = async (correctedCharCount: number): Promise<void> => {
    if (!state.text) return

    const now = Date.now()
    const elapsedTime = now - startTimestamp.current

    dispatch({ type: 'STOP' })
    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })
    setDisplayTime(elapsedTime)

    const sessionStats = calculateTypingSessionStats(
      keyEventQueue.current,
      state.text,
      correctedCharCount,
      deletedCharCount.current,
      startTimestamp.current,
      now,
      mistypedRef.current
    )
    dispatch({
      type: 'UPDATE_STATS',
      payload: { wpm: sessionStats.wpm, accuracy: sessionStats.accuracy },
    })

    try {
      await fetchAndSetText()
      setShowStats(true)
      token &&
        (await saveStats(
          {
            wpm: sessionStats.wpm,
            accuracy: sessionStats.accuracy,
            practiceDuration: Math.floor(elapsedTime / 1000),
            correctedCharCount: sessionStats.correctedCharCount,
            deletedCharCount: sessionStats.deletedCharCount,
            correctCharsTyped: sessionStats.correctCharsTyped,
            totalCharsTyped: sessionStats.totalCharsTyped,
            errorCharCount: sessionStats.errorCharCount,
            unigraphs: sessionStats.unigraphs,
            digraphs: sessionStats.digraphs,
            startTime: startTimestamp.current,
            endTime: now,
          },
          token
        ))

      localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')
    } catch (err) {
      const errorMsg = 'Failed to save stats'
      console.error(errorMsg, err)
      showAlert({
        title: errorMsg,
        message: getReadableErrorMessage(err),
        type: AlertType.ERROR,
      })
    }
  }

  return (
    <div id="typing-widget" data-testid="typing-widget" className="w-full h-full">
      <TypingWidgetText
        onStart={onStart}
        onComplete={onComplete}
        onType={onType}
        reset={reset}
        textToType={state.text ?? ''}
        fontSettings={fontSettings}
      />

      {/* TODO: replace br tag with style */}
      <br />
      <br />
      <br />
      <br />

      {showStats ? (
        <div id="stats" className="space-y-4 flex flex-col justify-center items-center">
          <WordsPerMin wpm={state.wpm} />
          <Accuracy accuracy={state.accuracy} />
          <StopWatch time={displayTime} />
        </div>
      ) : null}
    </div>
  )
}
