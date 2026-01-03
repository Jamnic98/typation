import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import {
  type ComponentSettings,
  Modal,
  ProgressBar,
  SessionStatsSummary,
  Toolbar,
  TypingWidgetText,
} from 'components'
import { fetchTypingString, saveStats, useAlert, useUser } from 'api'
import {
  calculateTypingSessionStats,
  typingWidgetStateReducer,
  getReadableErrorMessage,
  trackMistypedKey,
  formatDateTime,
} from 'utils/helpers'
import {
  LOCAL_STORAGE_COMPLETED_KEY,
  LOCAL_STORAGE_TEXT_KEY,
  TYPING_WIDGET_INITIAL_STATE,
  defaultWidgetSettings,
} from 'utils/constants'
import {
  TypingAction,
  AlertType,
  type KeyEvent,
  type OnTypeParams,
  TypedStatus,
  SpecialEvent,
} from 'types'

export const TypingWidget = () => {
  const { token } = useUser()
  const { showAlert } = useAlert()

  const [state, dispatch] = useReducer(typingWidgetStateReducer, TYPING_WIDGET_INITIAL_STATE)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [widgetSettings, setWidgetSettings] = useState<ComponentSettings>(defaultWidgetSettings)
  const [showStats, setShowStats] = useState<boolean>(false)
  const [isFocused, setIsFocused] = useState(false)
  const [elapsed, setElapsed] = useState(0) // ms

  const hasStartedRef = useRef(false)
  const startTimestamp = useRef<number>(0)
  const keyEventQueue = useRef<KeyEvent[]>([])
  const mistypedRef = useRef<Record<string, Record<string, number>>>({})

  const timeLeft = Math.max(Number(widgetSettings.testDuration) - Math.floor(elapsed / 1000), 0)
  const progress = Math.min(elapsed / (Number(widgetSettings.testDuration) * 1000), 1) // 0 → 1

  useEffect(() => {
    if (!isFocused) {
      // stop session + reset timer
      setElapsed(0)
      dispatch({ type: 'STOP' })
    }
  }, [isFocused])

  useEffect(() => {
    if (!showStats) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowStats(false)
        reset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showStats])

  const fetchAndSetText = useCallback(async () => {
    const { text, source } = await fetchTypingString()

    dispatch({ type: 'SET_TEXT', payload: text })
    localStorage.setItem(LOCAL_STORAGE_TEXT_KEY, text)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')

    if (source !== 'server') {
      // Optional: gentle heads-up only when we didn’t get server text
      showAlert({
        title: 'Using local practice text',
        message:
          source === 'hardcoded-fallback'
            ? 'Couldn’t reach the server or load the corpus. Using a tiny fallback.'
            : 'Server is unavailable, loading text from your local corpus.',
        type: AlertType.WARNING,
      })
    }
  }, [])

  const onComplete = useCallback(async (): Promise<void> => {
    if (!state.text) return

    const now = Date.now()
    const elapsedTime = now - startTimestamp.current

    dispatch({ type: 'STOP' })
    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })

    const sessionStats = calculateTypingSessionStats(
      keyEventQueue.current,
      startTimestamp.current,
      now
    )

    dispatch({
      type: 'UPDATE_STATS',
      payload: {
        wpm: sessionStats.wpm,
        netWpm: sessionStats.netWpm,
        accuracy: sessionStats.accuracy,
        rawAccuracy: sessionStats.rawAccuracy,
        totalCharsTyped: sessionStats.totalCharsTyped,
        correctedCharCount: sessionStats.correctedCharCount,
        errorCharCount: sessionStats.errorCharCount,
        deletedCharCount: sessionStats.deletedCharCount,
      },
    })

    // show popup immediately
    setShowStats(true)
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'true')

    // fire and forget side effects
    void (async () => {
      try {
        await fetchAndSetText()
      } catch (err) {
        console.error('Failed to fetch text', err)
      }

      if (!token) return

      try {
        await saveStats({ ...sessionStats, startTime: startTimestamp.current, endTime: now }, token)
      } catch (err) {
        console.error('Failed to save stats', err)
        showAlert({
          title: 'Failed to save stats',
          message: getReadableErrorMessage(err),
          type: AlertType.ERROR,
        })
      }
    })()
  }, [dispatch, fetchAndSetText, showAlert, state.text, token])

  const reset = (): void => {
    localStorage.setItem(LOCAL_STORAGE_COMPLETED_KEY, 'false')
    hasStartedRef.current = false
    keyEventQueue.current = []
    setElapsed(0)
  }

  const onType = ({ key, typedStatus, cursorIndex, timestamp, action }: OnTypeParams) => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      startTimestamp.current = Date.now()
      dispatch({ type: 'START' })
    }

    // Completed the text
    if (cursorIndex >= state.text.length - 1) {
      onComplete()
      return
    }

    const expected = cursorIndex < state.text.length ? state.text[cursorIndex] : undefined
    switch (action) {
      case TypingAction.BackspaceSingle:
      case TypingAction.ClearMissRange:
        keyEventQueue.current.push({
          key: SpecialEvent.BACKSPACE,
          expectedChar: expected,
          cursorIndex,
          timestamp,
        })
        break

      case TypingAction.AddKey:
      default:
        keyEventQueue.current.push({
          key,
          expectedChar: expected,
          cursorIndex,
          typedStatus,
          timestamp,
        })
    }

    if (typedStatus === TypedStatus.MISS && cursorIndex < state.text.length) {
      trackMistypedKey(mistypedRef, key, state.text[cursorIndex])
    }
  }

  const handleBlurReset = () => {
    dispatch({ type: 'STOP' })
    setElapsed(0)
  }

  const handleSaveSettings = (next: ComponentSettings) => {
    setWidgetSettings(next)

    showAlert({
      type: AlertType.SUCCESS,
      title: 'Settings Updated',
      message: 'Your preferences have been saved successfully.',
    })
  }

  useEffect(() => {
    if (!state.isRunning || !isFocused) return

    let rafId: number

    const tick = () => {
      const diff = Date.now() - startTimestamp.current
      setElapsed(diff) // forces re-render every frame

      if (diff >= Number(widgetSettings.testDuration) * 1000) {
        onComplete()
      } else {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [state.isRunning, widgetSettings.testDuration, isFocused, onComplete])

  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)
    const completed = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KEY)

    if (savedText && completed === 'false') {
      dispatch({ type: 'SET_TEXT', payload: savedText })
    } else {
      fetchAndSetText()
    }
  }, [])

  return (
    <div id="typing-widget" data-testid="typing-widget" className="w-full h-full">
      <Toolbar
        settings={widgetSettings}
        onSaveSettings={(next) => handleSaveSettings(next)}
        containerMaxWidthClass="max-w-4xl"
        onOpenChange={(open) => setIsSettingsOpen(open)}
      />

      <TypingWidgetText
        onType={onType}
        reset={reset}
        textToType={state.text ?? ''}
        typingWidgetSettings={widgetSettings}
        typable={!showStats}
        onFocusChange={setIsFocused}
        onBlurReset={handleBlurReset}
        isSettingsOpen={isSettingsOpen}
      />

      <Modal
        title={formatDateTime(startTimestamp.current)}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      >
        <SessionStatsSummary
          wpm={state.wpm}
          netWpm={state.netWpm}
          accuracy={state.accuracy}
          rawAccuracy={state.rawAccuracy}
          keystrokes={state.totalCharsTyped}
          corrected={state.correctedCharCount}
          missed={state.errorCharCount}
          deleted={state.deletedCharCount}
        />
      </Modal>

      {state.isRunning && isFocused && (
        <div className="flex items-center gap-4 mt-4 w-full">
          {/* Time label */}
          <div className="text-lg text-left">{timeLeft}s</div>

          {/* Progress bar container */}
          <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
            <ProgressBar progress={progress} />
          </div>
        </div>
      )}
    </div>
  )
}
