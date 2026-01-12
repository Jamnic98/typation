import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { ComponentSettings, Modal, SessionStatsSummary, Toolbar, TypingWidget } from 'components'
import { fetchTypingString, saveStats, useAlert, useUser } from 'api'
import {
  calculateTypingSessionStats,
  typingWidgetStateReducer,
  getReadableErrorMessage,
  trackMistypedKey,
  formatDateTime,
} from 'utils/helpers'
import {
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

export const Home = () => {
  const { token } = useUser()
  const { showAlert } = useAlert()

  const inputRef = useRef<HTMLDivElement>(null)

  const [state, dispatch] = useReducer(typingWidgetStateReducer, TYPING_WIDGET_INITIAL_STATE)
  const [widgetSettings, setWidgetSettings] = useState<ComponentSettings>(defaultWidgetSettings)
  const [showStats, setShowStats] = useState<boolean>(false)

  const [loadingText, setLoadingText] = useState(false)

  const startTimestamp = useRef<number>(0)
  const keyEventQueue = useRef<KeyEvent[]>([])
  const mistypedRef = useRef<Record<string, Record<string, number>>>({})

  function useAlwaysFocus(ref: React.RefObject<HTMLElement>) {
    useEffect(() => {
      const focusInput = () => {
        if (ref.current) ref.current.focus()
      }

      // Focus on mount
      focusInput()

      // Refocus when user navigates back or tab switches
      const handleVisibility = () => {
        if (!document.hidden) focusInput()
      }

      document.addEventListener('visibilitychange', handleVisibility)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }, [ref])
  }

  const fetchNextText = useCallback(async () => {
    const { text, source } = await fetchTypingString(
      widgetSettings.minWordLength,
      widgetSettings.maxWordLength
    )
    dispatch({ type: 'SET_TEXT', payload: text })

    if (source !== 'server') {
      showAlert({
        title: 'Using local practice text',
        message:
          source === 'hardcoded-fallback'
            ? 'Couldn’t reach the server or load the corpus. Using fallback text.'
            : 'Server is unavailable, loading text from your local corpus.',
        type: AlertType.WARNING,
      })
    }
  }, [])

  const handleCloseStats = () => {
    setShowStats(false)

    startTimestamp.current = 0
    keyEventQueue.current = []
    dispatch({ type: 'RESET_SESSION', payload: null })

    setLoadingText(false)

    // Focus input
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const onComplete = useCallback(async () => {
    if (!state.text) return
    dispatch({ type: 'SESSION_COMPLETE' })

    const now = Date.now()
    const elapsedTime = now - startTimestamp.current

    dispatch({ type: 'SET_STOPWATCH_TIME', payload: elapsedTime })

    const sessionStats = calculateTypingSessionStats(
      keyEventQueue.current,
      startTimestamp.current,
      now
    )

    dispatch({ type: 'UPDATE_STATS', payload: sessionStats })

    // Show modal immediately
    setShowStats(true)
    setLoadingText(true)

    // Fetch next text **in background**, don't await here
    fetchNextText()

    // Save stats in background
    if (token) {
      void (async () => {
        try {
          await saveStats(
            { ...sessionStats, startTime: startTimestamp.current, endTime: now },
            token
          )
        } catch (err) {
          console.error('Failed to save stats', err)
          showAlert({
            title: 'Failed to save stats',
            message: getReadableErrorMessage(err),
            type: AlertType.ERROR,
          })
        }
      })()
    }
  }, [fetchNextText, showAlert, state.text, token])

  const onType = ({ key, typedStatus, cursorIndex, timestamp, action }: OnTypeParams) => {
    if (key === 'Escape') return
    if (state.phase === 'idle') {
      dispatch({ type: 'SESSION_START' })
      startTimestamp.current = Date.now()
      keyEventQueue.current = []
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
    dispatch({ type: 'SESSION_COMPLETE' })
    dispatch({ type: 'SET_STOPWATCH_TIME', payload: 0 })
  }

  const handleSaveSettings = (next: ComponentSettings) => {
    const { minWordLength: oldMin, maxWordLength: oldMax } = widgetSettings
    const { minWordLength: newMin, maxWordLength: newMax } = next

    setWidgetSettings(next)

    showAlert({
      type: AlertType.SUCCESS,
      title: 'Settings Updated',
      message: 'Your preferences have been updated.',
    })

    // Only fetch if min or max actually changed
    if (oldMin !== newMin || oldMax !== newMax) {
      // Clear current text so old text disappears immediately
      dispatch({ type: 'SET_TEXT', payload: '' })
      setLoadingText(true)

      fetchTypingString(newMin, newMax)
        .then(({ text }) => {
          dispatch({ type: 'SET_TEXT', payload: text })
        })
        .finally(() => {
          setLoadingText(false)
          // refocus after new text is loaded
          requestAnimationFrame(() => inputRef.current?.focus())
        })
    } else {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  // Autofocus after text changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [state.text])

  useEffect(() => {
    if (!(state.phase === 'running')) return

    let rafId: number

    const tick = () => {
      const diff = Date.now() - startTimestamp.current
      dispatch({ type: 'SET_STOPWATCH_TIME', payload: diff })

      if (diff >= Number(widgetSettings.testDuration) * 1000) {
        onComplete()
        return
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    requestAnimationFrame(() => inputRef.current?.focus())

    return () => cancelAnimationFrame(rafId)
  }, [state.phase, widgetSettings.testDuration, onComplete])

  useEffect(() => {
    if (!showStats) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.phase !== 'running') {
        e.preventDefault()
        handleCloseStats()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showStats])

  useEffect(() => {
    const savedText = localStorage.getItem(LOCAL_STORAGE_TEXT_KEY)

    if (savedText) {
      // Use saved text immediately
      dispatch({ type: 'SET_TEXT', payload: savedText })
    } else {
      // Otherwise fetch a new one and store in nextText

      fetchNextText()
      // dispatch({ type: 'RESET_SESSION', payload: nextText })
    }
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  return (
    <article className="justify-center items-center flex flex-col select-none pt-2 space-y-6">
      <Toolbar
        settings={widgetSettings}
        onChange={(next: any) => handleSaveSettings(next)}
        // onOpenChange={(open) => setIsSettingsOpen(open)}
      />
      <TypingWidget
        inputRef={inputRef}
        onType={onType}
        textToType={state.text}
        elapsed={state.stopWatchTime}
        widgetSettings={widgetSettings}
        isRunning={state.phase === 'running'}
        loadingText={loadingText}
        handleBlurReset={handleBlurReset}
        useAlwaysFocus={useAlwaysFocus}
        disabled={showStats}
      />
      <Modal
        title={formatDateTime(startTimestamp.current)}
        isOpen={showStats}
        onClose={handleCloseStats}
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
    </article>
  )
}
